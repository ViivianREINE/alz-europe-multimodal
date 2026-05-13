"""
RIMN Advanced Training Loop
Targets 90%+ accuracy on ScienceQA via multimodal fusion training.
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from ml.models.rimn_mvp import RIMN_MVP
from ml.data.dataset import ScienceQADataset
import wandb # Optional but elite for tracking
from tqdm import tqdm

# Hyperparameters for Elite Performance
CONFIG = {
    "lr": 2e-5,
    "batch_size": 16,
    "epochs": 20,
    "warmup_steps": 500,
    "weight_decay": 0.01,
    "device": "cuda" if torch.cuda.is_available() else "cpu"
}

def train():
    device = CONFIG["device"]
    print(f"Starting Elite Training on {device}...")
    
    # Load Dataset
    train_dataset = ScienceQADataset(split="train")
    val_dataset = ScienceQADataset(split="val")
    
    train_loader = DataLoader(train_dataset, batch_size=CONFIG["batch_size"], shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=CONFIG["batch_size"], shuffle=False, num_workers=4)
    
    # Initialize Model
    model = RIMN_MVP().to(device)
    
    # Optimizer & Scheduler (AdamW is standard for elite models)
    optimizer = optim.AdamW(model.parameters(), lr=CONFIG["lr"], weight_decay=CONFIG["weight_decay"])
    criterion = nn.CrossEntropyLoss()
    
    # Training Loop
    best_acc = 0.0
    
    for epoch in range(CONFIG["epochs"]):
        model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{CONFIG['epochs']}")
        for batch in pbar:
            # Move to device
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            pixel_values = batch['pixel_values'].to(device) if 'pixel_values' in batch else None
            labels = batch['label'].to(device)
            
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                pixel_values=pixel_values
            )
            
            logits = outputs['qa_logits']
            loss = criterion(logits, labels)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            _, predicted = logits.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            pbar.set_postfix({"Loss": f"{loss.item():.4f}", "Acc": f"{100.*correct/total:.2f}%"})

        # Validation
        val_acc = evaluate(model, val_loader, device)
        print(f"Validation Accuracy: {val_acc:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            print(f"New Best Accuracy: {best_acc:.2f}%! Saving model...")
            torch.save(model.state_dict(), "d:/RVCE-6th-SEM/EL-MAIN/rimn/ml/checkpoints/rimn_best.pth")

def evaluate(model, loader, device):
    model.eval()
    correct = 0
    total = 0
    with torch.no_state_dict():
        for batch in loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            pixel_values = batch['pixel_values'].to(device) if 'pixel_values' in batch else None
            labels = batch['label'].to(device)
            
            outputs = model(input_ids, attention_mask, pixel_values)
            _, predicted = outputs['qa_logits'].max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
    return 100. * correct / total

if __name__ == "__main__":
    train()
