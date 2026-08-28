const TRIPO_BASE_URL = "https://openapi.tripo3d.ai/v3";

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalizeTaskId(value) {
  return String(value || "").trim().slice(0, 120);
}

export default async function handler(request, response) {
  setCors(response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST, OPTIONS");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TRIPO_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "TRIPO_API_KEY is not configured" });
    return;
  }

  try {
    const taskId = normalizeTaskId(request.query?.taskId || request.body?.taskId);
    if (!/^task_[A-Za-z0-9_-]+$/.test(taskId)) {
      response.status(400).json({ error: "valid taskId is required" });
      return;
    }

    const tripoResponse = await fetch(`${TRIPO_BASE_URL}/tasks/${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await tripoResponse.json().catch(() => ({}));
    if (!tripoResponse.ok || data.code !== 0) {
      response.status(tripoResponse.status || 502).json({
        error: data.message || data.error || "Tripo status request failed",
        detail: data,
      });
      return;
    }

    const task = data.data || {};
    response.status(200).json({
      provider: "tripo",
      taskId: task.task_id || taskId,
      status: task.status || "unknown",
      progress: Number.isFinite(Number(task.progress)) ? Number(task.progress) : 0,
      output: task.output || {},
      creditsConsumed: task.credits_consumed,
      raw: task,
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "3D model status request failed" });
  }
}
