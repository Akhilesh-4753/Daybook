const fs = require('fs');
const path = require('path');

const logoSource = path.join(__dirname, '../assets/images/daybook-logo.png');

if (!fs.existsSync(logoSource)) {
  console.error('daybook-logo.png not found!');
  process.exit(1);
}

const targetAssets = [
  path.join(__dirname, '../assets/images/icon.png'),
  path.join(__dirname, '../assets/images/android-icon-foreground.png'),
];

targetAssets.forEach((dest) => {
  fs.copyFileSync(logoSource, dest);
  console.log(`Updated asset: ${path.basename(dest)}`);
});

const mipmapFolders = [
  'mipmap-hdpi',
  'mipmap-mdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

const resDir = path.join(__dirname, '../android/app/src/main/res');

if (fs.existsSync(resDir)) {
  mipmapFolders.forEach((folder) => {
    const targetFolder = path.join(resDir, folder);
    if (fs.existsSync(targetFolder)) {
      const targets = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
      targets.forEach((t) => {
        const destPath = path.join(targetFolder, t);
        fs.copyFileSync(logoSource, destPath);
        console.log(`Updated Android drawable: ${folder}/${t}`);
      });
    }
  });
}
