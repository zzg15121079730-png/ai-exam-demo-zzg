const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Administrator\\Desktop\\AI考试附件\\demos';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  console.log("--- BEFORE CLEAN ---");
  files.forEach(file => {
    console.log(file);
    // 如果文件名包含乱码字符 (例如 '\ufffd' 或者是 '')，说明是乱码遗留文件，可以删掉
    if (file.includes('') || file.includes('')) {
      try {
        fs.unlinkSync(path.join(dir, file));
        console.log(`  已删除乱码文件: ${file}`);
      } catch (e) {
        console.error(`  删除失败: ${file}`, e);
      }
    }
  });

  console.log("--- AFTER CLEAN ---");
  console.log(fs.readdirSync(dir));
}
