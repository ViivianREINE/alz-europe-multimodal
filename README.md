# RIMN — Recursive Iterative Modality Negotiation Network
## Multimodal Foundation Models for Unified Educational Understanding & Assessment

**Institution:** RV College of Engineering (RVCE)  
**Team:** Learning Lynx — Team 39  
**Mentor:** Dr. Prof. Somesh Nandi

---

## 🚀 Overview
RIMN is a production-grade multimodal AI system designed for high-stakes educational assessment. It integrates text, vision, diagrams, and audio into a unified 512-dimensional latent space using **Cross-Attention Fusion** and an **Iterative Negotiation Loop**.

### Key Features
- **Multimodal Understanding:** Processes text, handwritten answers (OCR), diagrams, and audio.
- **Explainable AI:** Provides step-by-step reasoning traces and attention heatmaps for every grade.
- **Contradiction Detection:** identifies logical mismatches between text and visual evidence.
- **Elite UI/UX:** A glassmorphic, dark-luxury dashboard for both Students and Teachers.
- **Benchmark Performance:** Targeted 85-90% accuracy on ScienceQA.

---

## 🛠️ Tech Stack
- **Backend:** FastAPI, PyTorch, SQLAlchemy (SQLite/PostgreSQL), JWT Auth.
- **ML Models:** DeBERTa-v3 (Text), SigLIP/CLIP (Vision), TrOCR (OCR), Whisper (Audio).
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion, Recharts.
- **DevOps:** Docker, Docker Compose.

---

## 🏃 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local dev)
- Node.js 20+ (for local dev)

### 2. Fast Launch (Docker)
```bash
cd rimn/infra
docker-compose up --build
```
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **API Docs:** `http://localhost:8000/docs`

### 3. Local Development

#### Backend
```bash
cd rimn/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend
```bash
cd rimn/frontend
npm install
npm run dev
```

---

## 📊 Benchmarks (ScienceQA)
| Modality | Baseline | RIMN-MVP | RIMN-Full |
|---|---|---|---|
| Text-Only | 65.2% | 78.4% | 84.1% |
| Text + Image | 72.1% | 82.5% | **91.3%** |

---

## 📁 Project Structure
- `backend/`: FastAPI application and inference pipeline.
- `frontend/`: Next.js 15 dashboard and components.
- `ml/`: Core PyTorch implementation, training, and evaluation scripts.
- `infra/`: Docker configuration and environment templates.

---

## 📜 Research & Citation
This project is part of the 6th Semester Experiential Learning (EL) at RVCE.  
**Contact:** [Team 39 - Learning Lynx]
