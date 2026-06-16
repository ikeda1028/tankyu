const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 700);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item).slice(0, 80)).filter(Boolean).slice(0, limit)
    : [];
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSONを読み取れませんでした");
    return JSON.parse(match[0]);
  }
}

function normalizeCharacter(data) {
  return {
    name: normalizeText(data.name, "探究ナビ").slice(0, 40),
    role: normalizeText(data.role, "現地案内人").slice(0, 40),
    message: normalizeText(data.message, "この場所で見つけた違和感を、次の問いに変えてみよう。").slice(0, 180),
    personality: normalizeText(data.personality, "やさしく、少し冒険心がある").slice(0, 120),
    visualPrompt: normalizeText(data.visualPrompt, "中高生向け探究イベントの現地案内キャラクター").slice(0, 300),
  };
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
    const payload = {
      title: normalizeText(body.title, "探究イベント").slice(0, 80),
      impact: normalizeText(body.impact, "地域課題").slice(0, 80),
      description: normalizeText(body.description).slice(0, 360),
      locationName: normalizeText(body.locationName, "現地フィールド").slice(0, 80),
      tags: normalizeList(body.tags, 6),
      grade: normalizeText(body.grade, "中高生").slice(0, 40),
    };

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:
          "あなたは中高生向け探究イベントのキャラクターデザイナーです。現地に行った時だけ会える案内キャラクターを作ります。年齢に適し、安全で、学習の問いを広げる存在にしてください。返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次のイベントから、現地限定キャラクターを1体作ってください。

条件:
- 中高生が親しみやすい
- 実在の人物や既存キャラクターに似せない
- 現場で観察、聞き取り、問いづくりを促す
- 名前は40文字以内
- メッセージは180文字以内
- visualPromptは画像生成に使える外見説明。ただし文字、ロゴ、既存キャラクター名は含めない

JSON形式:
{
  "name": "キャラクター名",
  "role": "役割",
  "message": "現地で出会った時の一言",
  "personality": "性格",
  "visualPrompt": "外見を画像生成するための説明"
}

イベント:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 900,
      }),
    });

    const responseJson = await openAiResponse.json();
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI API request failed",
      });
      return;
    }

    response.status(200).json(normalizeCharacter(parseJsonObject(extractOutputText(responseJson))));
  } catch (error) {
    response.status(500).json({ error: error.message || "キャラクターを生成できませんでした" });
  }
}
