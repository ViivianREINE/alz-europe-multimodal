"""
Cross-Attention Fusion Module
Text queries attend over vision (and future modalities).
This is the core RIMN fusion — NOT concatenation.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional


class CrossModalAttentionFusion(nn.Module):
    """
    Cross-attention where:
      Query  = text representation  [batch, latent_dim]
      Key/V  = vision representation [batch, latent_dim]

    Returns fused representation + attention weights for explainability.
    """

    def __init__(self, latent_dim: int = 512, num_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        self.latent_dim = latent_dim
        self.num_heads = num_heads

        # Expand single-token embeddings to sequence form for MHA
        self.text_to_seq = nn.Linear(latent_dim, latent_dim)
        self.vis_to_seq = nn.Linear(latent_dim, latent_dim)

        self.cross_attn = nn.MultiheadAttention(
            embed_dim=latent_dim,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True,
        )
        self.norm1 = nn.LayerNorm(latent_dim)
        self.norm2 = nn.LayerNorm(latent_dim)

        self.ffn = nn.Sequential(
            nn.Linear(latent_dim, latent_dim * 4),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(latent_dim * 4, latent_dim),
        )

        # Gating: how much vision to mix in
        self.gate = nn.Sequential(
            nn.Linear(latent_dim * 2, latent_dim),
            nn.Sigmoid(),
        )

    def forward(
        self,
        text_emb: torch.Tensor,           # [batch, latent_dim]
        vision_emb: torch.Tensor,          # [batch, latent_dim]
        vision_mask: Optional[torch.Tensor] = None,  # [batch] bool
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Returns:
            fused: [batch, latent_dim]
            attn_weights: [batch, 1, 1] — for explainability
        """
        batch = text_emb.size(0)

        # Reshape to sequence format: [batch, 1, latent_dim]
        q = self.text_to_seq(text_emb).unsqueeze(1)
        kv = self.vis_to_seq(vision_emb).unsqueeze(1)

        # Key padding mask: True = IGNORE (opposite of our mask)
        key_padding_mask = None
        if vision_mask is not None:
            key_padding_mask = ~vision_mask  # [batch]

        # Recursive Iterative Cross-Attention
        num_iterations = 2  # RIMN specific: iterative negotiation
        text_attended = text_emb
        
        for _ in range(num_iterations):
            q = self.text_to_seq(text_attended).unsqueeze(1)
            attn_out, attn_weights = self.cross_attn(
                query=q,
                key=kv,
                value=kv,
                key_padding_mask=key_padding_mask,
            )
            attn_out = attn_out.squeeze(1)

            # Residual + norm
            text_attended = self.norm1(text_attended + attn_out)

            # FFN
            ffn_out = self.ffn(text_attended)
            text_attended = self.norm2(text_attended + ffn_out)

        # Adaptive gate: blend text-only with text+vision
        gate_input = torch.cat([text_emb, text_attended], dim=-1)
        gate = self.gate(gate_input)                    # [batch, 512]
        fused = gate * text_attended + (1 - gate) * text_emb

        return fused, attn_weights  # [batch, 512], [batch, 1, 1]


class ModalityImportanceScorer(nn.Module):
    """
    Computes soft importance scores for each modality.
    Used for explainability: 'text contributed 60%, vision 40%'
    """

    def __init__(self, latent_dim: int = 512, num_modalities: int = 2):
        super().__init__()
        self.scorer = nn.Sequential(
            nn.Linear(latent_dim * num_modalities, 128),
            nn.ReLU(),
            nn.Linear(128, num_modalities),
            nn.Softmax(dim=-1),
        )

    def forward(self, *embeddings: torch.Tensor) -> torch.Tensor:
        """Returns [batch, num_modalities] importance scores"""
        concat = torch.cat(embeddings, dim=-1)
        return self.scorer(concat)
