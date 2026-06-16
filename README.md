# Wakuwaku Quest

中高生向け探究プラットフォームの実装MVPです。ユーザーの「ワクワク」を収集し、興味関心・モチベーションから次に出会うべきイベントを推薦します。探究値は、イベントで出会った事象からどの程度遠くまで問いを広げられたかで増加します。

## 現在の実装

- ワクワク入力とアプリ収集風インポート
- ログイン画面と会員情報入力画面
- 会員情報のDB保存
- 探究ポイント登録画面
- 登録済み探究ポイントのDB保存、マップ・推薦一覧への反映
- ChatGPT APIを使ったAI候補探究ポイント生成とワンクリック登録
- 興味キーワード抽出
- モチベーション込みのイベント推薦
- Google Map風の探索マップと探究指数ピン
- 出会う理由、社会課題、タグの表示
- 推薦イベント一覧と適合度表示
- イベントごとの問いの道筋
- 事象からの探究距離による探究値更新
- 気づき、問い、次に試したいことの記録
- 探究の広がりの可視化
- 先生・メンター向けフィードバック画面
- 探究記録へのコメント、次の問い、クイックフィードバック送信
- 探究ログ、興味タグ、連続アクティブ日数
- `IndexedDB` によるブラウザ内データベース保存
- DB件数表示とJSONエクスポート
- Google Maps JavaScript APIキー保存と本物のGoogle Map表示

## 探究値モデル

イベントは探究の入口です。参加後に、出会った事象からどこまで問いを広げられたかを5段階で記録します。

1. 事実: 何が起きているかを観察できた
2. 背景: なぜ起きているかを調べた
3. 構造: 誰の行動、制度、経済、環境と関係するかを考えた
4. 越境: 他地域、他分野、別の社会課題へ接続した
5. 実装: 学校や地域で試せる解決案まで作った

探究値は `イベント指数 + モチベーション + 探究距離 + 振り返りの具体性` で増えます。探究値は累積スコアとして100を超えて伸び、メーターは100で満タンになります。

## ローカル起動

このフォルダで静的サーバーを起動し、ブラウザで `http://127.0.0.1:4173` を開きます。

```bash
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.join(root,url.pathname==='/'?'index.html':url.pathname);if(!file.startsWith(root)){res.writeHead(403);res.end('Forbidden');return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));"
```

または、Node/npmが使える環境では以下でも起動できます。

```bash
npm run start
```

## Vercel公開

公開用の設定を追加済みです。

- `vercel.json`: Vercelのビルド設定
- `package.json`: `npm run build` で公開用ファイルを生成
- `tools/build-static.mjs`: `dist/` に静的ファイルと公開設定を出力
- `public-config.js`: ローカル試作用の空設定

Vercelの環境変数に以下を設定します。

- `GOOGLE_MAPS_API_KEY`: Google Maps JavaScript APIキー
- `GOOGLE_DRIVE_API_URL`: Apps Script WebアプリURL。未設定でも動作します。
- `OPENAI_API_KEY`: AI候補探究ポイント生成に使うOpenAI APIキー。未設定の場合、AI候補検索だけ使えません。
- `OPENAI_MODEL`: 任意。未設定時は `gpt-4.1-mini` を使います。
- `FIREBASE_API_KEY`: Firebase Webアプリ設定の apiKey
- `FIREBASE_AUTH_DOMAIN`: Firebase Webアプリ設定の authDomain
- `FIREBASE_PROJECT_ID`: Firebase Webアプリ設定の projectId
- `FIREBASE_STORAGE_BUCKET`: Firebase Webアプリ設定の storageBucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase Webアプリ設定の messagingSenderId
- `FIREBASE_APP_ID`: Firebase Webアプリ設定の appId

Vercelで発行されたURLをGoogle Cloud ConsoleのAPIキー制限に追加してください。

例:

```text
https://wakuwaku-quest.vercel.app/*
```

公開後、VercelのURLで地図が表示されない場合は、Google Cloud ConsoleのHTTPリファラー制限に本番URLが入っているか、設定反映まで数分待ったかを確認します。

## データベース

現在はブラウザ内の `IndexedDB` に保存しています。`database.js` がDB接続、ストア作成、保存、読み込み、エクスポートを担当します。

作成されるストア:

- `profiles`: 生徒プロフィール、探究値、興味、選択中イベント
- `events`: イベント候補、社会課題、問いの道筋、座標
- `sparks`: ワクワク入力や外部アプリ由来の興味
- `activities`: 探究ログ
- `participations`: イベント参加履歴
- `reflections`: 気づき、問い、次の仮説、探究距離
- `feedbacks`: 先生・メンターからのコメントと次の問い

将来バックエンド化する場合は [schema.sql](/Users/ikedatetsuya/Documents/Codex/2026-06-05/googlemap-web/schema.sql) をPostgreSQL/Supabase用の初期スキーマとして使えます。

## Firebase同期

Firebaseを使う場合は、Firebase ConsoleでWebアプリを追加し、表示される `firebaseConfig` のJSONをアプリの「データベース」欄にある `Firebase設定` へ貼り付けます。

まず使うFirebase機能:

- Cloud Firestore: 生徒ごとのプロフィール、探究ポイント、ログ、振り返り、フィードバック、現場投稿メタデータを保存
- Firebase Storage: 現場写真の本体保存に拡張予定
- Firebase Authentication: 将来の本ログインに拡張予定

現在の実装では、Firestoreの `wakuwakuUsers/{ユーザーID}` に1ユーザー分のスナップショットを保存します。写真本体は容量が大きいため、Firestoreには写真の有無・名前・サイズだけを保存し、画像データはブラウザ内DBに残します。

公開版で常にFirebaseを使う場合は、VercelのEnvironment Variablesに `FIREBASE_*` を設定します。ブラウザに配信されるFirebase設定は秘密鍵ではありませんが、Firestore Security Rulesで読み書き範囲を制限してください。

## Google Drive試作

Google Drive上で試すためのネイティブGoogle Sheets DBを作成しました。

- [Wakuwaku Quest Drive DB Prototype](https://docs.google.com/spreadsheets/d/1wK6r305JiEMMlbpf7NPA7-AOK0C14yzIbP5YUiaQgzs/edit?usp=drivesdk)

シート構成:

- `README`: 試作DBの目的と次の実装方針
- `events`: 探究ポイント登録データ
- `users`: 会員情報と探究パラメーター
- `sparks`: ワクワク入力
- `reflections`: 探究記録
- `feedbacks`: 先生・メンターのフィードバック

次はGoogle Apps ScriptをWeb API化し、アプリの探究ポイント登録・会員情報・フィードバックをこのSheetへ読み書きする構成に移行できます。

現在のWebアプリには、サイドバーの「データベース」欄に `Google Drive API URL` 入力欄があります。Apps ScriptをWebアプリとしてデプロイしたあと、発行されたURLをここに保存すると、以下がGoogle Sheetsへ同期できます。

- `URL保存`: Apps Script WebアプリURLをブラウザ内に保存
- `Drive同期`: 会員情報、登録済み探究ポイント、ワクワク、探究記録、フィードバックを一括送信
- 探究ポイント登録、会員情報保存、探究記録、フィードバック保存時の自動送信

## Google Maps設定

Google Cloud Consoleで作成したAPIキーはチャットやGitに貼らず、Webアプリ画面の「データベース」欄にある `Google Maps APIキー` へ入力します。

推奨するキー制限:

- アプリケーションの制限: `HTTP リファラー`
- 許可するURL:
  - `http://127.0.0.1:4173/*`
  - `http://localhost:4173/*`
  - `https://tankyu-five.vercel.app/*`
- APIの制限: `Maps JavaScript API`

キーを保存したあと `地図表示` を押すと、`encounters[].position.lat/lng` を使ってイベントがGoogle Map上に表示されます。本番公開時は、公開ドメインのURLだけをHTTPリファラーに追加してください。

公開版では `GOOGLE_MAPS_API_KEY` から `public-config.js` が生成されるため、画面にAPIキーを入力しなくても地図表示できます。ブラウザに配信されるキーなので、必ずHTTPリファラー制限をかけて運用してください。

## ChatGPT API設定

探究ポイント登録画面の `AI候補探究ポイント` は、Vercelのサーバー側API `/api/suggest-events` からOpenAI Responses APIを呼び出します。ブラウザ側にはOpenAI APIキーを出さない構成です。

VercelのEnvironment Variablesに以下を追加してください。

```text
OPENAI_API_KEY=OpenAIのProject API Key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-2
```

`OPENAI_IMAGE_MODEL` は省略しても `gpt-image-2` が使われます。GPT Imageモデルの利用には、OpenAI側の組織確認やモデル利用権限が必要になる場合があります。

ローカルの静的サーバーでは `/api/suggest-events` と `/api/generate-image` が動かないため、AI候補検索と画像生成はVercel公開版のAPIへ接続して確認します。

## 次の実装ポイント

- Google Maps本番化: 探究ポイント登録画面で住所検索、開催日時、参加申込、Map IDを使ったデザイン調整を追加する
- バックエンド化: IndexedDBの各ストアを `schema.sql` のテーブルへ移す
- 認証: 生徒ごとの興味ログ、イベント参加履歴、探究距離履歴を保存する
- 外部アプリ連携: Google Classroom、Google Calendar、学校ポータル、メモなどを「ワクワク候補」として取り込む
- 推薦ロジック高度化: キーワード一致から埋め込みベクトル、位置、時間、心理パラメータを使う推薦へ移行する
- 先生・メンター画面: 生徒の問いの広がりと次の仮説にフィードバックする
- フィードバック通知: 生徒側に未読コメントと次の問いを表示する

## データモデル案

- `UserProfile`: 探究値、ワクワク、探究距離、振り返り力
- `Spark`: ユーザーが入力または外部アプリから収集した興味の断片
- `Event`: 出会い候補。社会課題、開催場所、問いの広がりを含む
- `Exploration`: イベントで出会った事象からどこまで探究できたかの記録
- `Reflection`: 生徒の振り返り、問い、次の仮説
- `MentorFeedback`: 先生、メンター、地域協力者からのコメント、観点、次の問い
