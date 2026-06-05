import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 内存备份规则，用于数据库未配置或异常时的无缝降级
let memoryRules: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fingerprint = searchParams.get("fingerprint");

  try {
    if (fingerprint) {
      try {
        const rule = await prisma.mappingRule.findUnique({
          where: { fingerprint },
        });
        return NextResponse.json({ rule });
      } catch (dbErr) {
        console.warn("Database connection failed, fallback to memory storage for rule fingerprint:", dbErr);
        const rule = memoryRules.find(r => r.fingerprint === fingerprint) || null;
        return NextResponse.json({ rule, isFallback: true });
      }
    }

    try {
      // 查询所有映射规则
      const rules = await prisma.mappingRule.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ rules });
    } catch (dbErr) {
      console.warn("Database connection failed, fallback to memory rules:", dbErr);
      return NextResponse.json({ rules: memoryRules, isFallback: true });
    }
  } catch (error) {
    console.error("Error fetching mapping rules:", error);
    return NextResponse.json({ rules: memoryRules, isFallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint, mappings, templateName } = body;

    if (!fingerprint || !mappings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const memoryRule = {
      id: `mem-rule-${Date.now()}`,
      fingerprint,
      mappings: typeof mappings === "string" ? mappings : JSON.stringify(mappings),
      templateName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const rule = await prisma.mappingRule.upsert({
        where: { fingerprint },
        update: { mappings: JSON.stringify(mappings), templateName },
        create: { fingerprint, mappings: JSON.stringify(mappings), templateName },
      });
      return NextResponse.json({ rule });
    } catch (dbErr) {
      console.warn("Database save failed, saving rule to memory storage:", dbErr);
      const idx = memoryRules.findIndex(r => r.fingerprint === fingerprint);
      if (idx > -1) {
        memoryRules[idx] = memoryRule;
      } else {
        memoryRules.push(memoryRule);
      }
      return NextResponse.json({ rule: memoryRule, isFallback: true });
    }
  } catch (error) {
    console.error("Error saving mapping rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const fingerprint = searchParams.get("fingerprint");

    if (!id && !fingerprint) {
      return NextResponse.json({ error: "Missing id or fingerprint" }, { status: 400 });
    }

    try {
      if (id) {
        await prisma.mappingRule.delete({ where: { id } });
      } else if (fingerprint) {
        await prisma.mappingRule.delete({ where: { fingerprint } });
      }
      // 同步清理内存
      memoryRules = memoryRules.filter(r => r.id !== id && r.fingerprint !== fingerprint);
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      console.warn("Database delete failed, removing from memory:", dbErr);
      memoryRules = memoryRules.filter(r => r.id !== id && r.fingerprint !== fingerprint);
      return NextResponse.json({ success: true, isFallback: true });
    }
  } catch (error) {
    console.error("Error deleting mapping rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
