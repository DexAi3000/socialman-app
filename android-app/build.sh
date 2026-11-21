#!/bin/bash
set -e

PROJECT_DIR="/var/www/android-app"
ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
BUILD_DIR="$PROJECT_DIR/build"
GEN_DIR="$BUILD_DIR/gen"
OBJ_DIR="$BUILD_DIR/obj"
BIN_DIR="$BUILD_DIR/bin"
KEYSTORE="$BUILD_DIR/debug.keystore"

echo "=== 1. Cleaning and preparing directories ==="
rm -rf "$BUILD_DIR"
mkdir -p "$GEN_DIR" "$OBJ_DIR" "$BIN_DIR"

echo "=== 2. Generating R.java with AAPT ==="
aapt package -f -m \
    -J "$GEN_DIR" \
    -M "$PROJECT_DIR/AndroidManifest.xml" \
    -S "$PROJECT_DIR/res" \
    -I "$ANDROID_JAR"

echo "=== 3. Compiling Java sources with javac ==="
javac -source 8 -target 8 \
    -bootclasspath "$ANDROID_JAR" \
    -d "$OBJ_DIR" \
    "$GEN_DIR/com/nimaariyanfar/socialman/R.java" \
    "$PROJECT_DIR/src/com/nimaariyanfar/socialman/MainActivity.java"

echo "=== 4. Converting bytecode to DEX with dalvik-exchange ==="
dalvik-exchange --dex --output="$BIN_DIR/classes.dex" "$OBJ_DIR"

echo "=== 5. Packaging resources with AAPT ==="
aapt package -f \
    -M "$PROJECT_DIR/AndroidManifest.xml" \
    -S "$PROJECT_DIR/res" \
    -I "$ANDROID_JAR" \
    -F "$BIN_DIR/unsigned-unaligned.apk"

echo "=== 6. Adding classes.dex to APK ==="
cd "$BIN_DIR"
aapt add "unsigned-unaligned.apk" "classes.dex"

echo "=== 7. Aligning APK with zipalign ==="
zipalign -f -v 4 "unsigned-unaligned.apk" "uncompressed-aligned.apk"

echo "=== 8. Creating debug keystore (if not exists) ==="
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias socialman \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass socialman123 \
        -keypass socialman123 \
        -dname "CN=SocialMan, OU=Dev, O=SocialMan, L=Tehran, ST=Tehran, C=IR"
fi

echo "=== 9. Signing APK with apksigner ==="
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias socialman \
    --ks-pass pass:socialman123 \
    --key-pass pass:socialman123 \
    --out "$BIN_DIR/socialman.apk" \
    "uncompressed-aligned.apk"

echo "=== 10. Verifying APK signature ==="
apksigner verify -v "$BIN_DIR/socialman.apk"

echo "=== 11. Publishing APK to web directory ==="
cp "$BIN_DIR/socialman.apk" /var/www/socialman-app/public/socialman.apk
ls -lh /var/www/socialman-app/public/socialman.apk

echo "SUCCESS! APK built and published successfully!"
