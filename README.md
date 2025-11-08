# 🧠 Virtual Brain Interpretation System (VBIS)

**"Bridging the Gap in Neural Simulation through AI-Driven Natural Language Understanding"**

---

## 📖 Overview

The **Virtual Brain Interpretation System (VBIS)** is an **AI-powered neuro-simulation and interpretation framework** that transforms raw, high-dimensional neural activity data into **human-readable insights**.

Traditional neural simulations are **computationally intensive** and generate **complex numerical outputs** that are hard to interpret.  
VBIS addresses this by integrating **amortized personalization** for efficient simulation and **FLAN-T5** for human-understandable language generation.

> **Goal:** Make computational brain dynamics accessible, explainable, and privacy-preserving.

---

## 🚀 Our Solution

VBIS (Virtual Brain Interpretation System) converts complex neural simulations into **clear, interpretable insights** using **AI-driven natural language generation**.

By employing an **amortized personalization framework**, it enables **efficient, scalable, and privacy-preserving neuro-simulation**, bridging the gap between **computational outputs** and **human understanding**.

---

## 🧩 System Architecture Overview

**Workflow:**

1. **Connectome Input**  
   - Multi-atlas brain connectivity data (86–463 nodes)

2. **CrossCoder Harmonization**  
   - Converts diverse connectomes into a **unified 16D latent representation**

3. **NeuroCore Simulation**  
   - Executes the **Montbrió–Pazó–Roxin neural mass model**

4. **Feature Extraction**  
   - Computes mean firing rate across all nodes

5. **State Detection**  
   - Classifies brain activity states: *Low*, *Normal*, *Hyperactive*

6. **NLP Interpretation (FLAN-T5)**  
   - Translates numerical results into **natural-language summaries**

---

## 🧠 Core Technical Components

### 🧬 **1. CrossCoder Harmonization**
- Harmonizes variable connectome parcellations into a **16-dimensional latent space**  
- Decodes into a **canonical 463-node representation** for uniform simulation

### ⚡ **2. NeuroCore Simulation Engine**
- Implements the **Montbrió–Pazó–Roxin Neural Mass Model**
- Simulates **membrane potentials** and **firing rates** across brain nodes
- Parameters: coupling (k), noise (D), connectivity (Wᵢⱼ), intrinsic neuron constants (η, Δ, J)

### 💬 **3. FLAN-T5 Language Generation**
- Converts numerical neural states into **human-readable English explanations**
- Enables clinical interpretability for researchers and practitioners

---

## 🧮 Mathematical Foundation

**CrossCoder Encoding:**
\[
z = E(x), \quad \hat{x} = D(z)
\]
where \( z \in \mathbb{R}^{16} \) harmonizes variable connectomes.

**Neural Mass Dynamics:**
\[
\frac{dr_i}{dt} = \frac{\Delta}{\pi} + 2r_i v_i
\]
\[
\frac{dv_i}{dt} = v_i^2 + \eta + J r_i + k \sum_j W_{ij} r_j + D\xi(t)
\]

**State Classification Logic:**
- Low:  mean_r < 0.2  
- Normal:  0.2 ≤ mean_r ≤ 0.5  
- Hyperactive:  mean_r > 0.5  

---

## 💻 Technology Stack

### 🧩 **Full-Stack Architecture**
| Layer | Technologies | Description |
|--------|---------------|-------------|
| **Frontend** | React.js | Responsive multilingual user interface |
| **Backend** | Node.js + Express | API routing, data flow, and middleware |
| **ML Layer** | FastAPI (Python) | CrossCoder, NeuroCore, FLAN-T5 integration |
| **AI/ML Frameworks** | PyTorch, Transformers, Scikit-learn | Model implementation and inference |
| **Databases / Storage** | MongoDB (metadata), Firebase (auth & real-time sync) | Data persistence and user management |
| **Development Tools** | Jupyter, VS Code, Postman, GitHub | Development, testing, and version control |

---

## 🔁 Workflow (Data Flow)

**User → React.js Frontend → Node.js + Express → FastAPI (ML Layer: CrossCoder + NeuroCore + FLAN-T5) → MongoDB / Firebase → Node.js + Express → React.js (Results Display)**

### Step-by-Step:
1. **User Input:** User uploads connectome or simulation data.  
2. **Backend Routing:** Node.js validates and sends it to the ML API.  
3. **Processing:** FastAPI executes CrossCoder, NeuroCore, and FLAN-T5 modules.  
4. **Storage:** Results stored in MongoDB; Firebase syncs user session data.  
5. **Visualization:** React frontend displays classification + AI-generated report.

---

## 📊 Results & Improvements

### **Performance Metrics**
| Metric | Value | Description |
|--------|--------|-------------|
| Processing Time | ~6.3s | Average per connectome |
| Confusion Rate | 1.9 | CrossCoder harmonization |
| NLP Coherence (BLEU) | 0.81 | FLAN-T5 text generation |

### **Key Innovations**
- Integration of **FLAN-T5** for domain-specific interpretability  
- **Three-state brain classification** (Low / Normal / Hyperactive)  
- **Hybrid MERN + FastAPI modular architecture**  
- **End-to-end automation** from raw connectome → text interpretation  

---

## 🌍 Applications & Impact

- **🧠 Research Acceleration:** Enables rapid hypothesis testing in neuroscience  
- **💊 Drug Response Simulation:** Supports predictive modeling for pharmaceutical R&D  
- **🏥 Clinical Decision Support:** Provides explainable brain state insights for diagnostics  

---

## 🧩 Development & Tools

- **ML Development:** Jupyter Notebooks, PyTorch  
- **API Testing:** Postman  
- **Code Editor:** Visual Studio Code  
- **Version Control:** Git & GitHub  
- **Deployment:** Streamlit Cloud / Render / Firebase Hosting  

---

## 👥 Team

**Group ID:** G-623  
**Mentor:** *K. Navatha*  
**Team Members:**
- M. Prathik (Lead Developer, ML Integration)  
- K. Krithika (Frontend & Firebase Integration)  
- A. Eshwar (Backend & API Development)  
- S. Kashyap (Data Modeling & Visualization)  
- T. Avigna (Testing & Documentation)  

---

## 🏁 Summary

VBIS demonstrates how **AI interpretability** can make **neural simulations human-readable**, combining **amortized personalization** and **language generation** for accessible neuroscience.  
It bridges the gap between **complex computational models** and **intuitive human insight** — redefining how virtual brain systems are studied and understood.

---

### 🧾 License
This project is released under the **MIT License**.  
Feel free to use, modify, and cite with credit to the original authors.

---

### ⭐ Acknowledgement
This work was developed as part of the **VBIT AI Research Project** under the guidance of **Mentor K. Navatha**.
