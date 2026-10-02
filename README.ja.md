# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.6.0 — Persistence / Recovery** です。

## できること

- 開始番号を指定してSessionを開始
- 1〜4窓口を設定し、各窓口名を指定
- 連番 / 手動でTicketを追加
- 同一Session内の重複番号を防止
- 各窓口から共通待ち列の先頭を呼び出し
- 再呼び出し / 完了 / 不在 / 削除
- 不在番号を待ち列の末尾へ戻す
- 待合向けDisplayを別ウィンドウで開く
- 内蔵チャイム、Fullscreen、Wake Lock
- 進行中Sessionの自動保存
- ページ再読み込み後のSession再開
- 保存済みSessionを破棄して新しく始める
- 開始番号・窓口・音・Display設定の保存
- 保存中 / 保存済み / 保存失敗の状態表示
- 日本語 / 英語
- 完全ローカル処理

## 自動保存と復旧

進行中Sessionは端末内へ自動保存します。

保存先は **IndexedDBを第一候補** とし、IndexedDBを利用できない場合はlocalStorageへフォールバックします。開始番号、窓口数、窓口名、呼び出し音、Display設定などの軽量な設定値はlocalStorageへ保存します。

ページを再読み込みすると、保存された進行中Sessionがある場合は設定画面をそのまま表示せず、

- 受付を再開
- 新しく始める

を選択する画面を表示します。新しく始める場合は、保存済みSessionを破棄する前に確認を行います。

Ticket操作は短いデバウンス後に保存し、ページがバックグラウンドへ移るときも保存を試みます。保存とSession削除は直列化し、リセット直前の遅延保存で古いSessionが復活しないようにしています。

## 設定の再利用

以下の設定は端末内へ保存し、次回の受付設定で再利用します。

- 開始番号
- 窓口数
- 窓口名
- 呼び出し音ON/OFF
- Displayタイトル
- 最近呼んだ番号の表示数
- 待ち人数表示

Sessionをリセットしても、これらの設定値は維持します。

## 保存エラー

Sessionまたは設定値の保存に失敗した場合は、UI上で保存失敗を表示し、トーストでも理由を案内します。保存に失敗してもQueue Boardの基本操作自体は継続できますが、再読み込み後の復旧は保証されません。

## v0.6.0の制限

- 最大4窓口
- Displayは同一ブラウザ内の別ウィンドウ
- Session履歴一覧なし
- CSV出力なし
- Session Summaryなし
- 番号札印刷なし

履歴・CSV・Session終了フローは次のマイルストーンで追加予定です。

## プライバシー

Ticket番号、窓口設定、Display設定、Session状態はブラウザ内で処理します。Session保存もIndexedDB / localStorageなど端末内ストレージだけを使用します。

外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

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
