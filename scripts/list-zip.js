const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zipPath = 'C:\\Users\\Administrator\\Desktop\\AI考试附件.zip';
const zip = new AdmZip(zipPath);
const zipEntries = zip.getEntries();

console.log("--- ZIP ENTRIES ---");
zipEntries.forEach(entry => {
  // 用 iconv-lite 或者手动尝试修复中文字符集
  // adm-zip 默认会尝试使用 utf-8 或者 cp437。如果文件名是 gbk (cp936) 编码，可能会变成乱码或非法字符
  // 我们可以打印 entry.entryName 和 entry.rawEntryName (如果有的话)
  console.log(`Name: ${entry.entryName}`);
  if (entry.rawEntryName) {
    // 尝试用 GBK 编码解析 rawEntryName
    try {
      // Node.js 默认不支持 gbk 编码，但我们可以用一些常见字符集来解释，或者看看 rawEntryName
      console.log(`  Raw: ${entry.rawEntryName.toString('hex')}`);
    } catch (e) {}
  }
});
