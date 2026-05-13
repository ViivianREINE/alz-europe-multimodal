"""
RIMN Dataset Downloader
Downloads ScienceQA, AI2D, and other required datasets for 90%+ accuracy training.
"""
import os
import requests
import zipfile
import tarfile
from tqdm import tqdm

DATA_DIR = "d:/RVCE-6th-SEM/EL-MAIN/rimn/ml/data/raw"

DATASETS = {
    "ScienceQA": "https://github.com/lupantech/ScienceQA/archive/refs/heads/main.zip",
    "AI2D": "https://allenai.org/datasets/ai2d-v0.zip",  # Note: Requires specific access or manual download usually, using public mirror if available
}

def download_file(url, dest_path):
    print(f"Downloading {url}...")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024
    
    with open(dest_path, 'wb') as f, tqdm(total=total_size, unit='iB', unit_scale=True) as pbar:
        for data in response.iter_content(block_size):
            f.write(data)
            pbar.update(len(data))

def extract_file(file_path, extract_dir):
    print(f"Extracting {file_path} to {extract_dir}...")
    if file_path.endswith(".zip"):
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
    elif file_path.endswith(".tar.gz") or file_path.endswith(".tgz"):
        with tarfile.open(file_path, 'r:gz') as tar_ref:
            tar_ref.extractall(extract_dir)

def main():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    for name, url in DATASETS.items():
        dest_path = os.path.join(DATA_DIR, f"{name}.zip")
        if not os.path.exists(dest_path):
            try:
                download_file(url, dest_path)
                extract_file(dest_path, os.path.join(DATA_DIR, name))
            except Exception as e:
                print(f"Failed to download {name}: {e}")
        else:
            print(f"{name} already exists.")

if __name__ == "__main__":
    main()
