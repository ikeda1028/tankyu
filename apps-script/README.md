# Google Apps Script API

Google Drive上の `Wakuwaku Quest Drive DB Prototype` を簡易バックエンドにするためのApps Script雛形です。

## 役割

- `GET ?sheet=events`: イベント一覧を取得
- `POST { action: "append", sheet: "events", record: {...} }`: イベントを追加
- `POST { action: "append", sheet: "users", record: {...} }`: 会員情報を追加
- `POST { action: "append", sheet: "sparks", record: {...} }`: ワクワクを追加
- `POST { action: "append", sheet: "reflections", record: {...} }`: 探究記録を追加
- `POST { action: "append", sheet: "feedbacks", record: {...} }`: フィードバックを追加

## 次の接続方針

1. Google SheetsからApps Scriptを開く
2. `Code.gs` の内容を配置する
3. `デプロイ` → `新しいデプロイ` → 種類で `ウェブアプリ` を選ぶ
4. 実行ユーザーは自分、アクセスできるユーザーは試作段階では自分またはリンクを知っているユーザーにする
5. 発行されたWebアプリURLを、Wakuwaku Quest画面左側の `Google Drive API URL` に貼る
6. `URL保存` → `Drive同期` を押す

Apps ScriptのWebアプリURLが決まったら、現在のIndexedDB保存に加えてGoogle Sheetsへ同期する実装に切り替えられます。
