"""
ScienceQA Dataset Integration
Loads and preprocesses ScienceQA via HuggingFace datasets.
"""
import torch
from torch.utils.data import Dataset, DataLoader
from datasets import load_dataset
from PIL import Image
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ScienceQADataset(Dataset):
    def __init__(self, split="train", cache_dir=None, max_samples=None):
        logger.info(f"Loading ScienceQA [{split}]...")
        self.dataset = load_dataset(
            "derek-thomas/ScienceQA", split=split,
            cache_dir=cache_dir, trust_remote_code=True,
        )
        if max_samples:
            self.dataset = self.dataset.select(range(min(max_samples, len(self.dataset))))
        logger.info(f"ScienceQA [{split}]: {len(self.dataset)} samples.")

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        s = self.dataset[idx]
        context = s.get("hint", "") or s.get("lecture", "") or ""
        question = f"Context: {context}\n\nQuestion: {s['question']}" if context else s["question"]
        choices = list(s["choices"])
        while len(choices) < 4:
            choices.append("")
        image = None
        if s.get("image"):
            try:
                image = s["image"].convert("RGB")
            except Exception:
                image = None
        return {
            "question": question,
            "choices": choices[:4],
            "answer_idx": int(s["answer"]),
            "image": image,
            "subject": s.get("subject", ""),
            "topic": s.get("topic", ""),
            "has_image": image is not None,
        }


def scienceqa_collate(batch):
    return {
        "questions": [b["question"] for b in batch],
        "choices": [b["choices"] for b in batch],
        "answer_idxs": torch.tensor([b["answer_idx"] for b in batch], dtype=torch.long),
        "images": [b["image"] for b in batch],
        "subjects": [b["subject"] for b in batch],
        "topics": [b["topic"] for b in batch],
        "has_image": torch.tensor([b["has_image"] for b in batch], dtype=torch.bool),
    }


def get_scienceqa_loaders(batch_size=32, cache_dir=None, max_train=None, max_val=None):
    train_ds = ScienceQADataset("train", cache_dir=cache_dir, max_samples=max_train)
    val_ds   = ScienceQADataset("validation", cache_dir=cache_dir, max_samples=max_val)
    test_ds  = ScienceQADataset("test", cache_dir=cache_dir)
    kwargs   = dict(collate_fn=scienceqa_collate, num_workers=0, pin_memory=False)
    return (
        DataLoader(train_ds, batch_size=batch_size, shuffle=True,  **kwargs),
        DataLoader(val_ds,   batch_size=batch_size, shuffle=False, **kwargs),
        DataLoader(test_ds,  batch_size=batch_size, shuffle=False, **kwargs),
    )
