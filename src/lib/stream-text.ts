export function applyStreamPiece(full: string, piece: string) {
  if (!piece) {
    return { full, delta: "" };
  }
  if (!full) {
    return { full: piece, delta: piece };
  }
  if (piece.startsWith(full)) {
    return { full: piece, delta: piece.slice(full.length) };
  }
  if (full.startsWith(piece) && piece.length < full.length) {
    return { full, delta: "" };
  }
  return { full: full + piece, delta: piece };
}

export function voiceErrorMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/protobuf|no graph|ERROR_CODE:\s*2/i.test(raw)) {
    return "The voice download failed. Try again, or keep chatting in text.";
  }
  if (/wasm|onnx|cdn|backend|dynamically imported/i.test(raw)) {
    return "The voice is still loading. Wait a moment, or keep chatting in text.";
  }
  return raw;
}
