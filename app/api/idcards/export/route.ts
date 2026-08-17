import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const idCards = await prisma.idCard.findMany({
      orderBy: { membershipNo: "asc" },
      include: {
        qrCode: true,
      },
    })

    return NextResponse.json({ idCards })
  } catch (error) {
    console.error("Failed to fetch all ID cards for export:", error)
    return NextResponse.json({ error: "Failed to fetch ID cards" }, { status: 500 })
  }
}
