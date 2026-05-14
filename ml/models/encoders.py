"""
RIMN Frozen Encoder Wrappers
DeBERTa-v3-base (text) + CLIP ViT-L/14 (vision)
All encoders are FROZEN — only projection layers are trained.
"""
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
import open_clip
from PIL import Image
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)


class FrozenTextEncoder(nn.Module):
    """
    DeBERTa-v3-base frozen text encoder.
    Output: [batch, seq_len, 768] → mean pooled → [batch, 768]
    """

    def __init__(self, model_name: str = "microsoft/deberta-v3-base"):
        super().__init__()
        logger.info(f"Loading text encoder: {model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
        self.model = AutoModel.from_pretrained(model_name)
        self.hidden_size = 768

        # Freeze all parameters
        for param in self.model.parameters():
            param.requires_grad = False

        logger.info("Text encoder loaded and frozen.")

    @torch.no_grad()
    def encode(
        self,
        texts: list[str],
        device: torch.device,
        max_length: int = 512,
    ) -> torch.Tensor:
        """Returns mean-pooled text embeddings [batch, 768]"""
        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length,
        ).to(device)

        outputs = self.model(**inputs)
        # Mean pool over sequence (excluding padding)
        attention_mask = inputs["attention_mask"].unsqueeze(-1).float()
        embeddings = (outputs.last_hidden_state * attention_mask).sum(1)
        embeddings = embeddings / attention_mask.sum(1).clamp(min=1e-9)
        return embeddings  # [batch, 768]

    def forward(self, texts: list[str], device: torch.device) -> torch.Tensor:
        return self.encode(texts, device)


class FrozenVisionEncoder(nn.Module):
    """
    OpenCLIP ViT-L/14 frozen vision encoder.
    Output: [batch, 768]
    """

    def __init__(self, model_name: str = "ViT-L-14", pretrained: str = "openai"):
        super().__init__()
        logger.info(f"Loading vision encoder: {model_name} ({pretrained})")
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained
        )
        self.hidden_size = self.model.visual.output_dim  # 768 for ViT-L/14

        # Freeze all parameters
        for param in self.model.parameters():
            param.requires_grad = False

        logger.info("Vision encoder loaded and frozen.")

    @torch.no_grad()
    def encode(
        self, images: list[Optional[Image.Image]], device: torch.device
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Returns:
            embeddings: [batch, 768] — global image embeddings
            mask: [batch] bool — True if image present, False if missing
        """
        batch_size = len(images)
        embeddings = torch.zeros(batch_size, self.hidden_size, device=device)
        mask = torch.zeros(batch_size, dtype=torch.bool, device=device)

        valid_indices = [i for i, img in enumerate(images) if img is not None]
        if valid_indices:
            valid_images = torch.stack([
                self.preprocess(images[i]) for i in valid_indices
            ]).to(device)
            valid_embeds = self.model.encode_image(valid_images).float()
            for j, i in enumerate(valid_indices):
                embeddings[i] = valid_embeds[j]
                mask[i] = True

        return embeddings, mask

    def forward(
        self, images: list[Optional[Image.Image]], device: torch.device
    ) -> tuple[torch.Tensor, torch.Tensor]:
        return self.encode(images, device)
