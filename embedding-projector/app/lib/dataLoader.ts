export interface ChunkData {
  progress: number;
  chunk: Float32Array;
  nSamples: number;
  nDimensions: number;
}

export async function* loadEmbeddingsInChunks(chunkSize = 1000): AsyncGenerator<ChunkData> {
  const response = await fetch('/data/embeddings.bin');
  const reader = response.body!.getReader();
  let buffer = new Uint8Array(0);
  let nSamples: number, nDimensions: number;

  const readChunk = async (): Promise<number | null> => {
    const { done, value } = await reader.read();
    if (done) return null;
    buffer = concatArrays(buffer, value);
    return buffer.length;
  };

  // Read header
  while (buffer.length < 8) await readChunk();
  const header = new Int32Array(buffer.buffer, 0, 2);
  nSamples = header[0];
  nDimensions = header[1];
  buffer = buffer.slice(8);

  const embeddings: number[] = [];
  const bytesPerChunk = chunkSize * nDimensions * 4;

  while (embeddings.length < nSamples) {
    while (buffer.length < bytesPerChunk && await readChunk() !== null);
    const chunkData = new Float32Array(buffer.buffer, 0, Math.min(chunkSize, nSamples - embeddings.length) * nDimensions);
    embeddings.push(...Array.from(chunkData));
    buffer = buffer.slice(chunkData.byteLength);
    
    yield {
      progress: embeddings.length / nSamples,
      chunk: chunkData,
      nSamples,
      nDimensions
    };
  }
}

function concatArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
}
