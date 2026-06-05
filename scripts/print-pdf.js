const fs = require('fs');
const pdf = require('pdf-parse');

async function printPdf() {
  const buffer = fs.readFileSync('C:\\Users\\Administrator\\Desktop\\demos\\黔寨寨贵州烙锅（鞍山店）常温.pdf');
  const data = await pdf(buffer);
  console.log("=== PDF TEXT START ===");
  console.log(data.text);
  console.log("=== PDF TEXT END ===");
}

printPdf();
