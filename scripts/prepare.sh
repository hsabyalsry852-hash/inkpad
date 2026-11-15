#!/usr/bin/env bash
# Copies the web app into www/, bundles pdf.js + pdf-lib locally (works offline),
# removes the service worker (the APK already ships the files) and injects native.js.
set -euo pipefail
rm -rf www && mkdir -p www/lib
cp index.html app.js extra.js plus.js style.css manifest.json icon-192.png icon-512.png icon-maskable-512.png www/
B=https://cdnjs.cloudflare.com/ajax/libs
curl -fsSL $B/pdf.js/3.11.174/pdf.min.js        -o www/lib/pdf.min.js
curl -fsSL $B/pdf.js/3.11.174/pdf.worker.min.js -o www/lib/pdf.worker.min.js
curl -fsSL $B/pdf-lib/1.17.1/pdf-lib.min.js     -o www/lib/pdf-lib.min.js
# ---- offline OCR (Tesseract + Arabic/English data) ----
mkdir -p www/lib/tess
cp node_modules/tesseract.js/dist/tesseract.min.js node_modules/tesseract.js/dist/worker.min.js www/lib/tess/
cp node_modules/tesseract.js-core/tesseract-core*.js www/lib/tess/
cp node_modules/tesseract.js-core/tesseract-core*.wasm www/lib/tess/ 2>/dev/null || true
for L in ara eng; do
  curl -fsSL --retry 3 https://github.com/tesseract-ocr/tessdata_fast/raw/main/$L.traineddata -o www/lib/tess/$L.traineddata
done
# ---- offline translation (transformers.js + opus-mt en<->ar) ----
mkdir -p www/lib/ort
J=https://cdn.jsdelivr.net/npm
curl -fsSL --retry 3 $J/@xenova/transformers@2.17.2/dist/transformers.min.js -o www/lib/transformers.min.js
for W in ort-wasm.wasm ort-wasm-simd.wasm ort-wasm-threaded.wasm ort-wasm-simd-threaded.wasm; do
  curl -fsSL --retry 3 $J/onnxruntime-web@1.14.0/dist/$W -o www/lib/ort/$W
done
for M in opus-mt-en-ar opus-mt-ar-en; do
  mkdir -p www/models/$M/onnx
  for F in config.json tokenizer.json tokenizer_config.json onnx/encoder_model_quantized.onnx onnx/decoder_model_merged_quantized.onnx; do
    curl -fsSL --retry 3 https://huggingface.co/Xenova/$M/resolve/main/$F -o www/models/$M/$F
  done
  curl -fsSL --retry 3 https://huggingface.co/Xenova/$M/resolve/main/generation_config.json -o www/models/$M/generation_config.json || true
done
test -s www/lib/tess/tesseract.min.js && test -s www/lib/tess/ara.traineddata && test -s www/models/opus-mt-ar-en/onnx/encoder_model_quantized.onnx
ls www/lib/tess; du -sh www
cp native/native.js www/native.js
cd www
sed -i "s#https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/#lib/#g; s#https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/#lib/#g" index.html app.js
sed -i "s#^if('serviceWorker'in navigator.*register('sw.js').*;\$##" app.js
grep -q "register('sw.js')" app.js && { echo "service worker removal failed"; exit 1; } || true
sed -i 's#<script src="extra.js"></script>#<script src="extra.js"></script><script src="native.js"></script>#' index.html
grep -q 'native.js' index.html || { echo "native.js injection failed"; exit 1; }
grep -q 'lib/pdf.min.js' index.html || { echo "pdf.js rewrite failed"; exit 1; }
echo "www ready"
