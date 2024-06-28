import numpy as np
from pathlib import Path

# Generate random 128D data
n_samples = 10000
n_dimensions = 128
data = np.random.randn(n_samples, n_dimensions).astype(np.float32)
embeddings_binary = Path('embedding-projector/public/data/embeddings.bin')
embeddings_binary.parent.mkdir(exist_ok=True)

# Save to binary file
with open(embeddings_binary, 'wb') as f:
    np.array([n_samples, n_dimensions], dtype=np.int32).tofile(f)
    data.tofile(f)

print(f"Generated {n_samples} samples of {n_dimensions}-dimensional data")
