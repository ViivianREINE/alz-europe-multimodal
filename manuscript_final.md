# The Rise of Alzheimer’s Disease in Europe: Psychological and Social Impacts—A Multimodal Psychosocial Explainable AI Framework (MPEAF)

**Authors**: Priyam Parashar¹, Aabha Parag Tembhurne¹, G. Daksha Reddy¹, Aditya Raj¹, and Dr. C. Bindu Ashwini¹

¹Department of Humanities and Social Sciences, RV College of Engineering, Bengaluru 560059, India

Applied Psychology for Engineers (HS266TEW)  |  Faculty Guide: Dr. C. Bindu Ashwini
Corresponding author: binduashwini@rvce.edu.in

---

**Abstract**—Alzheimer’s disease (AD) represents one of the most consequential public‑health crises confronting European societies, with epidemiological projections estimating a near‑doubling of prevalence to approximately 14 million cases by 2050 at an annual societal cost exceeding €300 billion. Despite dramatic advances in neuroimaging, genomic profiling, and computational prediction, the psychosocial determinants of disease onset and acceleration—particularly chronic loneliness, social isolation, and attenuated lifestyle engagement—remain systematically excluded from AI‑driven risk‑stratification pipelines. Longitudinal evidence demonstrates that social isolation independently elevates dementia hazard by 37 % (HR = 1.37), while the co‑occurrence of loneliness with subsyndromal depression amplifies risk two‑fold (HR = 2.01). A systematic review of 78 multimodal AI studies confirms psychosocial variables are absent from every reviewed model and that only 7 % include any explainability mechanism. The present work addresses this critical gap by introducing the **Multimodal Psychosocial Explainable AI Framework (MPEAF)**, which fuses structural MRI, PET, polygenic risk scores, cognitive assessments, and a purpose‑designed 28‑item Psychosocial Risk Questionnaire (PRQ‑28) within a Bayesian deep‑learning ensemble. The architecture deploys modality‑specific encoders—3‑D ResNet‑18 for volumetric imaging, Vision Transformer (ViT‑B/16) for functional PET, ClinicalBERT for clinical notes, and XGBoost / LightGBM for tabular psychosocial features—unified via a Bayesian multimodal fusion layer with calibrated uncertainty quantification. Evaluated on ADNI, OASIS‑3, UK Biobank, and SHARE cohorts (N = 6 300), MPEAF achieves **AUC = 0.924 (95 % CI: 0.903 – 0.945)** for MCI‑to‑AD conversion, with psychosocial features contributing **42.2 %** of cumulative SHAP attribution. An open‑source, web‑based clinical decision‑support platform built on Next.js and FastAPI provides real‑time inference, SHAP explanations, Grad‑CAM saliency maps, and counterfactual psychosocial risk simulations, offering clinicians actionable, human‑interpretable dementia risk assessments.

**Index Terms**—Alzheimer’s disease, Bayesian deep learning, counterfactual simulation, explainable AI, Grad‑CAM, loneliness, multimodal fusion, psychosocial risk, SHAP, social isolation, Vision Transformer, XGBoost.

---

*The full manuscript (including Tables I–VI, equations, and references) is available at the GitHub repository:* **https://github.com/ViivianREINE/alz-europe-multimodal**
