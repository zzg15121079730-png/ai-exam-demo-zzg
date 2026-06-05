import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fingerprint = searchParams.get("fingerprint");

  try {
    if (fingerprint) {
      const rule = await prisma.mappingRule.findUnique({
        where: { fingerprint },
      });
      return NextResponse.json({ rule });
    }

    // 查询所有映射规则
    const rules = await prisma.mappingRule.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching mapping rules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fingerprint, mappings, templateName } = body;

    if (!fingerprint || !mappings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rule = await prisma.mappingRule.upsert({
      where: { fingerprint },
      update: { mappings: JSON.stringify(mappings), templateName },
      create: { fingerprint, mappings: JSON.stringify(mappings), templateName },
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error saving mapping rule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
