import prisma from "@/lib/prisma"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PrintButton from "@/components/PrintButton"
import Image from "next/image"

export default async function IdCardsListPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const idCards = await prisma.idCard.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            qrCode: true,
            createdBy: {
                select: { name: true, email: true }
            }
        }
    })

    // Chunk the ID cards into groups of 3 for A4 pagination
    const cardsPerPage = 3
    const chunkedIdCards = []
    for (let i = 0; i < idCards.length; i += cardsPerPage) {
        chunkedIdCards.push(idCards.slice(i, i + cardsPerPage))
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&display=swap');

                /* ── Existing Screen Styles ── */
                .idlist-root {
                    min-height: 100vh;
                    background-color: #e8e0d0;
                    background-image: repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 27px,
                        rgba(0,0,0,0.04) 27px,
                        rgba(0,0,0,0.04) 28px
                    );
                    padding: 40px 24px;
                    font-family: 'Courier Prime', 'Courier New', monospace;
                }
                .idlist-inner { max-width: 960px; margin: 0 auto; }
                .idlist-header { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #3a2e22; padding-bottom: 16px; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
                .idlist-eyebrow { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #7a6a52; margin-bottom: 4px; }
                .idlist-title { font-family: 'IM Fell English', Georgia, serif; font-size: 28px; color: #1e1710; line-height: 1.1; }
                .idlist-count { font-size: 11px; color: #7a6a52; margin-top: 4px; letter-spacing: 0.08em; }
                .header-actions { display: flex; gap: 12px; }
                .idlist-create-btn { background-color: #3a2e22; color: #e8dfc8; border: 2px solid #3a2e22; padding: 9px 18px; font-family: 'Courier Prime', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: background-color 0.15s, box-shadow 0.15s, transform 0.1s; white-space: nowrap; }
                .idlist-create-btn:hover { background-color: #1e1710; box-shadow: 3px 3px 0 #1e1710; transform: translate(-1px, -1px); }
                .idlist-table-wrap { background-color: #f5efe4; border: 2px solid #3a2e22; box-shadow: 5px 5px 0 #3a2e22; overflow-x: auto; }
                table.idlist-table { width: 100%; border-collapse: collapse; font-family: 'Courier Prime', monospace; font-size: 13px; }
                .idlist-table thead { background-color: #3a2e22; }
                .idlist-table thead th { padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #c8b89a; white-space: nowrap; }
                .idlist-table tbody tr { border-bottom: 1px solid #d4c9b4; }
                .idlist-table tbody tr:hover { background-color: #ece4d4; }
                .idlist-table tbody td { padding: 11px 14px; color: #2a1e12; vertical-align: middle; }
                .row-photo { width: 40px; height: 40px; object-fit: cover; border: 1px solid #3a2e22; display: block; }
                .row-name { font-family: 'IM Fell English', Georgia, serif; font-size: 15px; color: #1e1710; }
                .row-membership { font-size: 11px; color: #7a6a52; letter-spacing: 0.06em; margin-top: 1px; }
                .row-badge { display: inline-block; border: 1px solid #8a7a62; padding: 2px 7px; font-size: 10px; letter-spacing: 0.1em; color: #5a4a32; background-color: #ede4d2; text-transform: uppercase; }
                .row-qr { width: 36px; height: 36px; border: 1px solid #b0a090; padding: 2px; background: #fff; }
                .row-creator { font-size: 11px; color: #7a6a52; font-style: italic; }
                .idlist-empty { border: 2px dashed #b0a090; padding: 60px 24px; text-align: center; background-color: #f5efe4; box-shadow: 5px 5px 0 #3a2e22; }
                .rule-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                .rule-line { flex: 1; height: 1px; background: #b0a090; }
                .rule-diamond { width: 5px; height: 5px; background: #3a2e22; transform: rotate(45deg); flex-shrink: 0; }

                /* Hide Print Layout on Screen */
                @media screen {
                    .print-layout { display: none; }
                }

                /* ── Print Layout Styles ── */
                @media print {
                    @page { size: A4; margin: 10mm; }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body * { visibility: hidden; }
                    
                    .print-layout, .print-layout * { visibility: visible; }
                    .print-layout { position: absolute; left: 0; top: 0; width: 100%; font-family: sans-serif; }

                    .print-page {
                        display: flex;
                        flex-direction: column;
                        gap: 15px; /* Spacing between rows */
                        page-break-after: always;
                        align-items: center;
                        padding-top: 10px;
                    }
                    
                    .print-row {
                        display: flex;
                        gap: 15px; /* Spacing between Front and Back */
                    }

                    .card-box {
                        position: relative;
                        width: 86mm;
                        height: 54mm;
                        border: 1px dashed #999;
                        box-sizing: border-box;
                        overflow: hidden;
                    }
                    
                    .card-bg {
                        position: absolute;
                        top: 0; left: 0; width: 100%; height: 100%;
                        object-fit: cover;
                        z-index: 0; /* 2. MUST BE 0, NOT -1 */
                    }

                    .val-name { position: absolute; top: 57%; left: 32.5%; font-size: 12px; font-weight: bold; color: #4B0082; z-index: 10; }
                    .val-member { position: absolute; top: 80.5%; left: 45%; font-size: 11px; font-weight: bold; color: #000; z-index: 10; }
                    .val-photo { 
    position: absolute; 
    top: 35.5%; 
    left: 69.8%; 
    width: 26%; 
    height: 57.5%; 
    object-fit: cover; 
    z-index: 10; 
    
    /* Added border properties */
    border: 1px solid #3a2e22; 
    box-sizing: border-box; 
}

                    .val-b-name { position: absolute; top: 62.5%; left: 24%; font-size: 11px; font-weight: bold; color: #4B0082; z-index: 10; }
                    .val-b-address { position: absolute; top: 70%; left: 24%; font-size: 10px; color: #00000; width: 50%; line-height: 1.2; word-wrap: break-word; z-index: 10; }
                    .val-qr { position: absolute; top: 58%; right: 4%; width: 20%; aspect-ratio: 1; background: #fff; padding: 2px; border-radius: 4px; z-index: 10; }
                
                }
            `}</style>

            {/* MAIN SCREEN UI */}
            <div className="idlist-root no-print">
                <div className="idlist-inner">
                    <div className="rule-row">
                        <div className="rule-line" /><div className="rule-diamond" /><div className="rule-line" />
                    </div>

                    {/* Header */}
                    <div className="idlist-header">
                        <div className="idlist-title-block">
                            <p className="idlist-eyebrow">Registry</p>
                            <h1 className="idlist-title">Generated ID Cards</h1>
                            <p className="idlist-count">Total on record: {idCards.length}</p>
                        </div>
                        <div className="header-actions">
                            {idCards.length > 0 && <PrintButton />}
                            <Link href="/idcards/new" className="idlist-create-btn">
                                + Create New ID Card
                            </Link>
                        </div>
                    </div>

                    {/* Table */}
                    {idCards.length > 0 ? (
                        <div className="idlist-table-wrap">
                            <table className="idlist-table">
                                <thead>
                                    <tr>
                                        <th>Photo</th>
                                        <th>Name &amp; Membership</th>
                                        <th>Mobile</th>
                                        <th>Area / State</th>
                                        <th>Constituency</th>
                                        <th>QR</th>
                                        <th>Generated By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {idCards.map((card) => (
                                        <tr key={card.id}>
                                            <td><img src={card.photoUrl} alt={card.name} className="row-photo" /></td>
                                            <td>
                                                <div className="row-name">{card.name}</div>
                                                <div className="row-membership"><span className="row-badge">{card.membershipNo}</span></div>
                                            </td>
                                            <td>{card.mobileNo}</td>
                                            <td>{card.area}, {card.state}</td>
                                            <td>{card.constituency}</td>
                                            <td>
                                                {card.qrCode ? (
                                                    <img src={card.qrCode.qrImageUrl} alt="QR" className="row-qr" />
                                                ) : <span style={{ color: "#b0a090", fontSize: 11 }}>—</span>}
                                            </td>
                                            <td><span className="row-creator">{card.createdBy.name || card.createdBy.email}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="idlist-empty">
                            <p className="idlist-empty-title">No ID Cards on Record</p>
                            <p className="idlist-empty-sub">Begin by generating your first identification card.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PRINT LAYOUT (Hidden on screen, visible on print) */}
            <div className="print-layout">
                {chunkedIdCards.map((pageCards, pageIdx) => (
                    <div className="print-page" key={pageIdx}>
                        {pageCards.map(card => (
                            <div className="print-row" key={`print-${card.id}`}>
                                {/* Front Card */}
                                <div className="card-box front">
                                    {/* USE STANDARD IMG TAG HERE */}
                                    <img src="/Id_Card_Format/card-front.png" className="card-bg" alt="" />

                                    <span className="val-name">{card.name}</span>
                                    <span className="val-member">{card.membershipNo}</span>
                                    <img src={card.photoUrl} className="val-photo" alt="" />
                                </div>

                                {/* Back Card */}
                                <div className="card-box back">
                                    {/* USE STANDARD IMG TAG HERE */}
                                    <img src="/Id_Card_Format/card-back.png" className="card-bg" alt="" />

                                    <span className="val-b-name">{card.name}</span>
                                    <span className="val-b-address">
                                        {card.address}, {card.area}, {card.state}
                                    </span>
                                    {card.qrCode && (
                                        <img src={card.qrCode.qrImageUrl} className="val-qr" alt="" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}