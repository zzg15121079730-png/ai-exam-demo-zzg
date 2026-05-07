import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codes } = body;

    if (!Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    const existing = await prisma.waybill.findMany({
      where: {
        externalCode: { in: codes }
      },
      select: { externalCode: true, id: true }
    });

    const duplicates = existing.map(e => e.externalCode!).filter(Boolean);

    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
