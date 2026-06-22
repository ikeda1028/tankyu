const DEFAULT_TTS_MODEL = "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = "coral";

function normalizeText(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim().slice(0, 1400);
}

function normalizeVoice(value) {
  const voice = String(value || "").trim().toLowerCase();
  const allowed = new Set(["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer", "verse"]);
  return allowed.has(voice) ? voice : DEFAULT_TTS_VOICE;
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
    const input = normalizeText(body.text || body.input);
    if (!input) {
      response.status(400).json({ error: "text is required" });
      return;
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || DEFAULT_TTS_MODEL,
        voice: normalizeVoice(body.voice || process.env.OPENAI_TTS_VOICE),
        input,
        response_format: "mp3",
        speed: 0.9,
      }),
    });

    if (!openAiResponse.ok) {
      const errorJson = await openAiResponse.json().catch(() => ({}));
      response.status(openAiResponse.status).json({
        error: errorJson.error?.message || "OpenAI speech request failed",
      });
      return;
    }

    const audioBuffer = Buffer.from(await openAiResponse.arrayBuffer());
    response.setHeader("Content-Type", "audio/mpeg");
    response.setHeader("Cache-Control", "no-store");
    response.status(200).send(audioBuffer);
  } catch (error) {
    response.status(500).json({ error: error.message || "音声を生成できませんでした" });
  }
}
