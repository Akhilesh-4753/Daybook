/**
 * crop_logo.js
 * Reads a PNG with transparent background, finds the bounding box of
 * non-transparent pixels, pads it slightly, makes it square, and saves.
 *
 * Usage: node scripts/crop_logo.js <src> <dst>
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const src = process.argv[2];
const dst = process.argv[3];

if (!src || !dst) {
  console.error('Usage: node crop_logo.js <src.png> <dst.png>');
  process.exit(1);
}

fs.createReadStream(src)
  .pipe(new PNG())
  .on('parsed', function () {
    const w = this.width;
    const h = this.height;

    let minX = w, minY = h, maxX = 0, maxY = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const alpha = this.data[idx + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pad = 12;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);

    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;

    // Make square by taking the larger dimension and centering
    const size = Math.max(cw, ch);
    let ox = minX - Math.floor((size - cw) / 2);
    let oy = minY - Math.floor((size - ch) / 2);
    ox = Math.max(0, ox);
    oy = Math.max(0, oy);
    const finalSize = Math.min(size, Math.min(w - ox, h - oy));

    const out = new PNG({ width: finalSize, height: finalSize });

    for (let y = 0; y < finalSize; y++) {
      for (let x = 0; x < finalSize; x++) {
        const srcIdx = ((oy + y) * w + (ox + x)) * 4;
        const dstIdx = (y * finalSize + x) * 4;
        out.data[dstIdx]     = this.data[srcIdx];
        out.data[dstIdx + 1] = this.data[srcIdx + 1];
        out.data[dstIdx + 2] = this.data[srcIdx + 2];
        out.data[dstIdx + 3] = this.data[srcIdx + 3];
      }
    }

    const buf = PNG.sync.write(out);
    fs.writeFileSync(dst, buf);
    console.log(`Cropped → ${dst}  (${finalSize}×${finalSize}px, offset x=${ox} y=${oy})`);
  });
