"use client"

import Link from "next/link"
import DeleteButton from "@/components/DeleteButton"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { exportCardsAsZip } from "@/lib/exportCards"

export default function IdCardsClient({
    idCards,
    query,
    currentPage,
    totalPages,
    totalCards,
    limit
}: {
    idCards: any[]
    query: string
    currentPage: number
    totalPages: number
    totalCards: number
    limit: number
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showPrintChoice, setShowPrintChoice] = useState(false)
    const [printWithDesignation, setPrintWithDesignation] = useState(false)
    const [printTriggered, setPrintTriggered] = useState(false)

    // Export ZIP state
    const [showExportChoice, setShowExportChoice] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })

    useEffect(() => {
        if (printTriggered) {
            // A 300ms delay ensures React finishes rendering all chunks before printing
            const timer = setTimeout(() => {
                window.print()
                setPrintTriggered(false) // Reset after print dialog opens
            }, 300)

            return () => clearTimeout(timer)
        }
    }, [printTriggered])

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === idCards.length && idCards.length > 0) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(idCards.map((c) => c.id)))
        }
    }

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", newLimit)
        params.set("page", "1") // Reset to page 1
        router.push(`${pathname}?${params.toString()}`)
    }

    const printCards = selectedIds.size > 0
        ? idCards.filter((c) => selectedIds.has(c.id))
        : idCards

    const cardsPerPagePrint = 3
    const chunkedIdCards = []
    for (let i = 0; i < printCards.length; i += cardsPerPagePrint) {
        chunkedIdCards.push(printCards.slice(i, i + cardsPerPagePrint))
    }

    const handlePrint = () => {
        setShowPrintChoice(true)
    }

    const handlePrintChoice = (withDesignation: boolean) => {
        setPrintWithDesignation(withDesignation)
        setShowPrintChoice(false)
        setPrintTriggered(true)
    }

    const handleExport = () => {
        setShowExportChoice(true)
    }

    const handleExportChoice = async (withDesignation: boolean) => {
        setShowExportChoice(false)
        setIsExporting(true)
        setExportProgress({ current: 0, total: 0 })

        try {
            // Fetch ALL cards from the server (ignores pagination)
            const res = await fetch("/api/idcards/export")
            if (!res.ok) throw new Error("Failed to fetch cards for export")
            const { idCards: allCards } = await res.json()

            // If user has selected specific cards, filter to those; otherwise export all
            const cardsToExport =
                selectedIds.size > 0
                    ? allCards.filter((c: any) => selectedIds.has(c.id))
                    : allCards

            setExportProgress({ current: 0, total: cardsToExport.length })

            await exportCardsAsZip(
                cardsToExport,
                withDesignation,
                (current, total) => setExportProgress({ current, total })
            )
        } catch (err) {
            console.error("Export failed:", err)
            alert("Export failed. Please try again.")
        } finally {
            setIsExporting(false)
            setExportProgress({ current: 0, total: 0 })
        }
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
                    padding: 24px 16px;
                    font-family: 'Courier Prime', 'Courier New', monospace;
                }
                .idlist-inner { max-width: 960px; margin: 0 auto; }
                .idlist-header { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #3a2e22; padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
                .idlist-eyebrow { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #7a6a52; margin-bottom: 4px; }
                .idlist-title { font-family: 'IM Fell English', Georgia, serif; font-size: 28px; color: #1e1710; line-height: 1.1; }
                .idlist-count { font-size: 11px; color: #7a6a52; margin-top: 4px; letter-spacing: 0.08em; }
                .header-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
                .idlist-create-btn { background-color: #3a2e22; color: #e8dfc8; border: 2px solid #3a2e22; padding: 9px 18px; font-family: 'Courier Prime', monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: background-color 0.15s, box-shadow 0.15s, transform 0.1s; white-space: nowrap; }
                .idlist-create-btn:hover { background-color: #1e1710; box-shadow: 3px 3px 0 #1e1710; transform: translate(-1px, -1px); }
                .print-choice-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 16px;
                }
                .print-choice-modal {
                    width: 100%;
                    max-width: 420px;
                    background: #f5efe4;
                    border: 2px solid #3a2e22;
                    box-shadow: 6px 6px 0 #3a2e22;
                    padding: 16px;
                }
                .print-choice-title {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #3a2e22;
                    margin-bottom: 8px;
                }
                .print-choice-subtitle {
                    font-size: 12px;
                    color: #5a4a32;
                    margin-bottom: 14px;
                }
                .print-choice-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .print-choice-btn {
                    border: 2px solid #3a2e22;
                    padding: 8px 10px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    cursor: pointer;
                    font-family: 'Courier Prime', monospace;
                    background: #3a2e22;
                    color: #e8dfc8;
                }
                .print-choice-btn.secondary {
                    background: transparent;
                    color: #3a2e22;
                }

                /* ── Export progress overlay ── */
                .export-progress-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 16px;
                }
                .export-progress-modal {
                    width: 100%;
                    max-width: 380px;
                    background: #f5efe4;
                    border: 2px solid #3a2e22;
                    box-shadow: 6px 6px 0 #3a2e22;
                    padding: 24px 28px;
                    text-align: center;
                }
                .export-progress-title {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #3a2e22;
                    margin-bottom: 16px;
                }
                .export-progress-bar-wrap {
                    width: 100%;
                    height: 6px;
                    background: #d4c9b4;
                    margin-bottom: 12px;
                    position: relative;
                    overflow: hidden;
                }
                .export-progress-bar {
                    height: 100%;
                    background: #3a2e22;
                    transition: width 0.2s ease;
                }
                .export-progress-count {
                    font-size: 12px;
                    color: #5a4a32;
                    letter-spacing: 0.06em;
                }
                .idlist-table-wrap { background-color: #f5efe4; border: 2px solid #3a2e22; box-shadow: 5px 5px 0 #3a2e22; overflow-x: auto; margin-bottom: 20px; }
                table.idlist-table { width: 100%; border-collapse: collapse; font-family: 'Courier Prime', monospace; font-size: 13px; }
                .idlist-table thead { background-color: #3a2e22; }
                .idlist-table thead th { padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #c8b89a; white-space: nowrap; }
                .idlist-table tbody tr { border-bottom: 1px solid #d4c9b4; }
                .idlist-table tbody tr:hover { background-color: #ece4d4; }
                .idlist-table tbody tr.selected { background-color: #e2d8c3; }
                .idlist-table tbody td { padding: 10px 10px; color: #2a1e12; vertical-align: middle; }
                .row-checkbox { cursor: pointer; width: 16px; height: 16px; accent-color: #3a2e22; }
                .row-photo { width: 40px; height: 40px; object-fit: cover; border: 1px solid #3a2e22; display: block; }
                .row-name { font-family: 'IM Fell English', Georgia, serif; font-size: 15px; color: #1e1710; }
                .row-membership { font-size: 11px; color: #7a6a52; letter-spacing: 0.06em; margin-top: 1px; }
                .row-designation { font-size: 10px; color: #5a4a32; margin-top: 2px; font-style: italic; }
                .row-badge { display: inline-block; border: 1px solid #8a7a62; padding: 2px 7px; font-size: 10px; letter-spacing: 0.1em; color: #5a4a32; background-color: #ede4d2; text-transform: uppercase; }
                .row-qr { width: 36px; height: 36px; border: 1px solid #b0a090; padding: 2px; background: #fff; }
                .row-creator { font-size: 11px; color: #7a6a52; font-style: italic; }
                .idlist-empty { border: 2px dashed #b0a090; padding: 60px 24px; text-align: center; background-color: #f5efe4; box-shadow: 5px 5px 0 #3a2e22; }
                .rule-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                .rule-line { flex: 1; height: 1px; background: #b0a090; }
                .rule-diamond { width: 5px; height: 5px; background: #3a2e22; transform: rotate(45deg); flex-shrink: 0; }

                .search-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
                .search-input { flex: 1; min-width: 200px; padding: 10px; font-family: 'Courier Prime', monospace; border: 2px solid #3a2e22; background: #fdf8f0; font-size: 13px; }
                .search-btn { background: #3a2e22; color: #e8dfc8; border: 2px solid #3a2e22; padding: 0 16px; font-family: 'Courier Prime', monospace; font-weight: 700; cursor: pointer; }
                .limit-select { padding: 10px; font-family: 'Courier Prime', monospace; border: 2px solid #3a2e22; background: #fdf8f0; font-size: 13px; cursor: pointer; color: #3a2e22; font-weight: bold; }
                .limit-select:focus { outline: none; border-color: #1e1710; }
                
                .action-btns { display: flex; gap: 8px; }
                .btn-edit { color: #3a2e22; text-decoration: none; font-weight: bold; border: 1px solid #3a2e22; padding: 4px 8px; font-size: 10px; text-transform: uppercase; background: #ede4d2; }
                .btn-edit:hover { background: #3a2e22; color: #e8dfc8; }

                .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 12px; flex-wrap: wrap; gap: 12px; }
                .page-controls { display: flex; gap: 10px; }
                .page-btn { padding: 6px 12px; border: 1px solid #3a2e22; background: transparent; color: #3a2e22; text-decoration: none; font-weight: bold; }
                .page-btn[disabled] { opacity: 0.5; pointer-events: none; }
                .page-btn:hover:not([disabled]) { background: #3a2e22; color: #e8dfc8; }

                /* Hide Print Layout on Screen but keep in DOM and off-screen for eager asset preloading */
                @media screen {
                    .print-layout {
                        position: absolute;
                        left: -9999px;
                        top: -9999px;
                        width: 0;
                        height: 0;
                        overflow: hidden;
                    }
                }

                /* ── Mobile adjustments ── */
                @media (max-width: 640px) {
                    .idlist-root { padding: 16px 10px; }
                    .idlist-header { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .header-actions { width: 100%; justify-content: flex-start; }
                    .idlist-title { font-size: 22px; }
                    .idlist-table-wrap { border-width: 1px; box-shadow: 3px 3px 0 #3a2e22; }
                    table.idlist-table { font-size: 11px; }
                    .idlist-table thead th { padding: 8px 6px; font-size: 9px; }
                    .idlist-table tbody td { padding: 8px 6px; }
                    .row-photo { width: 32px; height: 32px; }
                    .row-name { font-size: 13px; }
                    .row-membership { font-size: 10px; }
                    .row-designation { font-size: 9px; }
                    .pagination { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .limit-select { width: 100%; }
                }

                /* ── Print Layout Styles ── */
                @media print {
                    @page { size: A4; margin: 10mm; }

                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    body * { visibility: hidden; }
                    
                    .print-layout, .print-layout * { visibility: visible; }
                    .print-layout {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        overflow: visible;
                        font-family: sans-serif;
                    }

                    .print-page { display: flex; flex-direction: column; gap: 15px; page-break-after: always; align-items: center; padding-top: 10px; }
                    .print-row { display: flex; gap: 15px; }

                    .card-box { position: relative; width: 86mm; height: 54mm; border: 1px dashed #999; box-sizing: border-box; overflow: hidden; }
                    .card-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }

                    .card-info-front {
                        position: absolute;
                        top: 54%;
                        left: 4%;
                        width: 62%;
                        display: flex;
                        flex-direction: column;
                        gap: 2.5px;
                        font-family: Arial, Helvetica, sans-serif;
                        z-index: 20;
                    }
                    .card-info-back {
                        position: absolute;
                        top: 61%;
                        left: 4%;
                        width: 68%;
                        display: flex;
                        flex-direction: column;
                        gap: 2px;
                        font-family: Arial, Helvetica, sans-serif;
                        z-index: 20;
                    }
                    .card-info-row {
                        display: flex;
                        align-items: center;
                        font-size: 8pt;
                        line-height: 1.35;
                        white-space: nowrap;
                    }
                    .card-info-row.address-row {
                        align-items: flex-start;
                        white-space: normal;
                    }
                    .card-info-label {
                        min-width: 28mm;
                        flex-shrink: 0;
                        font-weight: 800;
                        color: #1a1008;
                        text-shadow: 0 0 0 #1a1008;
                    }
                    .card-info-label.back-lbl {
                        min-width: 21mm;
                    }
                    .card-info-val {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-weight: 700;
                        text-shadow: 0 0 0 currentColor;
                    }

                    .val-photo { position: absolute; top: 35.5%; left: 69.8%; width: 26%; height: 57.5%; object-fit: cover; z-index: 15; border: 1px solid #3a2e22; box-sizing: border-box; }
                    .val-qr { position: absolute; top: 58%; right: 4%; width: 20%; aspect-ratio: 1; background: #fff; padding: 2px; border-radius: 4px; z-index: 15; }
                }
            `}</style>

            <div className="idlist-root no-print">
                <div className="idlist-inner">
                    {/* Export choice modal */}
                    {showExportChoice && (
                        <div className="print-choice-backdrop">
                            <div className="print-choice-modal">
                                <p className="print-choice-title">Export Preference</p>
                                <p className="print-choice-subtitle">
                                    Export ID cards with designation on the back, or without?
                                </p>
                                <div className="print-choice-actions">
                                    <button
                                        type="button"
                                        className="print-choice-btn"
                                        onClick={() => handleExportChoice(true)}
                                    >
                                        With Designation
                                    </button>
                                    <button
                                        type="button"
                                        className="print-choice-btn secondary"
                                        onClick={() => handleExportChoice(false)}
                                    >
                                        Without Designation
                                    </button>
                                    <button
                                        type="button"
                                        className="print-choice-btn secondary"
                                        onClick={() => setShowExportChoice(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Export progress overlay */}
                    {isExporting && (
                        <div className="export-progress-backdrop">
                            <div className="export-progress-modal">
                                <p className="export-progress-title">⬇ Generating ZIP…</p>
                                <div className="export-progress-bar-wrap">
                                    <div
                                        className="export-progress-bar"
                                        style={{
                                            width: exportProgress.total > 0
                                                ? `${(exportProgress.current / exportProgress.total) * 100}%`
                                                : "0%"
                                        }}
                                    />
                                </div>
                                <p className="export-progress-count">
                                    {exportProgress.total > 0
                                        ? `Processing card ${exportProgress.current} of ${exportProgress.total}`
                                        : "Fetching cards…"}
                                </p>
                            </div>
                        </div>
                    )}

                    {showPrintChoice && (
                        <div className="print-choice-backdrop">
                            <div className="print-choice-modal">
                                <p className="print-choice-title">Print Preference</p>
                                <p className="print-choice-subtitle">
                                    Print ID cards with designation or without designation?
                                </p>
                                <div className="print-choice-actions">
                                    <button
                                        type="button"
                                        className="print-choice-btn"
                                        onClick={() => handlePrintChoice(true)}
                                    >
                                        With Designation
                                    </button>
                                    <button
                                        type="button"
                                        className="print-choice-btn secondary"
                                        onClick={() => handlePrintChoice(false)}
                                    >
                                        Without Designation
                                    </button>
                                    <button
                                        type="button"
                                        className="print-choice-btn secondary"
                                        onClick={() => setShowPrintChoice(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form method="GET" action="/idcards" className="search-bar">
                        <input
                            type="text"
                            name="query"
                            defaultValue={query}
                            placeholder="Search by name, mobile, or membership no..."
                            className="search-input"
                        />
                        <button type="submit" className="search-btn">Search</button>
                        {query && <Link href="/idcards" className="page-btn">Clear</Link>}
                        <select
                            className="limit-select"
                            name="limit"
                            value={limit.toString()}
                            onChange={handleLimitChange}
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>
                    </form>
                    <div className="rule-row">
                        <div className="rule-line" /><div className="rule-diamond" /><div className="rule-line" />
                    </div>

                    {/* Header */}
                    <div className="idlist-header">
                        <div className="idlist-title-block">
                            <p className="idlist-eyebrow">Registry</p>
                            <h1 className="idlist-title">Generated ID Cards</h1>
                            <p className="idlist-count">Total on record: {totalCards}</p>
                        </div>
                        <div className="header-actions">
                            {idCards.length > 0 && (
                                <>
                                    <button
                                        onClick={handleExport}
                                        className="idlist-create-btn"
                                        disabled={isExporting}
                                        style={{ backgroundColor: "#574B35", borderColor: "#574B35", opacity: isExporting ? 0.5 : 1, cursor: isExporting ? "not-allowed" : "pointer" }}
                                    >
                                        {selectedIds.size > 0
                                            ? `⬇ Export Selected (${selectedIds.size})`
                                            : "⬇ Export ZIP"}
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="idlist-create-btn"
                                        style={{ backgroundColor: "#5a4a32", borderColor: "#5a4a32" }}
                                    >
                                        {selectedIds.size > 0 ? `Print Selected (${selectedIds.size})` : "Print ID Cards"}
                                    </button>
                                </>
                            )}
                            <Link href="/idcards/new" className="idlist-create-btn">
                                + Create New ID Card
                            </Link>
                        </div>
                    </div>

                    {/* Table */}
                    {idCards.length > 0 ? (<>
                        <div className="idlist-table-wrap">
                            <table className="idlist-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                className="row-checkbox"
                                                checked={selectedIds.size === idCards.length && idCards.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th>S.No.</th>
                                        <th>Photo</th>
                                        <th>Name &amp; Membership</th>
                                        <th>Designation</th>
                                        <th>Mobile</th>
                                        <th>Area / State</th>
                                        <th>Constituency</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {idCards.map((card, index) => {
                                        const globalIndex = (currentPage - 1) * limit + index + 1;
                                        const isSelected = selectedIds.has(card.id);
                                        return (
                                            <tr key={card.id} className={isSelected ? 'selected' : ''}>
                                                <td style={{ textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        className="row-checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelect(card.id)}
                                                    />
                                                </td>
                                                <td style={{ fontWeight: 'bold' }}>{globalIndex}</td>
                                                <td><img src={card.photoUrl} alt={card.name} className="row-photo" /></td>
                                                <td>
                                                    <div className="row-name">{card.name}</div>
                                                    <div className="row-membership"><span className="row-badge">{card.membershipNo}</span></div>
                                                    {card.designation && <div className="row-designation">{card.designation}</div>}
                                                </td>
                                                <td>{card.designation || "-"}</td>
                                                <td>{card.mobileNo}</td>
                                                <td>{card.area}, {card.state}</td>
                                                <td>{card.constituency}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <Link href={`/idcards/new?edit=${card.id}`} className="btn-edit">Edit</Link>
                                                        <DeleteButton id={card.id} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <span>Page {currentPage} of {totalPages}</span>
                                <div className="page-controls">
                                    <Link
                                        href={`/idcards?page=${currentPage - 1}${query ? `&query=${query}` : ''}&limit=${limit}`}
                                        className="page-btn"
                                        aria-disabled={currentPage <= 1}
                                        tabIndex={currentPage <= 1 ? -1 : undefined}
                                        style={currentPage <= 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                                    >
                                        « Prev
                                    </Link>
                                    <Link
                                        href={`/idcards?page=${currentPage + 1}${query ? `&query=${query}` : ''}&limit=${limit}`}
                                        className="page-btn"
                                        aria-disabled={currentPage >= totalPages}
                                        tabIndex={currentPage >= totalPages ? -1 : undefined}
                                        style={currentPage >= totalPages ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                                    >
                                        Next »
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                    ) : (
                        <div className="idlist-empty">
                            <p className="idlist-empty-title">No ID Cards Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PRINT LAYOUT (Hidden on screen, visible on print) */}
            <div className="print-layout">
                {chunkedIdCards.map((pageCards: any[], pageIdx: number) => (
                    <div className="print-page" key={pageIdx}>
                        {pageCards.map((card, cardIdx) => {
                            const serial = pageIdx * cardsPerPagePrint + cardIdx + 1

                            return (
                                <div className="print-row" key={`print-${card.id}`}>
                                     {/* Front Card */}
                                     <div className="card-box front">
                                         <img src="/ID_Card_Format/card-front.png" className="card-bg" alt="" />

                                         <div className="card-info-front">
                                             <div className="card-info-row">
                                                 <span className="card-info-label">Name :</span>
                                                 <span className="card-info-val" style={{ fontWeight: 700, color: "#4B0082" }}>{card.name}</span>
                                             </div>
                                             <div className="card-info-row">
                                                 <span className="card-info-label">State :</span>
                                                 <span className="card-info-val" style={{ fontWeight: 600, color: "#1f1a14" }}>{card.state || "Karnataka"}</span>
                                             </div>
                                             <div className="card-info-row">
                                                 <span className="card-info-label">Constituency :</span>
                                                 <span className="card-info-val" style={{ fontWeight: 600, color: "#1f1a14" }}>{card.constituency || "Belagavi Dakshin"}</span>
                                             </div>
                                             <div className="card-info-row">
                                                 <span className="card-info-label">Membership No. :</span>
                                                 <span className="card-info-val" style={{ fontWeight: 700, color: "#000000" }}>{card.membershipNo}</span>
                                             </div>
                                         </div>

                                         <img src={card.photoUrl} className="val-photo" alt="" />
                                     </div>

                                     {/* Back Card */}
                                     <div className="card-box back">
                                         <img src="/ID_Card_Format/card-back.png" className="card-bg" alt="" />

                                         <div className="card-info-back">
                                             <div className="card-info-row">
                                                 <span className="card-info-label back-lbl">Name :</span>
                                                 <span className="card-info-val" style={{ fontWeight: 700, color: "#4B0082" }}>{card.name}</span>
                                             </div>
                                             {printWithDesignation && card.designation && (
                                                 <div className="card-info-row">
                                                     <span className="card-info-label back-lbl" style={{ color: "#4B0082" }}>Designation :</span>
                                                     <span className="card-info-val" style={{ color: "#2a1e12" }}>{card.designation}</span>
                                                 </div>
                                             )}
                                             <div className="card-info-row address-row">
                                                 <span className="card-info-label back-lbl">Address :</span>
                                                 <span className="card-info-val" style={{ color: "#1f1a14" }}>{`${card.address}, ${card.area}, ${card.state}`}</span>
                                             </div>
                                         </div>

                                         {card.qrCode && (
                                             <img src={card.qrCode.qrImageUrl} className="val-qr" alt="" />
                                         )}
                                     </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </>
    )
}
