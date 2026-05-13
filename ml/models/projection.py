"""
Modality Projection Layers
Projects each encoder's output to unified 512-d latent space.
These ARE trainable.
"""
import torch
import torch.nn as nn


class ModalityProjection(nn.Module):
    """
    Two-layer MLP projection: input_dim → hidden → latent_dim
    With LayerNorm + GELU activation + Dropout
    """

    def __init__(self, input_dim: int, latent_dim: int = 512, dropout: float = 0.1):
        super().__init__()
        hidden_dim = (input_dim + latent_dim) // 2
        self.proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, latent_dim),
            nn.LayerNorm(latent_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.proj(x)


class MultiModalProjections(nn.Module):
    """
    Container for all modality projections.
    Each modality gets its own projection MLP → 512-d.
    """

    def __init__(self, latent_dim: int = 512):
        super().__init__()
        self.latent_dim = latent_dim

        # Text: DeBERTa-v3-base → 768
        self.text_proj = ModalityProjection(768, latent_dim)

        # Vision: CLIP ViT-L/14 → 768
        self.vision_proj = ModalityProjection(768, latent_dim)

        # No-image learned token (when image is missing)
        self.no_image_token = nn.Parameter(torch.zeros(1, latent_dim))
        nn.init.normal_(self.no_image_token, std=0.02)

        # No-audio learned token (when audio is missing)
        self.no_audio_token = nn.Parameter(torch.zeros(1, latent_dim))
        nn.init.normal_(self.no_audio_token, std=0.02)

    def project_text(self, text_emb: torch.Tensor) -> torch.Tensor:
        """[batch, 768] → [batch, 512]"""
        return self.text_proj(text_emb)

    def project_vision(
        self, vision_emb: torch.Tensor, vision_mask: torch.Tensor
    ) -> torch.Tensor:
        """
        vision_emb: [batch, 768]
        vision_mask: [batch] bool — True if image present
        Returns: [batch, 512]
        """
        batch_size = vision_emb.size(0)
        projected = self.vision_proj(vision_emb)  # [batch, 512]

        # Replace missing image embeddings with learned no_image_token
        no_img = self.no_image_token.expand(batch_size, -1)  # [batch, 512]
        mask = vision_mask.unsqueeze(-1).float()              # [batch, 1]
        return projected * mask + no_img * (1 - mask)

    def forward(
        self,
        text_emb: torch.Tensor,
        vision_emb: torch.Tensor,
        vision_mask: torch.Tensor,
    ) -> dict[str, torch.Tensor]:
        return {
            "text": self.project_text(text_emb),
            "vision": self.project_vision(vision_emb, vision_mask),
        }
