const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 700);
}

function normalizeNumber(value, min, max, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

function normalizeImageDataUrl(value) {
  const dataUrl = String(value || "").trim();
  const match = dataUrl.match(/^data:image\/(?:png|jpeg|jpg|webp);base64,[a-z0-9+/=]+$/i);
  if (!match) return "";
  return dataUrl.length <= 1800000 ? dataUrl : "";
}

function extractOutputText(responseJson) {
  if (responseJson.output_text) return responseJson.output_text;
  const textItems = responseJson.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" || item.text)
    .map((item) => item.text)
    .filter(Boolean);
  return textItems?.join("\n") || "";
}

function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || "").match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSONを読み取れませんでした");
    return JSON.parse(match[0]);
  }
}

function normalizePhotoAnalysis(data) {
  const labels = Array.isArray(data.labels)
    ? data.labels.map((label) => normalizeText(label).slice(0, 30)).filter(Boolean).slice(0, 6)
    : [];
  const caption = normalizeText(data.caption).slice(0, 120);
  const curiosity = normalizeText(data.curiosity).slice(0, 80);
  const fallback = labels.length ? `写真には${labels.slice(0, 3).join("、")}が見えます。` : "写真の中に気になるものを見つけました。";
  return {
    text: normalizeText(data.text || [caption || fallback, curiosity].filter(Boolean).join(" ")).slice(0, 160),
    caption: caption || fallback,
    labels,
    curiosity,
  };
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
    const imageDataUrl = normalizeImageDataUrl(body.imageDataUrl);
    if (!imageDataUrl) {
      response.status(400).json({ error: "imageDataUrl is required" });
      return;
    }

    const context = body.context || {};
    const payload = {
      mode: normalizeText(body.mode, "kids-record").slice(0, 40),
      eventTitle: normalizeText(context.eventTitle).slice(0, 80),
      eventDescription: normalizeText(context.eventDescription).slice(0, 180),
      stamp: normalizeText(context.stamp).slice(0, 40),
      childAge: normalizeNumber(context.childAge, 4, 18, 6),
    };

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:
          "あなたは4歳から10歳の子どもの探究記録を手伝う安全な観察メンターです。写真に写っている主なものを、断定しすぎず、短くやさしい日本語で説明してください。顔、名札、住所、車のナンバーなど個人を特定し得る情報は書かないでください。危険な行動を促さず、子どもが次に観察したくなる問いを1つだけ添えてください。返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `この写真を、子どもの「みつけたこと」欄へ自動入力する短い文章にしてください。

JSON形式:
{
  "text": "160文字以内。写真に写っているもの + 気づき + もっと見たくなる問いを、ひらがな多めでやさしく書く",
  "caption": "何が写っているか120文字以内",
  "labels": ["写っているもの 最大6件"],
  "curiosity": "次に見てみたい問い80文字以内"
}

条件:
- 個人が特定できる内容は書かない
- 不確かなものは「かもしれない」と書く
- 子ども本人が話したような自然な記録文にする
- 難しい漢字を避ける
- イベント文脈があれば少しだけ反映する

文脈:
${JSON.stringify(payload, null, 2)}`,
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
              },
            ],
          },
        ],
        max_output_tokens: 500,
      }),
    });

    const responseJson = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI Vision API request failed",
      });
      return;
    }

    response.status(200).json(normalizePhotoAnalysis(parseJsonObject(extractOutputText(responseJson))));
  } catch (error) {
    response.status(500).json({ error: error.message || "写真を認識できませんでした" });
  }
}
