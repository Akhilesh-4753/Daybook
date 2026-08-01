const fs = require('fs');
const filePath = "c:\\Daybook\\assets\\images\\empty_state_illustration.png";
const buf = fs.readFileSync(filePath);
console.log('HEADER BYTES:', buf.subarray(0, 8));
console.log('IS PNG?', buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E);
