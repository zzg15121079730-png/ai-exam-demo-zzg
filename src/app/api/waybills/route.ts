import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// 内存中的运单临时库，作为数据库异常或缺失时的极速降级备用
let memoryWaybills: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const batchId = uuidv4();
    
    // 检查外部编码在数据库中的重复情况
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
        console.warn("Database connection failed during duplicate check. Checking in memory fallback instead:", dbErr);
        // 数据库连不上时，降级从内存列表查重
        duplicatesInDb = memoryWaybills
          .map(w => w.externalCode)
          .filter(code => code && externalCodes.includes(code));
      }
    }

    // 过滤掉重复项
    const filteredData = duplicatesInDb.length > 0
      ? data.filter(item => !item.externalCode || !duplicatesInDb.includes(item.externalCode))
      : data;

    if (filteredData.length === 0) {
      return NextResponse.json({
        error: "所有数据的外部编码均与数据库重复，无新数据可导入",
        duplicates: duplicatesInDb
      }, { status: 400 });
    }

    // 映射并规范化运单数据
    const waybills = filteredData.map(item => ({
      id: item.id || `mem-wb-${uuidv4()}`,
      externalCode: item.externalCode ? String(item.externalCode) : null,
      senderName: String(item.senderName || ""),
      senderPhone: String(item.senderPhone || ""),
      senderAddress: String(item.senderAddress || ""),
      receiverStore: item.receiverStore ? String(item.receiverStore) : null,
      receiverName: String(item.receiverName || ""),
      receiverPhone: String(item.receiverPhone || ""),
      receiverAddress: String(item.receiverAddress || ""),
      skuCode: item.skuCode ? String(item.skuCode) : null,
      skuName: item.skuName ? String(item.skuName) : null,
      skuSpec: item.skuSpec ? String(item.skuSpec) : null,
      weight: Number(item.weight) || 0,
      quantity: Math.round(Number(item.quantity) || 0),
      tempZone: String(item.tempZone || "常温"),
      remark: item.remark ? String(item.remark) : null,
      batchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // 尝试写入数据库
    try {
      // 1. 尝试包含 receiverStore 字段的直接写入
      const insertData = waybills.map(({ id, ...rest }) => rest);
      const result = await prisma.waybill.createMany({
        data: insertData,
      });

      // 同步缓存到内存
      memoryWaybills = [...waybills, ...memoryWaybills];

      return NextResponse.json({
        success: true,
        count: result.count,
        batchId,
        skippedDuplicates: duplicatesInDb.length,
      });
    } catch (dbErr) {
      console.warn("Direct db insert failed, trying compatible insert without receiverStore column...", dbErr);
      
      try {
        // 2. 方案B：若数据库无 receiverStore 字段，则兼容性拼接后删除该属性写入
        const compatibleInsertData = waybills.map(({ id, receiverStore, ...rest }) => {
          return {
            ...rest,
            receiverName: rest.receiverName || receiverStore || "门店收货",
            remark: receiverStore ? `[收货门店: ${receiverStore}] ${rest.remark || ""}` : rest.remark
          };
        });

        const result = await prisma.waybill.createMany({
          data: compatibleInsertData,
        });

        // 内存中仍保留高保真的 receiverStore 字段，以供前端刷新直接显示
        memoryWaybills = [...waybills, ...memoryWaybills];

        return NextResponse.json({
          success: true,
          count: result.count,
          batchId,
          skippedDuplicates: duplicatesInDb.length,
        });
      } catch (finalDbErr) {
        console.error("Compatible database insert failed. Fallback to memory-only storage:", finalDbErr);
        // 3. 方案C：若数据库连不上，则完全内存式保存，不报错阻塞
        memoryWaybills = [...waybills, ...memoryWaybills];
        return NextResponse.json({
          success: true,
          count: waybills.length,
          batchId,
          skippedDuplicates: duplicatesInDb.length,
          isFallback: true
        });
      }
    }
  } catch (error: any) {
    console.error("Error saving waybills:", error);
    return NextResponse.json({ 
      error: "保存失败: " + (error?.message || "Internal server error")
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  try {
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { externalCode: { contains: search, mode: "insensitive" } },
        { receiverName: { contains: search, mode: "insensitive" } },
        { receiverStore: { contains: search, mode: "insensitive" } },
      ];
    }

    // 导入时间范围筛选
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    try {
      const [total, items] = await prisma.$transaction([
        prisma.waybill.count({ where: whereClause }),
        prisma.waybill.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      // 对从数据库查出的字段进行向下兼容还原（如果在备注里有拼接门店）
      const itemsWithStore = items.map((w: any) => {
        const completed = { ...w };
        if (!completed.receiverStore && completed.remark?.startsWith("[收货门店: ")) {
          const match = completed.remark.match(/^\[收货门店: (.*?)\]/);
          if (match) {
            completed.receiverStore = match[1];
            completed.remark = completed.remark.replace(/^\[收货门店: (.*?)\]\s*/, "");
          }
        }
        return completed;
      });

      return NextResponse.json({
        total,
        items: itemsWithStore,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (dbErr) {
      console.warn("Database query failed, returning filtered memory storage:", dbErr);
      
      // 数据库异常时的内存多维度搜索降级
      let filtered = [...memoryWaybills];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(w => 
          (w.externalCode && w.externalCode.toLowerCase().includes(s)) ||
          (w.receiverName && w.receiverName.toLowerCase().includes(s)) ||
          (w.receiverStore && w.receiverStore.toLowerCase().includes(s))
        );
      }
      
      if (startDate || endDate) {
        filtered = filtered.filter(w => {
          const created = new Date(w.createdAt).getTime();
          if (startDate && created < new Date(startDate).getTime()) return false;
          if (endDate && created > new Date(endDate).getTime()) return false;
          return true;
        });
      }

      const total = filtered.length;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);

      return NextResponse.json({
        total,
        items,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        isFallback: true
      });
    }
  } catch (error) {
    console.error("Error fetching waybills:", error);
    
    // 终极安全回退
    const total = memoryWaybills.length;
    const items = memoryWaybills.slice((page - 1) * pageSize, page * pageSize);
    return NextResponse.json({
      total,
      items,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      isFallback: true
    });
  }
}
