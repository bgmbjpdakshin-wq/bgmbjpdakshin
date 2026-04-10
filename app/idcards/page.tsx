import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import IdCardsClient from "@/components/IdCardsClient"

export default async function IdCardsListPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; page?: string; limit?: string }> 
}) {
    const resolvedParams = await searchParams
    const query = resolvedParams?.query || ""
    const currentPage = Number(resolvedParams?.page) || 1
    const limit = Number(resolvedParams?.limit) || 10
    
    const ITEMS_PER_PAGE = limit

    const where = query
        ? {
              OR: [
                  { name: { contains: query, mode: "insensitive" as const } },
                  { membershipNo: { contains: query, mode: "insensitive" as const } },
                  { mobileNo: { contains: query, mode: "insensitive" as const } },
              ],
          }
        : {}
    
    const hasDatabase = !!process.env.DATABASE_URL

    let idCards: any[] = []
    let totalCards = 0

    if (hasDatabase) {
        try {
            const [realIdCards, realTotalCards] = (await Promise.all([
                prisma.idCard.findMany({
                    where,
                    orderBy: { membershipNo: "asc" },
                    skip: (currentPage - 1) * ITEMS_PER_PAGE,
                    take: ITEMS_PER_PAGE,
                    include: {
                        qrCode: true,
                        createdBy: {
                            select: { name: true, email: true },
                        },
                    },
                }),
                prisma.idCard.count({ where }),
            ])) as [any[], number]

            idCards = realIdCards
            totalCards = realTotalCards
        } catch (error) {
            // Local/dev fallback: if DB URL exists but connection fails, render sample data.
            console.error("Failed to fetch ID cards from DB, using fallback data:", error)
            idCards = [
                {
                    id: "sample-1",
                    name: "Sample Member One",
                    address: "Sample Street 1",
                    area: "Sample Area",
                    mobileNo: "9999999999",
                    state: "Sample State",
                    constituency: "Belagavi dakshin",
                    membershipNo: "1001",
                    designation: "President",
                    photoUrl: "/Id_Card_Format/card-front.png",
                    qrCode: null,
                },
                {
                    id: "sample-2",
                    name: "Sample Member Two",
                    address: "Sample Street 2",
                    area: "Sample Area",
                    mobileNo: "8888888888",
                    state: "Sample State",
                    constituency: "Belagavi dakshin",
                    membershipNo: "1002",
                    designation: "President",
                    photoUrl: "/Id_Card_Format/card-front.png",
                    qrCode: null,
                },
            ]
            totalCards = idCards.length
        }
    } else {
        idCards = [
            {
                id: "sample-1",
                name: "Sample Member One",
                address: "Sample Street 1",
                area: "Sample Area",
                mobileNo: "9999999999",
                state: "Sample State",
                constituency: "Sample Constituency",
                membershipNo: "1001",
                photoUrl: "/Id_Card_Format/card-front.png",
                qrCode: null,
            },
            {
                id: "sample-2",
                name: "Sample Member Two",
                address: "Sample Street 2",
                area: "Sample Area",
                mobileNo: "8888888888",
                state: "Sample State",
                constituency: "Sample Constituency",
                membershipNo: "1002",
                photoUrl: "/Id_Card_Format/card-front.png",
                qrCode: null,
            },
        ]
        totalCards = idCards.length
    }

    const totalPages = Math.ceil(totalCards / ITEMS_PER_PAGE)

    return (
        <IdCardsClient 
            idCards={idCards}
            query={query}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCards={totalCards}
            limit={limit}
        />
    )
}