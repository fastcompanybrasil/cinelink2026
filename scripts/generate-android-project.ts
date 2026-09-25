import fs from 'fs';
import path from 'path';
import { ANDROID_FILES } from '../src/data/androidProjectFiles';

const outputDir = path.resolve(process.cwd(), 'android');

console.log(`Writing ${ANDROID_FILES.length} Android files to ${outputDir}...`);

for (const file of ANDROID_FILES) {
  const targetPath = path.join(outputDir, file.path);
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, file.content, 'utf8');
}

// Ensure gradle-wrapper.properties
const wrapperDir = path.join(outputDir, 'gradle', 'wrapper');
if (!fs.existsSync(wrapperDir)) {
  fs.mkdirSync(wrapperDir, { recursive: true });
}
fs.writeFileSync(
  path.join(wrapperDir, 'gradle-wrapper.properties'),
  `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
`,
  'utf8'
);

// Proguard rules
const appDir = path.join(outputDir, 'app');
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}
fs.writeFileSync(
  path.join(appDir, 'proguard-rules.pro'),
  `# ProGuard rules for Android TV Streaming Hub
-keepattributes *Annotation*
-keepclassmembers class * {
    @kotlinx.serialization.Serializable *;
}
-keep class com.streaming.tvhub.data.** { *; }
-keep class androidx.media3.** { *; }
`,
  'utf8'
);

// Write gradlew executable script
const gradlewScript = `#!/bin/sh
gradle --version >/dev/null 2>&1 || {
  echo "Gradle wrapper proxy"
}
exec gradle "$@"
`;
fs.writeFileSync(path.join(outputDir, 'gradlew'), gradlewScript, { mode: 0o755 });

console.log('Successfully generated Android project in ./android');
