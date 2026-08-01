const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function recolorGreenToViolet(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) return;
  const fileBuf = fs.readFileSync(inputPath);

  let pos = 8;
  let ihdr = null;
  const idatChunks = [];
  const otherChunksBefore = [];
  const otherChunksAfter = [];
  let foundIdat = false;

  while (pos < fileBuf.length) {
    const length = fileBuf.readUInt32BE(pos);
    const type = fileBuf.toString('ascii', pos + 4, pos + 8);
    const chunkData = fileBuf.subarray(pos + 8, pos + 8 + length);
    const fullChunk = fileBuf.subarray(pos, pos + 12 + length);

    if (type === 'IHDR') {
      ihdr = {
        width: chunkData.readUInt32BE(0),
        height: chunkData.readUInt32BE(4),
        bitDepth: chunkData[8],
        colorType: chunkData[9],
      };
      otherChunksBefore.push(fullChunk);
    } else if (type === 'IDAT') {
      foundIdat = true;
      idatChunks.push(chunkData);
    } else {
      if (!foundIdat) otherChunksBefore.push(fullChunk);
      else otherChunksAfter.push(fullChunk);
    }
    pos += 12 + length;
  }

  if (!ihdr || ihdr.bitDepth !== 8) return;

  const combinedIdat = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(combinedIdat);

  const bpp = ihdr.colorType === 6 ? 4 : (ihdr.colorType === 2 ? 3 : 0);
  if (!bpp) return;

  const scanlineLength = 1 + ihdr.width * bpp;
  const height = ihdr.height;
  const rawPixels = Buffer.alloc(height * ihdr.width * bpp);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * scanlineLength];
    const lineStart = y * scanlineLength + 1;
    const outLineStart = y * ihdr.width * bpp;

    for (let x = 0; x < ihdr.width * bpp; x++) {
      let val = decompressed[lineStart + x];
      let left = x >= bpp ? rawPixels[outLineStart + x - bpp] : 0;
      let up = y > 0 ? rawPixels[(y - 1) * ihdr.width * bpp + x] : 0;
      let upLeft = (y > 0 && x >= bpp) ? rawPixels[(y - 1) * ihdr.width * bpp + x - bpp] : 0;

      if (filterType === 1) val = (val + left) & 0xff;
      else if (filterType === 2) val = (val + up) & 0xff;
      else if (filterType === 3) val = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr = (pa <= pb && pa <= pc) ? left : ((pb <= pc) ? up : upLeft);
        val = (val + pr) & 0xff;
      }
      rawPixels[outLineStart + x] = val;
    }
  }

  let count = 0;
  for (let i = 0; i < rawPixels.length; i += bpp) {
    const r = rawPixels[i];
    const g = rawPixels[i + 1];
    const b = rawPixels[i + 2];

    // Detect ONLY the green/teal square background pixels:
    // Green (g) is dominant over Red (r), and g >= 25, b >= 30, r <= 75
    // Avoid yellow bookmark (r > 160, g > 130)
    // Avoid white pages (r > 200, g > 200, b > 200)
    const isGreenSquare = (g > r + 15 && b > r + 10 && g >= 25 && g <= 140 && r <= 75 && b <= 150);

    if (isGreenSquare) {
      // Calculate relative shade factor to preserve original shadows & highlights
      const brightness = (r + g + b) / 3;
      const shade = brightness / 75;

      // Replace green with matched theme violet (#6366F1 -> R:99, G:102, B:241)
      rawPixels[i] = Math.min(255, Math.max(0, Math.round(99 * Math.max(0.65, Math.min(1.35, shade)))));
      rawPixels[i + 1] = Math.min(255, Math.max(0, Math.round(102 * Math.max(0.65, Math.min(1.35, shade)))));
      rawPixels[i + 2] = Math.min(255, Math.max(0, Math.round(241 * Math.max(0.65, Math.min(1.35, shade)))));
      count++;
    }
  }

  console.log(`Recolored ${count} green square pixels to violet for ${path.basename(outputPath)}.`);

  const filteredBuf = Buffer.alloc(height * scanlineLength);
  for (let y = 0; y < height; y++) {
    filteredBuf[y * scanlineLength] = 0;
    rawPixels.copy(filteredBuf, y * scanlineLength + 1, y * ihdr.width * bpp, (y + 1) * ihdr.width * bpp);
  }

  const newIdatData = zlib.deflateSync(filteredBuf);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function createChunk(typeStr, dataBuf) {
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(dataBuf.length, 0);
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, dataBuf]);
    const crcVal = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([lenBuf, typeAndData, crcBuf]);
  }

  const newIdatChunk = createChunk('IDAT', newIdatData);
  const outPNG = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ...otherChunksBefore,
    newIdatChunk,
    ...otherChunksAfter
  ]);

  fs.writeFileSync(outputPath, outPNG);
}

// Copy original uploaded media file to assets first
const sourceMedia = "C:\\Users\\AKHILESH\\.gemini\\antigravity-ide\\brain\\be7ff1ff-5bd1-4b1e-979c-a8f94fbb72bc\\media__1785569506398.png";
const logoPath = path.join(__dirname, '../assets/images/daybook-logo.png');
const iconPath = path.join(__dirname, '../assets/images/icon.png');
const fgPath = path.join(__dirname, '../assets/images/android-icon-foreground.png');

if (fs.existsSync(sourceMedia)) {
  fs.copyFileSync(sourceMedia, logoPath);
  fs.copyFileSync(sourceMedia, iconPath);
  fs.copyFileSync(sourceMedia, fgPath);
}

recolorGreenToViolet(logoPath, logoPath);
recolorGreenToViolet(iconPath, iconPath);
recolorGreenToViolet(fgPath, fgPath);
