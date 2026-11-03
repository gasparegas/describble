# Privacy

Describble runs entirely in your browser. There are no accounts, no ads, no cookies and no analytics. Your description, the drawing and the image you download never leave your device.

## The one exception: words it did not understand

To learn new words, Describble can report the **single words** it did not recognise, for example `frullatore`. This is how the lexicon grows.

- **What is sent:** individual lowercase words and the language (`it` or `en`). Never your sentence, never the drawing.
- **What is not sent:** capitalised words (usually names), numbers, anything longer than 24 letters, any identifier. The collector does not store IP addresses.
- **When:** after you pause typing, at most 8 new words per pause, each word once per visit.
- **How to turn it off:** click "word reports: on" in the bottom-right corner. It is also off automatically when your browser sends the Global Privacy Control signal.
- **Self-hosted builds** send nothing unless they are built with a collector address (`DESCRIBBLE_REPORT_ENDPOINT`). The collector's code is in [`collector/`](collector/).

## Stored on your device

The page remembers your report setting and a local list of words it did not understand (visible at `chat.html?mode=misses`, with a button to clear it). Both stay in your browser's local storage.
