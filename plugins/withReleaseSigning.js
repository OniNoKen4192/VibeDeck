/**
 * @file plugins/withReleaseSigning.js
 * @description Expo config plugin that wires the release keystore into the
 * generated android/app/build.gradle. Because prebuild regenerates android/
 * from scratch, signing must be injected here — never hand-edited in gradle.
 *
 * Credentials live in credentials/keystore.properties (gitignored). If that
 * file is missing (fresh clone, CI without secrets), release builds fall back
 * to the debug keystore so development keeps working.
 */

const { withAppBuildGradle } = require('expo/config-plugins');

const PROPERTIES_LOADER = `
def vibedeckKeystorePropertiesFile = rootProject.file("../credentials/keystore.properties")
def vibedeckKeystoreProperties = new Properties()
if (vibedeckKeystorePropertiesFile.exists()) {
    vibedeckKeystoreProperties.load(new FileInputStream(vibedeckKeystorePropertiesFile))
}
`;

const RELEASE_SIGNING_CONFIG = `
        release {
            if (vibedeckKeystorePropertiesFile.exists()) {
                storeFile file(vibedeckKeystoreProperties['VIBEDECK_UPLOAD_STORE_FILE'])
                storePassword vibedeckKeystoreProperties['VIBEDECK_UPLOAD_STORE_PASSWORD']
                keyAlias vibedeckKeystoreProperties['VIBEDECK_UPLOAD_KEY_ALIAS']
                keyPassword vibedeckKeystoreProperties['VIBEDECK_UPLOAD_KEY_PASSWORD']
            }
        }
`;

function applyReleaseSigning(gradle) {
  // Idempotency: already applied (e.g. prebuild without --clean)
  if (gradle.includes('vibedeckKeystoreProperties')) {
    return gradle;
  }

  // 1. Load the properties file before the android block
  let out = gradle.replace(/^android \{/m, `${PROPERTIES_LOADER}\nandroid {`);

  // 2. Register the release signing config
  out = out.replace(/signingConfigs \{/, `signingConfigs {${RELEASE_SIGNING_CONFIG}`);

  // 3. Point the release build type at it (fall back to debug when no credentials)
  out = out.replace(
    /(release \{[^}]*?)signingConfig signingConfigs\.debug/,
    `$1signingConfig vibedeckKeystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
  );

  return out;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('withReleaseSigning expects a groovy build.gradle');
    }
    config.modResults.contents = applyReleaseSigning(config.modResults.contents);
    return config;
  });
};
