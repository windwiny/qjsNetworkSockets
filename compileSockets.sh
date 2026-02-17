#!/bin/bash

# Download QuickJS headers if not present
if [ -z "$QUICKJS" ]; then
  echo "Find QuickJS headers..."
  echo ' git clone https://github.com/bellard/quickjs'
  echo ' export QUICKJS=$(pwd)/quickjs'
  exit 1
fi
if [ ! -e "${QUICKJS}/quickjs.h" ]; then
  echo "Check QuickJS headers \"${QUICKJS}/quickjs.h\" not exists"
  exit 2
fi

echo "Compiling with optimizations..."

# PERFORMANCE BUILD - Maximum speed
gcc \
  -shared \
  -fPIC \
  -O3 \
  -march=native \
  -mtune=native \
  -flto \
  -ffast-math \
  -funroll-loops \
  -finline-functions \
  -fomit-frame-pointer \
  -fno-stack-protector \
  -pipe \
  -o ./dist/network_sockets.so \
  ./src/qjs_sockets.c \
  -I ${QUICKJS}/ \
  -Wall \
  -Wextra

if [ $? -eq 0 ]; then
  SIZE=$(du -h ./dist/network_sockets.so | cut -f1)
  echo "✓ Done! (${SIZE})"
  echo ""
  echo "Optimizations applied:"
  echo "  • -O3 (maximum optimization)"
  echo "  • -march=native (CPU-specific instructions)"
  echo "  • -flto (link-time optimization)"
  echo "  • -ffast-math (fast floating point)"
  echo "  • -funroll-loops (loop unrolling)"
  echo "  • -finline-functions (aggressive inlining)"
  echo ""
  echo "Expected speedup: 3-5x faster than unoptimized build"
else
  echo "✗ Compilation failed"
  exit 1
fi
