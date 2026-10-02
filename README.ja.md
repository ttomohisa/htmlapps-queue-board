# Queue Board / 呼び出し番号

小規模イベントや一時受付で、番号を発行して待ち列を作り、順番に呼び出すためのBrowser Kittyアプリです。

現在は **v0.8.0 — Ticket Printing** です。

## 主な機能

- 1〜4窓口のQueue運用
- 連番 / 手動Ticket追加
- 呼び出し / 再呼び出し / 完了 / 不在 / 再待機
- 待合向けDisplay
- 呼び出しチャイム / Fullscreen / Wake Lock
- 進行中Sessionの自動保存と再開
- History / CSV / Session Summary
- 番号札作成
- 印刷プレビュー
- ブラウザ印刷
- 日本語 / 英語
- 完全ローカル処理

## 番号札作成

ヘッダーのプリンターアイコンから、現在のSessionとは独立して番号札を作成できます。

設定できる項目:

- 開始番号
- 終了番号
- 桁数
- タイトル
- 用紙サイズ
- 1ページあたりの枚数

既定値は次のとおりです。

- 開始番号: 001
- 終了番号: 030
- 桁数: 3
- タイトル: 「受付番号」
- 用紙サイズ: A4
- 1ページあたり: 8枚

用紙サイズは **A4 / Letter** に対応しています。1ページあたりの枚数は1〜20枚で指定できます。

## 印刷プレビュー

設定に応じてページ単位のプレビューを生成します。

- 番号札のタイトルと番号を表示
- 点線を切り取り目安として表示
- ページごとに印刷改ページ
- 用紙サイズに応じて印刷用 `@page` を切り替え
- 印刷時はヘッダーや操作UIを除外

「印刷する」を押すと、ブラウザ標準の印刷画面を開きます。

プリンター固有の余白や拡大縮小設定はブラウザ / OS / プリンタードライバー側の設定に依存します。

## v0.8.0の制限

ブラウザ停止を避けるため、1回に生成できる番号札は **最大1000枚** です。

- 番号は0〜999999
- 桁数は1〜6
- 1ページあたり1〜20枚
- 用紙はA4 / Letter
- PC向けのブラウザ印刷を主対象
- 印刷結果はブラウザ・OS・プリンター設定によってわずかに異なる場合があります

番号札作成はSessionと独立しているため、受付開始前・受付中・受付終了後のいずれでも利用できます。

## その他の機能

### History / CSV

Session内の履歴を5状態でフィルタし、UTF-8 BOM付きCSVとして保存できます。

### Session Summary

受付終了時に発行数・完了・不在・待機・開始/終了時刻・平均待ち時間を表示します。

### 自動保存

進行中SessionはIndexedDBを第一候補として保存し、利用できない場合はlocalStorageへフォールバックします。

## プライバシー

Ticket、Session履歴、印刷用番号札、設定、Display状態はブラウザ内で処理します。番号札の作成や印刷のためにデータを外部へ送信しません。

外部API、分析、テレメトリーは使用せず、Content Security Policyで実行時の外部接続を遮断しています。

## 単一HTML

ビルドにより以下を生成します。

- `dist/index.html`
- `dist/index.self-extract.html`
- `queue-board.html`

番号札作成・印刷も同じ単一HTML内で動作します。

## 開発

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

正式仕様と v0.1.0〜v1.0.0 のロードマップは `APP_SPEC.md` を参照してください。

## License

MIT License
