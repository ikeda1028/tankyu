const SPREADSHEET_ID = "1dvOAeZ8dTSuS2HMQt1hsIcFC806qtzVTv7O495n6mPA";
const ALLOWED_SHEETS = ["events", "users", "sparks", "reflections", "feedbacks"];
const HEADERS = {
  events: [
    "id",
    "title",
    "description",
    "exploration_index",
    "impact",
    "tags",
    "keywords",
    "question_path",
    "color",
    "location_name",
    "event_type",
    "start_date",
    "end_date",
    "latitude",
    "longitude",
    "user_created",
    "created_by",
    "created_at",
  ],
  users: [
    "id",
    "display_name",
    "role",
    "school",
    "grade",
    "region",
    "initial_interest",
    "quest",
    "joy",
    "exploration_distance",
    "reflection_power",
    "interests",
    "created_at",
  ],
  sparks: ["id", "user_id", "text", "source", "created_at"],
  reflections: ["id", "user_id", "event_id", "depth", "depth_label", "reflection", "hypothesis", "quest_delta", "created_at"],
  feedbacks: ["id", "reflection_id", "student_id", "mentor_id", "kind", "comment", "next_question", "created_at"],
};

function doGet(e) {
  if (e.parameter.action === "setup") {
    return setupSpreadsheet();
  }
  const sheetName = sanitizeSheetName(e.parameter.sheet || "events");
  const rows = readRows(sheetName);
  return json({ ok: true, sheet: sheetName, rows });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const action = body.action || "append";
  const sheetName = sanitizeSheetName(body.sheet || "events");

  if (action === "append") {
    const row = appendRow(sheetName, body.record || {});
    return json({ ok: true, sheet: sheetName, row });
  }

  if (action === "list") {
    return json({ ok: true, sheet: sheetName, rows: readRows(sheetName) });
  }

  return json({ ok: false, error: "Unsupported action" }, 400);
}

function sanitizeSheetName(sheetName) {
  if (!ALLOWED_SHEETS.includes(sheetName)) {
    throw new Error("Unsupported sheet: " + sheetName);
  }
  return sheetName;
}

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  ensureHeaders(sheet, sheetName);
  return sheet;
}

function ensureHeaders(sheet, sheetName) {
  const headers = HEADERS[sheetName];
  if (!headers) return;
  const current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0] : [];
  const hasHeaders = headers.every((header, index) => current[index] === header);
  if (!hasHeaders) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function setupSpreadsheet() {
  ALLOWED_SHEETS.forEach((sheetName) => getSheet(sheetName));
  return json({ ok: true, sheets: ALLOWED_SHEETS });
}

function getHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function readRows(sheetName) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet
    .getRange(2, 1, lastRow - 1, headers.length)
    .getValues()
    .map((values) =>
      headers.reduce((record, key, index) => {
        record[key] = values[index];
        return record;
      }, {})
    );
}

function appendRow(sheetName, record) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const row = headers.map((key) => {
    if (key === "created_at" && !record[key]) return new Date().toISOString();
    if (key === "id" && !record[key]) return Utilities.getUuid();
    return record[key] ?? "";
  });
  sheet.appendRow(row);
  return headers.reduce((saved, key, index) => {
    saved[key] = row[index];
    return saved;
  }, {});
}

function json(payload, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
