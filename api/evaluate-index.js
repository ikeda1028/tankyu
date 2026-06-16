const DEFAULT_MODEL = "gpt-4.1-mini";

function clamp(value, min = 1, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

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

function normalizeEvaluation(data) {
  const charm = clamp(data.charm, 1, 100);
  const depth = clamp(data.depth, 1, 100);
  const impact = clamp(data.impact, 1, 100);
  const motivation = clamp(data.motivation, 1, 100);
  const score = data.score
    ? clamp(data.score, 1, 100)
    : clamp(charm * 0.28 + depth * 0.27 + impact * 0.25 + motivation * 0.2, 1, 100);
  return {
    score,
    charm,
    depth,
    impact,
    motivation,
    reason: normalizeText(data.reason, "入力文から、学習者の関心を動かし探究へ進ませる力を評価しました。").slice(0, 180),
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
      title: normalizeText(body.title).slice(0, 80),
      impact: normalizeText(body.impact).slice(0, 80),
      description: normalizeText(body.description).slice(0, 420),
      locationName: normalizeText(body.locationName).slice(0, 80),
      tags: normalizeList(body.tags, 6),
      keywords: normalizeList(body.keywords, 8),
      grade: normalizeText(body.grade, "中高生").slice(0, 40),
    };
    if (!payload.title && !payload.impact && !payload.description) {
      response.status(400).json({ error: "event text is required" });
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
          "あなたは中高生向け探究ポイントの評価者です。登録文言から、学習者をどれほどモチベートし、探究行動へ促すかを評価します。安全で年齢に適した観点で、返答はJSONだけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `次の探究ポイント登録文から探究指数を評価してください。

評価観点:
- charm: 学習者が「面白そう」「行ってみたい」と感じる魅力
- depth: 事実から背景、構造、越境、実装まで問いを深められる深さ
- impact: 社会課題や人への貢献につながるインパクト
- motivation: 中高生が自分ごと化し、行動に移したくなる力
- score: 上記を総合した探究指数 1-100

厳しすぎず、ただし説明が薄い場合は低めにしてください。具体的な観察対象、問い、現地性、社会との接続があるほど高くしてください。

JSON形式:
{
  "score": 1-100,
  "charm": 1-100,
  "depth": 1-100,
  "impact": 1-100,
  "motivation": 1-100,
  "reason": "180文字以内の評価理由"
}

イベント:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 700,
      }),
    });

    const responseJson = await openAiResponse.json();
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI API request failed",
      });
      return;
    }

    response.status(200).json(normalizeEvaluation(parseJsonObject(extractOutputText(responseJson))));
  } catch (error) {
    response.status(500).json({ error: error.message || "探究指数を評価できませんでした" });
  }
}
