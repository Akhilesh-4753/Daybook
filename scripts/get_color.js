const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function getSwatchColor(inputPath) {
  if (!fs.existsSync(inputPath)) return;
  const fileBuf = fs.readFileSync(inputPath);

  let pos = 8;
  let ihdr = null;
  const idatChunks = [];

  while (pos < fileBuf.length) {
    const length = fileBuf.readUInt32BE(pos);
    const type = fileBuf.toString('ascii', pos + 4, pos + 8);
    const chunkData = fileBuf.subarray(pos + 8, pos + 8 + length);

    if (type === 'IHDR') {
      ihdr = {
        width: chunkData.readUInt32BE(0),
        height: chunkData.readUInt32BE(4),
        bitDepth: chunkData[8],
        colorType: chunkData[9],
      };
    } else if (type === 'IDAT') {
      idatChunks.push(chunkData);
    }
    pos += 12 + length;
  }

  const combinedIdat = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(combinedIdat);
  const inBpp = ihdr.colorType === 6 ? 4 : (ihdr.colorType === 2 ? 3 : 0);

  const scanlineLength = 1 + ihdr.width * inBpp;
  const sampleIdx = 1 + Math.floor(ihdr.width / 2) * inBpp;

  const r = decompressed[sampleIdx];
  const g = decompressed[sampleIdx + 1];
  const b = decompressed[sampleIdx + 2];

  const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  console.log(`SWATCH EXACT COLOR: R=${r}, G=${g}, B=${b} -> HEX: ${hex}`);
}

const swatchFile = "C:\\Users\\AKHILESH\\.gemini\\antigravity-ide\\brain\\be7ff1ff-5bd1-4b1e-979c-a8f94fbb72bc\\media__1785571523484.png";
getSwatchColor(swatchFile);
