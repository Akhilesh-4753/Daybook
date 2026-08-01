const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function processExactLoginButtonColor(inputPath, outputPath) {
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
      const newIhdrData = Buffer.from(chunkData);
      newIhdrData[9] = 6; // Force RGBA
      
      const lenBuf = Buffer.alloc(4);
      lenBuf.writeUInt32BE(13, 0);
      const typeBuf = Buffer.from('IHDR', 'ascii');
      const typeAndData = Buffer.concat([typeBuf, newIhdrData]);
      
      const crcTable = [];
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        crcTable[n] = c;
      }
      let crc = 0xffffffff;
      for (let i = 0; i < typeAndData.length; i++) crc = crcTable[(crc ^ typeAndData[i]) & 0xff] ^ (crc >>> 8);
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE((crc ^ 0xffffffff) >>> 0, 0);
      
      otherChunksBefore.push(Buffer.concat([lenBuf, typeAndData, crcBuf]));
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

  const inBpp = ihdr.colorType === 6 ? 4 : (ihdr.colorType === 2 ? 3 : 0);
  if (!inBpp) return;

  const outBpp = 4;
  const inScanlineLen = 1 + ihdr.width * inBpp;
  const outScanlineLen = 1 + ihdr.width * outBpp;
  const height = ihdr.height;
  
  const rawIn = Buffer.alloc(height * ihdr.width * inBpp);

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * inScanlineLen];
    const lineStart = y * inScanlineLen + 1;
    const outLineStart = y * ihdr.width * inBpp;

    for (let x = 0; x < ihdr.width * inBpp; x++) {
      let val = decompressed[lineStart + x];
      let left = x >= inBpp ? rawIn[outLineStart + x - inBpp] : 0;
      let up = y > 0 ? rawIn[(y - 1) * ihdr.width * inBpp + x] : 0;
      let upLeft = (y > 0 && x >= inBpp) ? rawIn[(y - 1) * ihdr.width * inBpp + x - inBpp] : 0;

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
      rawIn[outLineStart + x] = val;
    }
  }

  const rawOut = Buffer.alloc(height * ihdr.width * outBpp);
  let transparentCount = 0;
  let recoloredCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < ihdr.width; x++) {
      const inIdx = (y * ihdr.width + x) * inBpp;
      const outIdx = (y * ihdr.width + x) * outBpp;

      const r = rawIn[inIdx];
      const g = rawIn[inIdx + 1];
      const b = rawIn[inIdx + 2];

      // Outer white/light background -> transparent
      const isWhiteBg = (r >= 230 && g >= 230 && b >= 230);

      // Violet/purple icon square background & text
      const isVioletLogoPixel = (b > r + 12 && b > g + 12 && b >= 120 && r <= 180 && g <= 180);

      if (isWhiteBg) {
        rawOut[outIdx] = 0;
        rawOut[outIdx + 1] = 0;
        rawOut[outIdx + 2] = 0;
        rawOut[outIdx + 3] = 0; // Transparent
        transparentCount++;
      } else if (isVioletLogoPixel) {
        // Set to exact solid login button swatch color: R=99, G=102, B=241 (#6366F1)
        const origBright = (r + g + b) / 3;
        const darkFactor = origBright < 110 ? 0.78 : (origBright > 190 ? 1.02 : 0.92);

        rawOut[outIdx] = Math.min(255, Math.max(0, Math.round(99 * darkFactor)));
        rawOut[outIdx + 1] = Math.min(255, Math.max(0, Math.round(102 * darkFactor)));
        rawOut[outIdx + 2] = Math.min(255, Math.max(0, Math.round(241 * darkFactor)));
        rawOut[outIdx + 3] = inBpp === 4 ? rawIn[inIdx + 3] : 255;
        recoloredCount++;
      } else {
        rawOut[outIdx] = r;
        rawOut[outIdx + 1] = g;
        rawOut[outIdx + 2] = b;
        rawOut[outIdx + 3] = inBpp === 4 ? rawIn[inIdx + 3] : 255;
      }
    }
  }

  console.log(`Updated ${recoloredCount} pixels to exact rich login button color #6366F1 for ${path.basename(outputPath)}.`);

  const filteredBuf = Buffer.alloc(height * outScanlineLen);
  for (let y = 0; y < height; y++) {
    filteredBuf[y * outScanlineLen] = 0;
    rawOut.copy(filteredBuf, y * outScanlineLen + 1, y * ihdr.width * outBpp, (y + 1) * ihdr.width * outBpp);
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

const sourceMedia = "C:\\Users\\AKHILESH\\.gemini\\antigravity-ide\\brain\\be7ff1ff-5bd1-4b1e-979c-a8f94fbb72bc\\media__1785571257349.png";
const logoPath = path.join(__dirname, '../assets/images/daybook-logo.png');
const iconPath = path.join(__dirname, '../assets/images/icon.png');
const fgPath = path.join(__dirname, '../assets/images/android-icon-foreground.png');

if (fs.existsSync(sourceMedia)) {
  fs.copyFileSync(sourceMedia, logoPath);
  fs.copyFileSync(sourceMedia, iconPath);
  fs.copyFileSync(sourceMedia, fgPath);
}

processExactLoginButtonColor(logoPath, logoPath);
processExactLoginButtonColor(iconPath, iconPath);
processExactLoginButtonColor(fgPath, fgPath);
