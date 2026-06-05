import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { RuleEngine, RuleConfig } from "@/utils/ruleEngine";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const ruleStr = formData.get("rule") as string;

    if (!file || !ruleStr) {
      return NextResponse.json({ error: "文件或解析规则缺失" }, { status: 400 });
    }

    const rule: RuleConfig = JSON.parse(ruleStr);
    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    let parsedData: any[] = [];

    if (rule.fileType === "excel") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      parsedData = RuleEngine.parseExcel(workbook, rule);
    } else if (rule.fileType === "pdf") {
      const pdfData = await pdf(buffer);
      parsedData = RuleEngine.parseText(pdfData.text, rule);
    } else if (rule.fileType === "word") {
      const docxData = await mammoth.extractRawText({ buffer });
      parsedData = RuleEngine.parseText(docxData.value, rule);
    } else {
      return NextResponse.json({ error: "不支持的解析规则类型: " + rule.fileType }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: parsedData.length,
      data: parsedData
    });

  } catch (error: any) {
    console.error("解析文件失败:", error);
    return NextResponse.json({ error: "文件解析执行失败: " + error.message }, { status: 500 });
  }
}
