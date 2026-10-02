# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.5.0 — Sound / Fullscreen / Wake** です。

## できること

- 開始番号を指定してSessionを開始
- 1〜4窓口を設定し、各窓口名を指定
- 連番 / 手動でTicketを追加
- 同一Session内の重複番号を防止
- 各窓口から共通待ち列の先頭を呼び出し
- 再呼び出し / 完了 / 不在 / 削除
- 不在番号を待ち列の末尾へ戻す
- 待合向けDisplayを別ウィンドウで開く
- OperatorからDisplayへ現在番号・窓口・最近呼んだ番号・待ち人数・表示タイトルを同期
- 内蔵チャイムを呼び出し / 再呼び出し時に再生
- 呼び出し音ON/OFF
- 受付開始前のチャイム試聴
- DisplayのFullscreen
- DisplayのWake Lock（対応ブラウザのみ）
- Fullscreen / Wake LockのFeature Detectionと非対応案内
- Displayの縦長 / 横長レイアウト
- 日本語 / 英語
- 完全ローカル処理

## 呼び出し音

呼び出し音は既定でONです。開始前に「試聴」で確認できます。

チャイムはWeb Audio APIでアプリ内生成しており、実行時に外部音声ファイルを取得しません。通常呼び出しと再呼び出しでは少し異なるパターンを鳴らします。

受付開始後もOperator画面からON/OFFを切り替えられます。Web Audio API非対応環境では音機能だけを無効化し、番号表示や待ち列管理はそのまま利用できます。

## Display

受付開始後に **「表示画面を開く」** を押すと、同じHTMLをDisplayモードで別ウィンドウに開きます。

Displayでは次の補助機能を利用できます。

- **全画面表示**: ブラウザがFullscreen APIに対応している場合
- **画面を点灯したままにする**: Screen Wake Lock APIに対応している場合

Wake Lockは画面が再表示されたときに必要に応じて再取得します。対応していないブラウザや取得に失敗した場合でも、Display自体は継続して利用できます。

## v0.5.0の制限

- 最大4窓口
- Displayは同一ブラウザ内の別ウィンドウ
- 自動保存・Session復旧なし
- CSV出力なし
- 番号札印刷なし
- 番号の音声読み上げなし

## プライバシー

Ticket番号、窓口設定、Display設定、Session状態はブラウザ内で処理します。外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

呼び出し音もアプリ内で生成し、Display同期も同一ブラウザ内だけで行います。

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
