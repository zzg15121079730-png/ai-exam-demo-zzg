const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zipPath = 'C:\\Users\\Administrator\\Desktop\\AI考试附件.zip';
const destDir = 'C:\\Users\\Administrator\\Desktop\\AI考试附件';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

try {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(destDir, true);
  console.log('解压成功！所有文件已解压到:', destDir);
} catch (e) {
  console.error('解压失败:', e);
}
