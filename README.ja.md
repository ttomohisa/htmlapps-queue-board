# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.4.0 — Display Board** です。

## できること

- 開始番号を指定してSessionを開始
- 1〜4窓口を設定し、各窓口名を指定
- 連番でTicketを発行
- 任意の番号を手動で待ち列へ追加
- 同一Session内の重複番号を防止
- 各窓口から共通待ち列の先頭を呼び出し
- 同じTicketが複数窓口へ割り当てられないように制御
- 窓口ごとに再呼び出し / 完了 / 不在 / 削除
- 不在番号を待ち列の末尾へ戻す
- 待機中 / 不在Ticketの削除とUndo
- 待合向けDisplayを別ウィンドウで開く
- OperatorからDisplayへ現在番号・窓口・最近呼んだ番号・待ち人数・表示タイトルを同期
- Displayを閉じてもOperatorを継続し、再オープン時に現在状態へ再接続
- Displayの縦長 / 横長レイアウト
- 日本語 / 英語切り替え
- 完全ローカル処理

## Display Board

受付開始前の「表示画面の設定」で以下を指定できます。

- 表示タイトル
- 待ち人数の表示ON/OFF
- 最近呼んだ番号の表示数（0〜5件）

受付開始後に **「表示画面を開く」** を押すと、同じHTMLをDisplayモードで別ウィンドウに開きます。PCではそのウィンドウを外部モニターへ移動して利用できます。

同期は同一ブラウザ内で行います。 `postMessage` を主経路とし、利用可能な環境では `BroadcastChannel` も補助経路として使用します。単一HTMLを `file://` で開いた場合も外部サーバーを必要としません。

## v0.4.0の制限

- 最大4窓口
- Displayは同一ブラウザ内の別ウィンドウのみ
- 呼び出しチャイムなし
- Fullscreen / Wake Lockなし
- 自動保存・Session復旧なし
- CSV出力なし
- 番号札印刷なし

チャイム、Fullscreen、Wake Lockは次のマイルストーンで追加予定です。

## プライバシー

Ticket番号、窓口設定、Display設定、Session状態はブラウザ内で処理します。外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

Display同期のために入力内容を外部サーバーへ送信することもありません。

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
