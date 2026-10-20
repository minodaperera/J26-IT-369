// Module 2 client for the Python AI/ML bridge (ai-ml/api). Uses the same AI_SERVICE_URL as aiService.js.
// Node 18+ built-in fetch/FormData is used so multipart uploads need no extra dependency.
const base = () => process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
const START_HINT = 'AI service is unreachable. Start it from ai-ml/ with: uvicorn api.main:app --port 8000 --reload';

async function parse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof body.detail === 'string' ? body.detail : body.message;
    const err = new Error(detail || `AI service error (${res.status})`);
    // Pass through 503 (e.g. Tesseract/model missing) so the UI shows the real reason; other failures are 502.
    err.status = res.status === 503 ? 503 : 502;
    throw err;
  }
  return body;
}

async function call(path, init) {
  try {
    return await parse(await fetch(`${base()}${path}`, init));
  } catch (e) {
    if (e.status) throw e;
    const err = new Error(START_HINT);
    err.status = 503;
    throw err;
  }
}

exports.extractDocument = (file, docType) => {
  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append('doc_type', docType);
  return call('/guidance/ocr/extract', { method: 'POST', body: form });
};

exports.predictRejection = (payload) =>
  call('/guidance/risk/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

exports.classifyText = (text) =>
  call('/guidance/docs/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

// Health of the Module 2 endpoints. 'degraded' = bridge is up but the guidance router did not load.
exports.health = async () => {
  try {
    const r = await fetch(`${base()}/guidance/health`);
    if (r.ok) return await r.json();
    const root = await fetch(`${base()}/health`);
    return root.ok ? { status: 'degraded', guidance_router_loaded: false } : { status: 'down' };
  } catch {
    return { status: 'down' };
  }
};
