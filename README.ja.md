# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.7.0 — History / Export** です。

## 主な機能

- 1〜4窓口のQueue運用
- 連番 / 手動Ticket追加
- 呼び出し / 再呼び出し / 完了 / 不在 / 再待機
- 待合向けDisplay
- 呼び出しチャイム / Fullscreen / Wake Lock
- 進行中Sessionの自動保存と再開
- History画面
- 状態フィルタ（すべて / 待機中 / 呼び出し中 / 完了 / 不在）
- Ticketごとの受付・呼出・不在・完了時刻
- callCount表示
- CSV保存
- Session Summary
- 平均待ち時間
- Session終了フロー
- 終了履歴の端末内保存
- 新しい受付開始フロー
- 日本語 / 英語
- 完全ローカル処理

## History

Operator画面の「履歴」から、そのSession内のTicketを確認できます。

各Ticketでは、記録されている範囲で次の時刻を表示します。

- 受付
- 呼出
- 不在
- 完了

現在状態でフィルタでき、呼び出し回数と最後に担当した窓口も確認できます。

## CSV

History / Session SummaryからCSVを保存できます。

列は次の7列です。

```text
number
status
created_at
called_at
completed_at
counter
call_count
```

CSVはUTF-8 BOM付きで生成し、ファイル名は `queue-board-YYYY-MM-DD.csv` 形式です。

## Session Summary

「受付を終了」は確認付きの操作です。終了時には履歴を端末内へ保存し、その保存が成功した場合だけactive Sessionを終了します。

Summaryでは以下を表示します。

- 受付数
- 完了数
- 不在数
- 現在待機数
- 受付開始時刻
- 受付終了時刻
- 平均待ち時間

平均待ち時間は仕様どおり `createdAt → calledAt` から算出します。

終了後は、

- CSVを保存
- 履歴を見る
- 新しい受付を開始

を選べます。新しい受付を開始しても、終了済みSessionの履歴は端末内アーカイブに残します。

## 保存

進行中SessionはIndexedDBを第一候補として自動保存し、利用できない場合はlocalStorageへフォールバックします。

終了済みSessionもローカル履歴として保存します。ページ再読み込み後、進行中Sessionがなければ最新の終了済みSessionのSummaryを再表示できます。

## v0.7.0の制限

- 最大4窓口
- 過去Session一覧を横断して選ぶ画面はまだありません
- 番号札印刷なし
- 正式リリース前のMobile / Accessibility最終調整は未実施

番号札印刷はv0.8.0、Mobile / UX / Accessibility RCはv0.9.0で対応予定です。

## プライバシー

Ticket、Session履歴、設定、Display状態はブラウザ内で処理します。外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

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
