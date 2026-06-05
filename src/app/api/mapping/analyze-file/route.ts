import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未找到上传的文件" }, { status: 400 });
    }

    const filename = file.name;
    const fileExtension = filename.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      // 解析 Excel
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetsData = workbook.SheetNames.map(name => {
        const sheet = workbook.Sheets[name];
        // 读取全部数据为 AoA (Array of Arrays)
        const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        // 只拿前 30 行作为样本，避免太大
        const sampleAoa = aoa.slice(0, 30);
        return {
          name,
          aoa: sampleAoa,
          totalRows: aoa.length,
          totalCols: aoa.length > 0 ? aoa[0].length : 0
        };
      });

      return NextResponse.json({
        fileType: "excel",
        fileName: filename,
        excelSample: {
          sheets: sheetsData
        }
      });
    } else if (fileExtension === "pdf") {
      // 解析 PDF
      try {
        const pdfData = await pdf(buffer);
        // 只保留前 4000 个字符作为样本
        const sampleText = pdfData.text.slice(0, 4000);
        return NextResponse.json({
          fileType: "pdf",
          fileName: filename,
          textSample: pdfData.text, // 传完整文本用于后面的具体解析，但 AI 提示只需传 sample
          sampleTextText: sampleText
        });
      } catch (err: any) {
        console.error("PDF 解析失败:", err);
        return NextResponse.json({ error: "PDF 解析失败: " + err.message }, { status: 400 });
      }
    } else if (fileExtension === "docx") {
      // 解析 Word
      try {
        const docxData = await mammoth.extractRawText({ buffer });
        const sampleText = docxData.value.slice(0, 4000);
        return NextResponse.json({
          fileType: "word",
          fileName: filename,
          textSample: docxData.value,
          sampleTextText: sampleText
        });
      } catch (err: any) {
        console.error("Word 解析失败:", err);
        return NextResponse.json({ error: "Word 解析失败: " + err.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "不支持的文件格式，仅支持 Excel、Word 和 PDF" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("文件分析失败:", error);
    return NextResponse.json({ error: "服务器内部错误: " + error.message }, { status: 500 });
  }
}
