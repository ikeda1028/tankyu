# Wakuwaku Quest 公開手順

## 1. GitHubへアップロード

このフォルダをGitHubリポジトリにします。

```bash
git init
git add .
git commit -m "Prepare Wakuwaku Quest for public deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/wakuwaku-quest.git
git push -u origin main
```

`YOUR_ACCOUNT` は自分のGitHubアカウント名に置き換えます。

## 2. Vercelで公開

1. Vercelで `Add New...` -> `Project`
2. GitHubの `wakuwaku-quest` リポジトリを選択
3. Framework Preset は `Other`
4. Build Command は `npm run build`
5. Output Directory は `dist`
6. Environment Variables に以下を設定

```text
GOOGLE_MAPS_API_KEY=Google Cloudで作成したMaps APIキー
GOOGLE_DRIVE_API_URL=Apps ScriptのWebアプリURL
OPENAI_API_KEY=OpenAIのProject API Key
OPENAI_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-2
```

`GOOGLE_DRIVE_API_URL` は未設定でも公開できます。
`OPENAI_API_KEY` はAI候補イベント生成とAI画像生成に使います。ブラウザには配信されないサーバー側の環境変数です。
`OPENAI_IMAGE_MODEL` は省略しても `gpt-image-2` が使われます。

## 3. Google CloudのAPIキー制限を更新

Vercelで発行されたURLを、Google Cloud ConsoleのAPIキー詳細に追加します。

例:

```text
https://wakuwaku-quest.vercel.app/*
```

設定場所:

1. Google Cloud Console
2. APIとサービス
3. 認証情報
4. `Maps Platform API Key`
5. アプリケーションの制限
6. ウェブサイトの制限にVercel URLを追加
7. 保存

## 4. 公開後の確認

1. Vercel URLを開く
2. `デモではじめる`
3. `地図表示`
4. Google Mapとイベントマーカーが表示されるか確認

表示されない場合は、Google CloudのHTTPリファラー反映に数分かかることがあります。
