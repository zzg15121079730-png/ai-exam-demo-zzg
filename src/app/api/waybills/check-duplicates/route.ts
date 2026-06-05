import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // items: { externalCode: string, skuCode: string }[]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    // 筛选出同时具有外部编码和 SKU 编码的组合
    const conditions = items
      .filter(item => item.externalCode && item.skuCode)
      .map(item => ({
        externalCode: String(item.externalCode).trim(),
        skuCode: String(item.skuCode).trim()
      }));

    if (conditions.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    // 联合条件去重查询
    const existing = await prisma.waybill.findMany({
      where: {
        OR: conditions
      },
      select: { externalCode: true, skuCode: true }
    });

    // 转换成 "externalCode_skuCode" 数组格式返回
    const duplicates = existing
      .map(e => e.externalCode && e.skuCode ? `${e.externalCode}_${e.skuCode}` : "")
      .filter(Boolean);

    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
