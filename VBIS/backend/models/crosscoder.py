import torch
import torch.nn as nn
import numpy as np
from pathlib import Path


# ============================================================
# 🧠 CrossCoder Model Definition
# ============================================================

class CrossCoder(nn.Module):
    def __init__(self, parcellation_dims, latent_dim=16):
        super(CrossCoder, self).__init__()
        self.parcellations = list(parcellation_dims.keys())
        self.latent_dim = latent_dim

        # Encoder blocks
        self.encoders = nn.ModuleDict()
        for parc, input_dim in parcellation_dims.items():
            self.encoders[parc] = nn.Sequential(
                nn.Linear(input_dim, 1024),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(1024, 512),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(512, 128),
                nn.ReLU(),
                nn.Linear(128, latent_dim)
            )

        # Decoder blocks
        self.decoders = nn.ModuleDict()
        for parc, input_dim in parcellation_dims.items():
            self.decoders[parc] = nn.Sequential(
                nn.Linear(latent_dim, 128),
                nn.ReLU(),
                nn.Linear(128, 512),
                nn.ReLU(),
                nn.Linear(512, 1024),
                nn.ReLU(),
                nn.Linear(1024, input_dim)
            )

    def encode(self, x, parcellation):
        if parcellation not in self.encoders:
            raise KeyError(f"Unknown parcellation key: {parcellation}")
        return self.encoders[parcellation](x)

    def decode(self, z, parcellation):
        if parcellation not in self.decoders:
            raise KeyError(f"Unknown parcellation key: {parcellation}")
        return self.decoders[parcellation](z)


# ============================================================
# ⚙️ Model Loading Helper
# ============================================================

def load_crosscoder_model():
    parcellation_dims = {
        'parc_86': 3403,
        'parc_129': 8256,
        'parc_234': 27261,
        'parc_463': 106953
    }

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CrossCoder(parcellation_dims, latent_dim=16).to(device)

    # Resolve checkpoint path
    base_dir = Path(__file__).resolve().parents[1]
    checkpoint_path = base_dir / "AI" / "crosscoder_final.pth"
    if not checkpoint_path.exists():
        print(f"❌ CrossCoder checkpoint not found at {checkpoint_path}")
        return None, device

    try:
        checkpoint = torch.load(str(checkpoint_path), map_location=device)

        if isinstance(checkpoint, dict):
            if 'model_state_dict' in checkpoint:
                model.load_state_dict(checkpoint['model_state_dict'], strict=True)
            else:
                model.load_state_dict(checkpoint, strict=True)
        elif isinstance(checkpoint, CrossCoder):
            model = checkpoint.to(device)
        else:
            print("⚠️ Unknown checkpoint format, using as-is.")

        model.eval()
        print(f"✅ CrossCoder model loaded successfully from {checkpoint_path}")
        return model, device

    except Exception as e:
        print(f"❌ Failed to load checkpoint: {e}")
        return None, device


# ============================================================
# 🧩 Run CrossCoder Pipeline
# ============================================================

def run_crosscoder(model, npy_data, parcellation_type, device):
    """Encodes input parcellation → decodes to 463-parcellation vector."""
    flat = npy_data.flatten()

    # Normalize key in case input like '86' is passed
    if not parcellation_type.startswith("parc_"):
        parcellation_type = f"parc_{parcellation_type}"

    if parcellation_type not in model.encoders:
        raise KeyError(f"Invalid parcellation type: {parcellation_type}")

    x = torch.tensor(flat, dtype=torch.float32).unsqueeze(0).to(device)
    with torch.no_grad():
        z = model.encode(x, parcellation_type)
        recon_463 = model.decode(z, 'parc_463').cpu().numpy().flatten()

    return recon_463
