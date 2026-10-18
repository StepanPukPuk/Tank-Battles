// Запускается автоматически после "npx cap add android".
// 1) альбомная ориентация, 2) полный экран, 3) музыка без ожидания касания.
const fs = require('fs'), path = require('path');
const cfg = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
const pkg = cfg.appId;

const man = 'android/app/src/main/AndroidManifest.xml';
let x = fs.readFileSync(man, 'utf8');
if (!x.includes('screenOrientation')) {
  x = x.replace('<activity', '<activity\n            android:screenOrientation="sensorLandscape"');
  fs.writeFileSync(man, x);
}

const dir = path.join('android/app/src/main/java', ...pkg.split('.'));
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'MainActivity.java'), `package ${pkg};

import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // музыка стартует сразу, без касания
        getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
        // экран не гаснет во время игры
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        // полный экран (шторка и кнопки появляются по свайпу от края)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.systemBars());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
`);
console.log('Android-настройки применены.');
