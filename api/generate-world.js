const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim().slice(0, 700);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item).slice(0, 80)).filter(Boolean).slice(0, limit)
    : String(value || "")
        .split(/[、,\n]/)
        .map((item) => normalizeText(item).slice(0, 80))
        .filter(Boolean)
        .slice(0, limit);
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
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSONを読み取れませんでした");
    return JSON.parse(match[0]);
  }
}

function normalizeWorld(data, payload) {
  const zones = Array.isArray(data?.zones)
    ? data.zones
        .map((zone) => ({
          name: normalizeText(zone?.name, "未知の場所").slice(0, 40),
          clue: normalizeText(zone?.clue, "現実の場所の観察から手がかりを見つける").slice(0, 140),
          item: normalizeText(zone?.item, payload.requiredItems[0] || "ひみつのかけら").slice(0, 40),
        }))
        .filter((zone) => zone.name)
        .slice(0, 6)
    : [];
  return {
    summary: normalizeText(data?.summary, `${payload.concept}から生まれる探究ワールドです。`).slice(0, 260),
    entranceRiddle: normalizeText(data?.entranceRiddle || payload.riddle, `${payload.entrance}に隠れた謎を解く。`).slice(0, 180),
    zones,
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
    const payload = {
      title: normalizeText(body.title, "ひみつのワールド").slice(0, 60),
      concept: normalizeText(body.concept).slice(0, 220),
      entrance: normalizeText(body.entrance, "身近な場所").slice(0, 120),
      riddle: normalizeText(body.riddle).slice(0, 180),
      requiredItems: normalizeList(body.requiredItems, 8),
      ageMode: normalizeText(body.ageMode, "standard").slice(0, 20),
      region: normalizeText(body.region, "日本").slice(0, 80),
      interests: normalizeList(body.interests, 10),
    };
    if (!payload.concept) {
      response.status(400).json({ error: "concept is required" });
      return;
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:
          "探究プラットフォーム用のワールドマップをJSONだけで生成してください。現実の地図上の具体的な入口に、謎、必要アイテム、発見をマッピングする設計です。子ども向けの場合は怖くせず、ひらがな多めで、安全な観察・記録だけを促してください。危険な侵入、夜間行動、知らない人との接触、個人情報収集は入れないでください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の条件でワールドマップを作ってください。

出力JSON:
{
  "summary": "ワールド概要",
  "entranceRiddle": "入口を開く謎",
  "zones": [
    {"name":"エリア名","clue":"そこで解く謎や観察","item":"得られる/必要なアイテム"}
  ]
}

条件:
- zonesは4から6個
- 現実の場所の観察がワールド内の謎につながる
- アイテムが揃うと入口に入れる構造
- 発見したものを後から各エリアへマッピングできる
- ageModeがkidsなら4歳から10歳向け

入力:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 900,
      }),
    });

    const responseJson = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({ error: responseJson.error?.message || "OpenAI world request failed" });
      return;
    }
    const world = normalizeWorld(parseJsonObject(extractOutputText(responseJson)), payload);
    response.status(200).json({ world, model: process.env.OPENAI_MODEL || DEFAULT_MODEL });
  } catch (error) {
    response.status(500).json({ error: error.message || "ワールドを生成できませんでした" });
  }
}
