# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.1.0 — Core Queue** の開発段階です。

## v0.1.0でできること

- 開始番号を指定してSessionを開始
- 連番でTicketを発行
- 発行したTicketを待ち列へ追加
- 1窓口で待ち列の先頭を呼び出し
- 呼び出し中Ticketを完了
- 待ち人数・発行数・完了数を表示
- Sessionを確認付きでリセット
- 日本語 / 英語切り替え
- PC / スマートフォン向けレスポンシブUI
- 実行時外部通信をブロックした単一HTMLビルド

## 使い方

1. 開始番号を確認して「受付を開始」を押します。
2. 来場者ごとに「番号を発行」を押します。
3. 窓口が空いているときに「次を呼ぶ」を押します。
4. 対応が終わったら「完了」を押します。

## v0.1.0の制限

v0.1.0では、仕様書のロードマップに従ってコアフローだけを実装しています。

- 窓口は1つのみ
- 自動保存・Session復旧なし
- 手動番号追加なし
- 不在・再呼び出しなし
- Display画面なし
- CSV出力なし
- 番号札印刷なし

ページの再読み込み、タブを閉じる操作、Sessionリセットを行うと現在の受付状態は失われます。永続化は後続バージョンで追加予定です。

## プライバシー

Ticket番号とSession状態はブラウザ内で処理します。アプリは外部API、分析、テレメトリーを使用せず、Content Security Policyで実行時の外部接続を遮断します。

## 単一HTML

テンプレートのビルドにより以下を生成します。

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

## 開発

Windows PowerShell / PowerShell 7 の両方を考慮したテンプレート構成です。

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

アプリの正式仕様と v0.1.0〜v1.0.0 のロードマップは `APP_SPEC.md` を参照してください。

## License

MIT License
