# InkPad

تطبيق PDF للمذاكرة (ويب PWA + APK أندرويد): تحديد وهايلايت وكتابة بالقلم، ترجمة، كروت مراجعة، OCR، تسجيل صوت، قفل بالرقم السري والبصمة، وهدف مذاكرة يومي.

## التشغيل
افتح `index.html` من أي سيرفر ثابت (مثلًا `npx serve .`). الـService Worker بيخلّي التطبيق يشتغل أوفلاين.

## بناء APK
الـworkflow في `.github/workflows/build.yml` بيبني الـAPK لوحده مع كل push على `main` وبينشره في Releases (tag: `latest`). الملفات المساعدة في `scripts/` و`native/`.

لما تحب كل نسخة تتثبّت فوق اللي قبلها بدون حذف:
1. اعمل مفتاح مرة واحدة: `keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`
2. حوّله: `base64 -w0 debug.keystore` وضعه في GitHub → Settings → Secrets → اسمه `DEBUG_KEYSTORE_B64`.
3. (مُفضّل) شغّل `npm install` مرة محليًا وارفع `package-lock.json` عشان البناء يبقى ثابت.

## الخصوصية
كل ملفاتك بتتخزن على جهازك فقط. الميزات التالية بتبعت **النص المحدد فقط** لخدمة خارجية بعد موافقتك مرة واحدة:
- الذكاء الاصطناعي المجاني (`text.pollinations.ai`): تلخيص / شرح / أسئلة / تحديد المهم.
- الترجمة أونلاين (Google / MyMemory). في نسخة APK في ترجمة أوفلاين كاملة.

## القفل
الرقم السري بيتحفظ كـPBKDF2. القفل بيمنع الفتح من جوه التطبيق، لكن الملفات نفسها مش مشفّرة على التخزين.
