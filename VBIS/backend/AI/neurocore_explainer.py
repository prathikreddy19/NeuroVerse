from transformers import pipeline
from pathlib import Path

print("🔹 Loading NeuroCore Explainer Model...")

try:
    # Resolve model path to absolute location
    model_path = Path(__file__).parent / "neurocore_explainer_model"

    pipe = pipeline(
        "text2text-generation",
        model=str(model_path.resolve()),
        device=-1,                # CPU (use 0 for GPU)
        trust_remote_code=True,
        local_files_only=True     # prevents Hugging Face Hub lookup
    )

    print(f"✅ NeuroCore Explainer model loaded from {model_path}")

except Exception as e:
    pipe = None
    print(f"❌ Failed to load NeuroCore Explainer model: {e}")


def generate_explanation(mean_r, mean_V, state):
    """
    Generate a neural dynamics explanation using the fine-tuned FLAN-T5 model.
    """
    if pipe is None:
        return "LLM explainer not loaded."

    prompt = f"Explain the neural dynamics for mean_r={mean_r}, mean_V={mean_V}, state={state}"
    result = pipe(prompt, max_new_tokens=150)[0]["generated_text"]
    return result
