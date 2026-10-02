# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.2.0 — Queue Operations** です。

## できること

- 開始番号を指定してSessionを開始
- 連番でTicketを発行
- 任意の番号を手動で待ち列へ追加
- 同一Session内の重複番号を防止
- 1窓口で待ち列の先頭を呼び出し
- 呼び出し中番号を再呼び出し
- 完了 / 不在
- 不在番号を待ち列の末尾へ戻す
- 待機中 / 不在Ticketの削除とUndo
- 呼び出し中Ticketの確認付き削除
- 待ち人数・登録数・完了数を表示
- 日本語 / 英語切り替え
- PC / スマートフォン向けレスポンシブUI
- 完全ローカル処理

## 使い方

1. 開始番号を確認して「受付を開始」を押します。
2. 来場者ごとに「番号を発行」を押します。既存の整理券を使う場合は手動追加もできます。
3. 「次を呼ぶ」で待ち列の先頭を呼び出します。
4. 必要なら「もう一度呼ぶ」を使います。
5. 対応後は「完了」または「不在」にします。
6. 不在者が戻った場合は待ち列の末尾へ戻せます。

## v0.2.0の制限

- 窓口は1つのみ
- 自動保存・Session復旧なし
- Display画面なし
- CSV出力なし
- 番号札印刷なし

ページの再読み込み、タブを閉じる操作、Sessionリセットを行うと現在の受付状態は失われます。永続化は後続バージョンで追加予定です。

## プライバシー

Ticket番号とSession状態はブラウザ内で処理します。外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

## 単一HTML

ビルドにより以下を生成します。

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

## 開発

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

正式仕様と v0.1.0〜v1.0.0 のロードマップは `APP_SPEC.md` を参照してください。

## License

MIT License
