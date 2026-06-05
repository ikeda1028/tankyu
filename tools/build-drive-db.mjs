import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("../outputs/", import.meta.url);
const outputPath = new URL("../outputs/wakuwaku-quest-drive-db.xlsx", import.meta.url);

const workbook = Workbook.create();

function writeSheet(name, headers, rows) {
  const sheet = workbook.worksheets.getOrAdd(name, { renameFirstIfOnlyNewSpreadsheet: true });
  const values = [headers, ...rows];
  const endCol = columnName(headers.length);
  sheet.getRange(`A1:${endCol}${values.length}`).values = values;
  const header = sheet.getRange(`A1:${endCol}1`);
  header.format.font = { bold: true, color: "#111827" };
  header.format.fill.color = "#F3F4F6";
  sheet.getRange(`A1:${endCol}${Math.max(values.length, 2)}`).format.borders = {
    preset: "all",
    style: "thin",
    color: "#E5E7EB",
  };
  sheet.freezePanes.freezeRows(1);
  sheet.getRange(`A1:${endCol}${Math.max(values.length, 2)}`).format.autofitColumns();
  return sheet;
}

function columnName(index) {
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

writeSheet(
  "README",
  ["section", "memo"],
  [
    ["purpose", "中高生向け探究プラットフォーム Wakuwaku Quest のGoogle Drive試作用DBです。"],
    ["flow", "eventsで出会いを登録し、sparks/reflections/feedbacksで探究の広がりを記録します。"],
    ["next_step", "Google Apps ScriptをWeb APIにして、静的WebアプリからこのSheetへ読み書きします。"],
    ["score_model", "探究値 = イベント指数 + モチベーション + 探究距離 + 振り返りの具体性"],
  ]
);

writeSheet(
  "events",
  [
    "id",
    "title",
    "description",
    "exploration_index",
    "impact",
    "tags",
    "keywords",
    "question_path",
    "color",
    "latitude",
    "longitude",
    "user_created",
    "created_by",
    "created_at",
  ],
  [
    [
      "event-foodloss-market",
      "商店街フードロス探究",
      "売れ残り、仕入れ、消費者行動から地域の食の循環を考えるイベント。",
      82,
      "フードロス・地域経済",
      "食,商店街,聞き取り",
      "食,地域,経済,廃棄",
      "何が捨てられているか|なぜ余るのか|誰の行動や仕組みと関係するか|他地域の流通とどう違うか|学校で何を試せるか",
      "#2f8f63",
      35.42,
      139.42,
      false,
      "seed",
      "2026-06-05",
    ],
    [
      "event-disaster-interview",
      "地域防災インタビュー探究",
      "避難所や地域住民への聞き取りから、防災を生活、福祉、情報伝達まで広げるイベント。",
      88,
      "防災・地域コミュニティ",
      "防災,聞き取り,地域",
      "防災,地域,福祉,避難",
      "避難所には何が必要か|なぜ情報が届かない人がいるのか|行政、学校、地域住民はどう関係するか|福祉や観光の視点では何が見えるか|学校で防災情報の伝え方を試せるか",
      "#2f6fb3",
      35.61,
      139.3,
      true,
      "demo-teacher",
      "2026-06-05",
    ],
  ]
);

writeSheet(
  "users",
  ["id", "display_name", "role", "school", "grade", "region", "initial_interest", "quest", "joy", "exploration_distance", "reflection_power", "interests", "created_at"],
  [["demo-student", "中高生ユーザー", "student", "学び中学", "高1", "東京都", "地域と防災", 72, 64, 46, 38, "地域,防災,聞き取り", "2026-06-05"]]
);

writeSheet(
  "sparks",
  ["id", "user_id", "text", "source", "created_at"],
  [
    ["spark-001", "demo-student", "商店街のシャッターが増えている理由が気になる", "comment", "2026-06-05"],
    ["spark-002", "demo-student", "避難所で中高生ができる役割を知りたい", "event", "2026-06-05"],
  ]
);

writeSheet(
  "reflections",
  ["id", "user_id", "event_id", "depth", "depth_label", "reflection", "hypothesis", "quest_delta", "created_at"],
  [
    [
      "reflection-001",
      "demo-student",
      "event-disaster-interview",
      3,
      "構造",
      "避難情報が届かない理由は、スマホの有無だけでなく、近所づきあいや掲示場所にも関係しそう。",
      "学校周辺で情報を受け取りやすい場所を調べる。",
      24,
      "2026-06-05",
    ],
  ]
);

writeSheet(
  "feedbacks",
  ["id", "reflection_id", "student_id", "mentor_id", "kind", "comment", "next_question", "created_at"],
  [
    [
      "feedback-001",
      "reflection-001",
      "demo-student",
      "demo-teacher",
      "question",
      "情報が届かない人を一括りにせず、どんな状況の人か分けて考えると次の探究が深まります。",
      "高齢者、観光客、小学生では必要な伝え方はどう違うだろう？",
      "2026-06-05",
    ],
  ]
);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

for (const name of ["README", "events", "users", "sparks", "reflections", "feedbacks"]) {
  await workbook.render({ sheetName: name, range: "A1:H8", scale: 1 });
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath.pathname);
