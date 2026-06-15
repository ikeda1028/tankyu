const DEFAULT_IMAGE_MODEL = "gpt-image-2";

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 1200);
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const body = request.body || {};
    const prompt = normalizeText(body.prompt);
    if (!prompt) {
      response.status(400).json({ error: "prompt is required" });
      return;
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
        prompt,
      }),
    });

    const responseJson = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI Image API request failed",
      });
      return;
    }

    const imageBase64 = responseJson.data?.[0]?.b64_json;
    if (!imageBase64) {
      response.status(502).json({ error: "画像データを取得できませんでした" });
      return;
    }

    response.status(200).json({
      imageDataUrl: `data:image/png;base64,${imageBase64}`,
      model: process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL,
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "画像を生成できませんでした" });
  }
}
