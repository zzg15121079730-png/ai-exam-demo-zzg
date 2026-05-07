import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const batchId = uuidv4();
    
    // Check for duplicate external codes in DB
    const externalCodes = data.map(item => item.externalCode).filter(Boolean);
    let duplicatesInDb: string[] = [];
    
    if (externalCodes.length > 0) {
      try {
        const existing = await prisma.waybill.findMany({
          where: {
            externalCode: { in: externalCodes }
          },
          select: { externalCode: true }
        });
        duplicatesInDb = existing.map((e: any) => e.externalCode!).filter(Boolean);
      } catch (dbErr) {
        console.error("Error checking duplicates:", dbErr);
        // Continue even if duplicate check fails
      }
    }

    // Filter out duplicate rows instead of hard-blocking
    const filteredData = duplicatesInDb.length > 0
      ? data.filter(item => !item.externalCode || !duplicatesInDb.includes(item.externalCode))
      : data;

    if (filteredData.length === 0) {
      return NextResponse.json({
        error: "所有数据的外部编码均与数据库重复，无新数据可导入",
        duplicates: duplicatesInDb
      }, { status: 400 });
    }

    // Build insert data with safe type conversions
    const waybills = filteredData.map(item => ({
      externalCode: item.externalCode ? String(item.externalCode) : null,
      senderName: String(item.senderName || ""),
      senderPhone: String(item.senderPhone || ""),
      senderAddress: String(item.senderAddress || ""),
      receiverName: String(item.receiverName || ""),
      receiverPhone: String(item.receiverPhone || ""),
      receiverAddress: String(item.receiverAddress || ""),
      weight: Number(item.weight) || 0,
      quantity: Math.round(Number(item.quantity) || 0),
      tempZone: String(item.tempZone || "常温"),
      remark: item.remark ? String(item.remark) : null,
      batchId,
    }));

    const result = await prisma.waybill.createMany({
      data: waybills,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      batchId,
      skippedDuplicates: duplicatesInDb.length,
    });
  } catch (error: any) {
    console.error("Error saving waybills:", error);
    return NextResponse.json({ 
      error: "保存失败: " + (error?.message || "Internal server error"),
      details: error?.meta || null 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { externalCode: { contains: search, mode: "insensitive" } },
        { receiverName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, items] = await prisma.$transaction([
      prisma.waybill.count({ where: whereClause }),
      prisma.waybill.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      total,
      items,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching waybills:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
