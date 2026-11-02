#!/bin/bash
# Baut alle Teile: Ton -> Video -> final/RUNGHOLT_Teil_N.mp4, danach Titelbilder + Anleitung.
# Stimme vorher erzeugen:  $PY tts.py
set -e
cd "$(dirname "$0")"
PY=${PY:-python3}
mkdir -p final
[ -f grain.png ] || $PY -c "
import numpy as np; from PIL import Image
Image.fromarray((np.random.default_rng(7).random((960,540))*255).astype(np.uint8),'L').convert('RGB').save('grain.png')"
$PY audio.py 1 2 3 4 5
for p in ${PARTS:-1 2 3 4 5}; do
  node render.js $p 4
  ffmpeg -v error -y -i build/part$p/video_noaudio.mp4 -i build/part$p/mix.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart final/RUNGHOLT_Teil_$p.mp4
  echo "FERTIG Teil $p: $(ffprobe -v error -show_entries format=duration -of csv=p=0 final/RUNGHOLT_Teil_$p.mp4)s"
done
node cover.js && $PY guide.py
echo "### ALLE FERTIG ###"
