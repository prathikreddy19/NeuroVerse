import numpy as np
from scipy.integrate import solve_ivp

def vector_to_symmetric_matrix(vec, n_regions):
    """
    Convert a flattened connectivity vector into a symmetric matrix (W).
    Assumes upper-triangular flattening without the diagonal.
    """
    W = np.zeros((n_regions, n_regions))
    upper_idx = np.triu_indices(n_regions, k=1)
    W[upper_idx] = vec
    W = W + W.T
    np.fill_diagonal(W, 0.0)
    return W


import numpy as np
from scipy.integrate import solve_ivp

import numpy as np
from scipy.integrate import solve_ivp

import numpy as np
from scipy.integrate import solve_ivp

import numpy as np
from scipy.integrate import solve_ivp

class NeuroCore:
    def __init__(self, W, tau=1.0, eta=-1.5, D=0.05, k=0.4, I_ext=0.1):
        """
        Minimal-stable NeuroCore (same API). Adjusted internals to avoid runaway.
        """
        # much smaller connectivity scale to avoid strong global drive
        self.W = W / (np.max(np.abs(W)) + 1e-12)
        self.W *= 0.2

        self.N = W.shape[0]
        self.tau = tau
        self.eta = eta
        self.D = D
        self.k = k
        self.I_ext = I_ext

        # internal stability knobs (tweak if still off)
        self.gamma = 0.5   # linear leak on V
        self.clip_dr = 1.0
        self.clip_dV = 1.0

    def montbrio_equations(self, t, y):
        N = self.N
        r = y[:N]
        V = y[N:]

        # coupling uses bounded firing-rate to avoid huge pushes
        coupling = self.W @ np.tanh(r * 3.0)

        # ds: use bounded V contribution + leak instead of raw V**2
        # bounded V-term ensures large V don't create runaway positive feedback
        V_term = np.tanh(V / 3.0)    # between -1 and 1

        dr_dt = (self.D / np.pi + 2.0 * r * V_term) / self.tau

        # remove V**2; use bounded term + eta + coupling + leak
        dV_dt = (self.eta + self.k * coupling + self.I_ext) / self.tau
        # apply linear restoring leak (pulls V back toward 0)
        dV_dt += - self.gamma * V / self.tau

        # optional extra damping if any node becomes very active
        over = (r > 5.0).astype(float)
        dV_dt -= 0.5 * over * V
        dr_dt -= 0.2 * over * r

        # clamp derivatives to keep solver stable
        dr_dt = np.clip(dr_dt, -self.clip_dr, self.clip_dr)
        dV_dt = np.clip(dV_dt, -self.clip_dV, self.clip_dV)

        return np.concatenate([dr_dt, dV_dt])

    def simulate(self, r0=None, V0=None, t_max=50.0, dt=0.05):
        N = self.N
        t_eval = np.arange(0, t_max, dt)

        if r0 is None:
            r0 = np.random.uniform(0.05, 0.15, N)
        if V0 is None:
            V0 = np.random.uniform(-3.5, -2.5, N)

        y0 = np.concatenate([r0, V0])

        sol = solve_ivp(
            self.montbrio_equations,
            [0, t_max],
            y0,
            t_eval=t_eval,
            method="RK45",
            max_step=dt
        )

        return t_eval, sol.y[:N], sol.y[N:]
