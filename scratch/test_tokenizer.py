from transformers import AutoTokenizer
try:
    print("Attempting to load tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained("microsoft/deberta-v3-base")
    print("Tokenizer loaded successfully!")
except Exception as e:
    print(f"Failed to load tokenizer: {e}")
