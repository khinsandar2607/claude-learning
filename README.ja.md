[English](README.md) | **日本語**

# Claude API 学習プロジェクト

Claude Platform 101 のコースで使うスクリプトです。TypeScript と Python で書かれています。各ファイルは独立した小さな例になっています。

## セットアップ

### 1. APIキーを設定する

このフォルダーに `.env` という名前のファイルを作成し、[console.anthropic.com](https://console.anthropic.com/settings/keys) で発行したキーを書きます。

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env` は `.gitignore` に登録されているため、Git にコミットされることはありません。キーをコードに貼り付けたり、他人と共有したりしないでください。

### 2. TypeScript の依存パッケージをインストールする

Node.js 18 以上が必要です。

```bash
npm install
```

### 3. Python の依存パッケージをインストールする（任意）

`.py` ファイルを使う場合のみ必要です。

```bash
python3.13 -m venv .venv
source .venv/bin/activate
pip install anthropic python-dotenv
```

## スクリプトの実行方法

TypeScript のファイルは、Node の組み込み機能 `--env-file` で `.env` を読み込みます。

```bash
node --env-file=.env <ファイル名>.ts
```

| ファイル | 内容 |
|---|---|
| `index.ts` | 最初の API 呼び出し。メッセージを 1 つ送り、返信を表示します。 |
| `models.ts` | 同じメッセージを Haiku・Sonnet・Opus に送り、それぞれの使用量を表示します。 |
| `review.ts` | コードのレビューを Claude に依頼します。 |
| `tool-use.ts` | ツールを使う処理の流れ（ループ）。デンバーの天気をハードコードで返します。作業中のため、現時点では実行できません（`client` と `tools` が未定義です）。 |
| `weather.ts` | 現在の天気と 3 日間の予報をオースティンについて尋ねます。データは Open-Meteo から取得します。 |
| `structured-weather.ts` | Zod で検証した、決まった形式の天気レポートを返します。 |
| `streaming.ts` | 返信を単語ごとに、届いた順に表示します。 |
| `cost-display.ts` | モデルごとのトークン数と推定料金を表示します。 |
| `managed-agent.ts` | Managed Agent とセッションを作成します。ベータ版で、セッションごとに料金がかかります。 |

Python のファイルは次のように実行します。

```bash
python agent-loops.py   # ツールを使うループ（天気ツールの例）
python first_call.py    # Python での最初の API 呼び出し
```

Python のファイルを実行する前に `.venv` を有効にしてください。

## 補足

- `weather.ts` は [Open-Meteo](https://open-meteo.com/) を使います。無料で、キーは不要です。
- `managed-agent.ts` は実行するたびに新しいエージェントと環境を作成します。削除するまでアカウントに残ります。
