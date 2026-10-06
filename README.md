# NickyMusic

聲樂工作坊的線上教室：用音樂學院的方式，學一首流行歌。

## 結構

- `index.html`：首頁（曲目、教學方式、關於）
- `lessons/lisa-money/`：第一課，LISA〈MONEY〉從主歌到副歌

## 新增一課

1. 在 `lessons/` 底下建立新資料夾，例如 `lessons/song-name/index.html`
2. 在 `index.html` 的「曲目」區塊複製一張 `.card`，改封面、標題和連結

## 旁白音檔

旁白是預先錄好的神經語音（`lessons/<課程>/voice/*.mp3`），檔名是台詞文字的雜湊值。改了台詞之後要重新產生：

```bash
python -m pip install edge-tts
node tools/make-voice.mjs lessons/lisa-money
```

只會補錄有變動的句子，並刪掉不再使用的舊檔。若某句沒有音檔，頁面會自動改用瀏覽器內建語音。
換聲音：`VOICE=zh-TW-YunJheNeural node tools/make-voice.mjs lessons/lisa-money --force`（男聲），調語速：`RATE=-5%`。

純靜態網站，由 GitHub Pages 從 `main` 分支根目錄部署。
