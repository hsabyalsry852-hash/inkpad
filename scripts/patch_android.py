import re, shutil, glob, os
root = 'android/app/src/main'
# 1) Java files
d = f'{root}/java/com/inkpad/app'
os.makedirs(d, exist_ok=True)
for f in ('MainActivity.java', 'InkOpenPlugin.java', 'InkLockPlugin.java'):
    shutil.copy(f'native/{f}', f'{d}/{f}')

# 2) "Open with" + "Share" for PDFs
p = f'{root}/AndroidManifest.xml'
s = open(p, encoding='utf-8').read()
filters = '''
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/pdf" />
            </intent-filter>
'''
if 'USE_BIOMETRIC' not in s:
    s = s.replace('<application', '<uses-permission android:name="android.permission.USE_BIOMETRIC" />\n    <application', 1)
assert '</activity>' in s
s = s.replace('</activity>', filters + '        </activity>', 1)
open(p, 'w', encoding='utf-8').write(s)

# 3) App icon from icon-512.png
for m in glob.glob(f'{root}/res/mipmap-*'):
    if 'anydpi' in m:
        shutil.rmtree(m)
    else:
        for n in ('ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'):
            shutil.copy('icon-512.png', f'{m}/{n}')
gp = 'android/gradle.properties'
t = open(gp, encoding='utf-8').read() if os.path.exists(gp) else ''
t = re.sub(r'(?m)^org\.gradle\.jvmargs=.*\n?', '', t) + '\norg.gradle.jvmargs=-Xmx3g\n'
open(gp, 'w', encoding='utf-8').write(t)
# 4) versionCode يزيد مع كل build عشان التحديث يتثبّت فوق القديم
bg = 'android/app/build.gradle'
if os.path.exists(bg):
    g = open(bg, encoding='utf-8').read()
    g = re.sub(r'versionCode\s+\d+', 'versionCode ' + os.environ.get('GITHUB_RUN_NUMBER', '1'), g, count=1)
    open(bg, 'w', encoding='utf-8').write(g)
print('android patched')
