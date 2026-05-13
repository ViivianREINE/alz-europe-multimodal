"""
RIMN MVP Training Script
Train: projection layers + cross-attention fusion + task heads
Freeze: DeBERTa-v3-base + CLIP ViT-L/14
Dataset: ScienceQA (primary)
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from pathlib import Path
import logging
import json
import sys
import os

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ml.models.rimn_mvp import RIMNMultimodalFusion
from ml.data.dataset import get_scienceqa_loaders

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
CFG = {
    "batch_size": 16,
    "grad_accum_steps": 2,          # effective batch = 32
    "epochs": 10,
    "lr": 2e-4,
    "weight_decay": 0.01,
    "warmup_steps": 200,
    "max_grad_norm": 1.0,
    "latent_dim": 512,
    "num_choices": 4,
    "use_amp": torch.cuda.is_available(),
    "device": "cuda" if torch.cuda.is_available() else "cpu",
    "checkpoint_dir": "ml/checkpoints",
    "results_dir": "ml/results",
    "max_train_samples": None,       # Set to 1000 for quick smoke test
    "max_val_samples": 500,
    "patience": 3,
}


def get_optimizer_and_scheduler(model, num_training_steps):
    # Only optimize trainable params (projections + fusion + heads)
    trainable = [p for p in model.parameters() if p.requires_grad]
    logger.info(f"Trainable params: {sum(p.numel() for p in trainable):,}")

    optimizer = optim.AdamW(trainable, lr=CFG["lr"], weight_decay=CFG["weight_decay"])

    def lr_lambda(step):
        if step < CFG["warmup_steps"]:
            return step / max(1, CFG["warmup_steps"])
        progress = (step - CFG["warmup_steps"]) / max(1, num_training_steps - CFG["warmup_steps"])
        return max(0.0, 0.5 * (1.0 + torch.cos(torch.tensor(3.14159 * progress)).item()))

    scheduler = optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
    return optimizer, scheduler


def evaluate(model, loader, device):
    model.eval()
    total, correct = 0, 0
    with torch.no_grad():
        for batch in loader:
            output = model(batch["questions"], batch["images"], device)
            preds = output.logits.argmax(dim=-1).cpu()
            labels = batch["answer_idxs"]
            correct += (preds == labels).sum().item()
            total += len(labels)
    return correct / total if total > 0 else 0.0


def train():
    device = torch.device(CFG["device"])
    logger.info(f"Training on: {device}")

    Path(CFG["checkpoint_dir"]).mkdir(parents=True, exist_ok=True)
    Path(CFG["results_dir"]).mkdir(parents=True, exist_ok=True)

    # ── Data ──────────────────────────────────────────────────────────────────
    train_loader, val_loader, test_loader = get_scienceqa_loaders(
        batch_size=CFG["batch_size"],
        max_train=CFG["max_train_samples"],
        max_val=CFG["max_val_samples"],
    )

    # ── Model ─────────────────────────────────────────────────────────────────
    model = RIMNMultimodalFusion(
        num_choices=CFG["num_choices"],
        latent_dim=CFG["latent_dim"],
    ).to(device)

    logger.info(f"Total params:     {model.count_total_params():,}")
    logger.info(f"Trainable params: {model.count_trainable_params():,}")

    # ── Optimizer ─────────────────────────────────────────────────────────────
    num_steps = len(train_loader) * CFG["epochs"] // CFG["grad_accum_steps"]
    optimizer, scheduler = get_optimizer_and_scheduler(model, num_steps)
    scaler = GradScaler(enabled=CFG["use_amp"])

    loss_fn = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_val_acc = 0.0
    patience_counter = 0
    history = []

    for epoch in range(1, CFG["epochs"] + 1):
        model.train()
        total_loss = 0.0
        optimizer.zero_grad()

        for step, batch in enumerate(train_loader):
            with autocast(enabled=CFG["use_amp"]):
                output = model(batch["questions"], batch["images"], device)
                labels = batch["answer_idxs"].to(device)
                loss = loss_fn(output.logits, labels)
                loss = loss / CFG["grad_accum_steps"]

            scaler.scale(loss).backward()
            total_loss += loss.item() * CFG["grad_accum_steps"]

            if (step + 1) % CFG["grad_accum_steps"] == 0:
                scaler.unscale_(optimizer)
                nn.utils.clip_grad_norm_(model.parameters(), CFG["max_grad_norm"])
                scaler.step(optimizer)
                scaler.update()
                scheduler.step()
                optimizer.zero_grad()

            if step % 50 == 0:
                logger.info(f"Epoch {epoch} | Step {step}/{len(train_loader)} | Loss: {loss.item()*CFG['grad_accum_steps']:.4f}")

        avg_loss = total_loss / len(train_loader)
        val_acc = evaluate(model, val_loader, device)
        logger.info(f"Epoch {epoch} | Loss: {avg_loss:.4f} | Val Acc: {val_acc:.4f}")

        history.append({"epoch": epoch, "loss": avg_loss, "val_acc": val_acc})

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            ckpt_path = f"{CFG['checkpoint_dir']}/rimn_mvp_best.pt"
            torch.save(model.state_dict(), ckpt_path)
            logger.info(f"New best model saved: val_acc={val_acc:.4f}")
        else:
            patience_counter += 1
            if patience_counter >= CFG["patience"]:
                logger.info(f"Early stopping at epoch {epoch}")
                break

    # ── Final Test Evaluation ─────────────────────────────────────────────────
    logger.info("Attempting to load best checkpoint for test evaluation...")
    try:
        model.load_state_dict(torch.load(f"{CFG['checkpoint_dir']}/rimn_mvp_best.pt", map_location=device))
    except FileNotFoundError:
        logger.warning("No best checkpoint found! Saving the current model state as best.")
        torch.save(model.state_dict(), f"{CFG['checkpoint_dir']}/rimn_mvp_best.pt")

    test_acc = evaluate(model, test_loader, device)
    logger.info(f"Final Test Accuracy: {test_acc:.4f} ({test_acc*100:.1f}%)")

    results = {"best_val_acc": best_val_acc, "test_acc": test_acc, "history": history, "config": CFG}
    with open(f"{CFG['results_dir']}/training_results.json", "w") as f:
        json.dump(results, f, indent=2)

    logger.info("Training complete.")
    return results


if __name__ == "__main__":
    train()
