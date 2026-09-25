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
        voice: body.voiceStyle === "elder" ? "cedar" : normalizeVoice(body.voice || process.env.OPENAI_TTS_VOICE),
        ...((process.env.OPENAI_TTS_MODEL || DEFAULT_TTS_MODEL).startsWith("gpt-4o-mini-tts") && body.voiceStyle === "elder" ? {instructions: "日本語のプロの声優が、威厳と優しさのある年老いた仙人を自然に演じる。声質は低めの温かい男性のバリトン。年齢は微かな息の質感と落ち着きで表し、わざとしゃがれさせたり声を震わせたりしない。目の前の一人の子どもへ語りかける距離感。相手の発見には小さな驚きと笑み、考える言葉には短い間、励ます言葉には温かい確信を込める。意味のまとまりで息を継ぎ、重要な語だけを自然に強調する。句読点ごとに機械的に止まらず、文末を毎回同じ調子にしない。日本語のアクセントと母音を明瞭に、普段の会話のテンポで。芝居がかった朗読、過剰な老人の物まね、ささやき、歌、本文にない笑い声や台詞は入れない。読み上げるのは本文のみ。"} : {}),
        input,
        response_format: "mp3",
        speed: body.voiceStyle === "elder" ? 1.0 : 0.9,
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
