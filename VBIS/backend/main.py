import io
import asyncio
import numpy as np
import torch
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from transformers import pipeline

from models.crosscoder import load_crosscoder_model, run_crosscoder
from models.neurocore import NeuroCore, vector_to_symmetric_matrix

# ============================================================
# 🚀 FastAPI App Setup
# ============================================================

app = FastAPI(title="Virtual Brain Interface Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🧠 Load Models on Startup
# ============================================================

@app.on_event("startup")
async def startup_event():
    try:
        # Load CrossCoder
        app.state.crosscoder_model, app.state.device = load_crosscoder_model()
        print("✅ CrossCoder model loaded on startup")

        # Load Fine-tuned Explainer LLM
        model_path = Path(__file__).parent / "AI" / "neurocore_explainer_model"
        app.state.explainer_pipe = pipeline(
            "text2text-generation",
            model=str(model_path.resolve()),
            device=-1,  # CPU; use 0 for GPU
            trust_remote_code=True
        )
        print(f"✅ NeuroCore Explainer model loaded from {model_path}")

    except Exception as e:
        print(f"❌ Startup loading error: {e}")
        app.state.crosscoder_model = None
        app.state.device = None
        app.state.explainer_pipe = None


# ============================================================
# 🧩 Brain State Classification Function
# ============================================================

def get_brain_state(mean_r: float, mean_V: float) -> str:
    """Classifies the brain regime for LLM and UI."""
    if np.isnan(mean_r) or np.isnan(mean_V):
        return "unstable"
    if mean_r < 0.18 and mean_V < -3.5:
        return "suppressed_or_inhibited"
    elif 0.18 <= mean_r <= 0.5 and -4.0 <= mean_V <= -2.0:
        return "normal"
    elif mean_r > 0.5 or mean_V > -2.0:
        return "hyperactive_or_excited"
    return "normal"


# ============================================================
# ⚙️ Helper Function for Full Simulation
# ============================================================

def run_simulation(contents: bytes, parcellation_type: str, model, device, explainer):
    """Runs full CrossCoder → NeuroCore → Explanation pipeline."""

    # Step 1: Decode input .npy
    npy_data = np.load(io.BytesIO(contents))

    # Step 2: CrossCoder inference
    recon_vec = run_crosscoder(model, npy_data, parcellation_type, device)
    W_463 = vector_to_symmetric_matrix(recon_vec, n_regions=463)

    # Step 3: NeuroCore Simulation
    neurocore = NeuroCore(W_463, tau=1.0, eta=-1.8, D=0.12, k=2.0, I_ext=0.35)
    t, r, V = neurocore.simulate(t_max=100.0, dt=0.1)  # shorter sim for performance

    

    # Step 5: Compute metrics
    mean_r = float(np.mean(r))
    mean_V = float(np.mean(V))
    state = get_brain_state(mean_r, mean_V)

    # Step 6: Generate Explanation
    if explainer:
        prompt = f"Explain the neural dynamics for mean_r={mean_r:.3f}, mean_V={mean_V:.3f}, state={state}"
        explanation = explainer(prompt, max_new_tokens=150)[0]["generated_text"]
    else:
        explanation = "LLM explainer not loaded."

    # Step 7: Compute mean activity per timestep for graphs
    r_mean = np.mean(r, axis=0)
    V_mean = np.mean(V, axis=0)

    # Step 8: Build final JSON response
    return {
        "mean_firing_rate": mean_r,
        "mean_membrane_potential": mean_V,
        "state": state,
        "explanation": explanation,
        "time": t.tolist(),
        "firing_rate_series": r_mean.tolist(),
        "membrane_potential_series": V_mean.tolist(),
        "status": "success"
    }


# ============================================================
# 🧠 Simulation Endpoint (Async)
# ============================================================

@app.post("/simulate")
async def simulate_brain(file: UploadFile, parcellation_type: str = Form(...)):
    """
    Runs simulation + classification + explanation + returns time-series data.
    """
    try:
        contents = await file.read()
        model = getattr(app.state, "crosscoder_model", None)
        device = getattr(app.state, "device", None)
        explainer = getattr(app.state, "explainer_pipe", None)

        if model is None:
            return {"status": "error", "message": "CrossCoder model not loaded on server"}

        result = await asyncio.to_thread(run_simulation, contents, parcellation_type, model, device, explainer)
        return result

    except Exception as e:
        print(f"❌ Simulation error: {e}")
        return {"status": "error", "message": str(e)}


# ============================================================
# 🩺 Health Check
# ============================================================

@app.get("/health")
def health_check():
    return {"status": "ok"}
