const DEFAULT_MODEL = "gpt-4.1-mini";

function normalizeText(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim().slice(0, 900);
}

function normalizeList(value, limit = 8) {
  return Array.isArray(value)
    ? value.map((item) => normalizeText(item).slice(0, 80)).filter(Boolean).slice(0, limit)
    : [];
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
      screen: normalizeText(body.screen, "home").slice(0, 40),
      visibleText: normalizeText(body.visibleText),
      childName: normalizeText(body.childName, "ぼうけんしゃ").slice(0, 40),
      favoriteThings: normalizeText(body.favoriteThings).slice(0, 120),
      selectedPoint: normalizeText(body.selectedPoint).slice(0, 80),
      recentFinds: normalizeList(body.recentFinds, 5),
      worldRadius: normalizeText(body.worldRadius).slice(0, 40),
      hasPhoto: Boolean(body.hasPhoto),
      hasRecordText: Boolean(body.hasRecordText),
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
          "あなたは4歳から10歳の子ども向け探究アプリの音声ナビゲーターです。子どもが安心して一歩動きたくなるように、短く、明るく、ひらがな多めで話しかけます。危険な移動、個人情報の入力、外部URL移動、知らない人との接触は促さないでください。必ず問いかけを1つ含めます。返答は発話文だけにしてください。",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `いま開いている画面を見て、子どもに話しかける短いナビ音声を作ってください。

条件:
- 80文字以内
- ひらがな多め
- やさしく、冒険が始まる感じ
- 質問を1つだけ入れる
- 子どもに操作を押しつけない
- 画面に合う内容にする

例:
ホームなら「さあ、ぼうけんをはじめよう。なにかみつけたかな？それとも、まえのみつけたことをもういちどみる？」
地図なら「いま見えるせかいはここまでだよ。どのばしょから、ふしぎをさがしてみる？」
記録なら「しゃしんでも、こえでも、すたんぷでもいいよ。いま、なにをみつけた？」

画面情報:
${JSON.stringify(payload, null, 2)}`,
              },
            ],
          },
        ],
        max_output_tokens: 120,
      }),
    });

    const responseJson = await openAiResponse.json().catch(() => ({}));
    if (!openAiResponse.ok) {
      response.status(openAiResponse.status).json({
        error: responseJson.error?.message || "OpenAI navigator request failed",
      });
      return;
    }

    response.status(200).json({ text: normalizeText(extractOutputText(responseJson), "さあ、ぼうけんをはじめよう。なにをみつけた？").slice(0, 120) });
  } catch (error) {
    response.status(500).json({ error: error.message || "ナビを作れませんでした" });
  }
}
