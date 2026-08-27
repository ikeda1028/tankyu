const DEFAULT_TRIPO_MODEL = "v3.1-20260211";

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizePrompt(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 1024);
}

export default async function handler(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "TRIPO_API_KEY is not configured" });
    return;
  }

  try {
    const prompt = normalizePrompt(request.body?.prompt);
    if (!prompt) {
      response.status(400).json({ error: "prompt is required" });
      return;
    }

    const tripoResponse = await fetch("https://openapi.tripo3d.com/v3/generation/text-to-model", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: process.env.TRIPO_MODEL || DEFAULT_TRIPO_MODEL,
        texture: false,
        pbr: false,
        auto_size: true,
        geometry_quality: "standard",
        face_limit: 30000,
      }),
    });

    const data = await tripoResponse.json().catch(() => ({}));
    if (!tripoResponse.ok || data.code !== 0) {
      response.status(tripoResponse.status || 502).json({
        error: data.message || data.error || "Tripo request failed",
        detail: data,
      });
      return;
    }

    response.status(200).json({
      provider: "tripo",
      model: process.env.TRIPO_MODEL || DEFAULT_TRIPO_MODEL,
      taskId: data.data?.task_id,
      raw: data.data || data,
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "3D model request failed" });
  }
}
