#!/usr/bin/env bash
set -euo pipefail
bash scripts/prepare.sh
npx cap add android
python3 scripts/patch_android.py
npx cap sync android
cd android && chmod +x gradlew && ./gradlew assembleDebug
echo "APK: android/app/build/outputs/apk/debug/app-debug.apk"
