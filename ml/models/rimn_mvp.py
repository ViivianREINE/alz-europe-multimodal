"""
RIMN MVP — Full Model
Frozen Encoders → Projection → Cross-Attention Fusion → Task Heads

This is the complete MVP model:
- Text: DeBERTa-v3-base (frozen)
- Vision: CLIP ViT-L/14 (frozen)
- Fusion: Cross-Attention (trainable)
- Heads: QA classifier + Grading scorer + Contradiction detector
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional
from PIL import Image
from dataclasses import dataclass

from ml.models.encoders import FrozenTextEncoder, FrozenVisionEncoder
from ml.models.projection import MultiModalProjections
from ml.models.fusion import CrossModalAttentionFusion, ModalityImportanceScorer


@dataclass
class RIMNOutput:
    logits: torch.Tensor              # [batch, num_choices] — for QA
    score: torch.Tensor               # [batch, 1] — grading score 0-100
    contradiction_logit: torch.Tensor # [batch, 1] — contradiction probability
    fused_embedding: torch.Tensor     # [batch, 512] — for downstream use
    modality_weights: torch.Tensor    # [batch, 2] — [text_w, vision_w]
    attention_weights: torch.Tensor   # [batch, 1, 1] — cross-attn weights
    confidence: torch.Tensor          # [batch, 1] — prediction confidence


class RIMNMultimodalFusion(nn.Module):
    """
    RIMN MVP — Production-ready multimodal educational AI.

    Architecture:
    1. Frozen text encoder (DeBERTa-v3-base)
    2. Frozen vision encoder (CLIP ViT-L/14)
    3. Trainable projection MLPs → 512-d latent space
    4. Cross-attention fusion (text queries vision)
    5. Modality importance scoring
    6. Task heads: QA / Grading / Contradiction

    Trainable parameters: ~18M
    Frozen parameters: ~400M
    """

    def __init__(
        self,
        num_choices: int = 4,           # ScienceQA has 2-4 choices
        latent_dim: int = 512,
        num_attn_heads: int = 8,
        dropout: float = 0.1,
        text_model: str = "microsoft/deberta-v3-base",
        clip_model: str = "ViT-L-14",
        clip_pretrained: str = "openai",
    ):
        super().__init__()
        self.latent_dim = latent_dim
        self.num_choices = num_choices

        # ── Frozen Encoders ───────────────────────────────────────────────────
        self.text_encoder = FrozenTextEncoder(text_model)
        self.vision_encoder = FrozenVisionEncoder(clip_model, clip_pretrained)

        # ── Trainable Projections → 512-d ─────────────────────────────────────
        self.projections = MultiModalProjections(latent_dim)

        # ── Cross-Attention Fusion ────────────────────────────────────────────
        self.fusion = CrossModalAttentionFusion(latent_dim, num_attn_heads, dropout)

        # ── Modality Importance Scorer ────────────────────────────────────────
        self.importance_scorer = ModalityImportanceScorer(latent_dim, num_modalities=2)

        # ── Task Heads ────────────────────────────────────────────────────────
        # QA head: fused → num_choices
        self.qa_head = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(latent_dim, latent_dim // 2),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(latent_dim // 2, num_choices),
        )

        # Grading head: fused → scalar score [0, 100]
        self.grading_head = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(latent_dim, 256),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(256, 1),
            nn.Sigmoid(),  # Output in [0, 1], multiply by 100 for score
        )

        # Contradiction head: fused → binary
        self.contradiction_head = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(latent_dim, 128),
            nn.GELU(),
            nn.Linear(128, 1),
        )

        # Confidence head: how certain is the model
        self.confidence_head = nn.Sequential(
            nn.Linear(latent_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    def forward(
        self,
        questions: list[str],
        images: list[Optional[Image.Image]],
        device: Optional[torch.device] = None,
    ) -> RIMNOutput:
        if device is None:
            device = next(self.parameters()).device

        # ── 1. Encode ─────────────────────────────────────────────────────────
        text_emb = self.text_encoder.encode(questions, device)        # [B, 768]
        vision_emb, vision_mask = self.vision_encoder.encode(images, device)  # [B, 768], [B]

        # ── 2. Project → 512-d ────────────────────────────────────────────────
        projected = self.projections(text_emb, vision_emb, vision_mask)
        text_latent = projected["text"]      # [B, 512]
        vision_latent = projected["vision"]  # [B, 512]

        # ── 3. Cross-Attention Fusion ─────────────────────────────────────────
        fused, attn_weights = self.fusion(text_latent, vision_latent, vision_mask)

        # ── 4. Modality Importance ────────────────────────────────────────────
        modality_weights = self.importance_scorer(text_latent, vision_latent)

        # ── 5. Task Heads ─────────────────────────────────────────────────────
        logits = self.qa_head(fused)                         # [B, num_choices]
        score = self.grading_head(fused) * 100               # [B, 1] in [0, 100]
        contradiction_logit = self.contradiction_head(fused)  # [B, 1]
        confidence = self.confidence_head(fused)              # [B, 1]

        return RIMNOutput(
            logits=logits,
            score=score,
            contradiction_logit=contradiction_logit,
            fused_embedding=fused,
            modality_weights=modality_weights,
            attention_weights=attn_weights,
            confidence=confidence,
        )

    def predict(
        self,
        questions: list[str],
        images: list[Optional[Image.Image]],
        choices: Optional[list[list[str]]] = None,
        device: Optional[torch.device] = None,
    ) -> list[dict]:
        """High-level inference method returning structured results."""
        self.eval()
        with torch.no_grad():
            output = self.forward(questions, images, device)

        results = []
        batch_size = len(questions)
        for i in range(batch_size):
            pred_idx = output.logits[i].argmax().item()
            probs = F.softmax(output.logits[i], dim=-1).tolist()

            result = {
                "predicted_index": pred_idx,
                "predicted_choice": choices[i][pred_idx] if choices else str(pred_idx),
                "probabilities": probs,
                "score": round(float(output.score[i].item()), 1),
                "confidence": round(float(output.confidence[i].item()), 3),
                "contradiction_probability": round(
                    float(torch.sigmoid(output.contradiction_logit[i]).item()), 3
                ),
                "modality_weights": {
                    "text": round(float(output.modality_weights[i][0].item()), 3),
                    "vision": round(float(output.modality_weights[i][1].item()), 3),
                },
            }
            results.append(result)

        return results

    def count_trainable_params(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

    def count_total_params(self) -> int:
        return sum(p.numel() for p in self.parameters())


RIMN_MVP = RIMNMultimodalFusion
