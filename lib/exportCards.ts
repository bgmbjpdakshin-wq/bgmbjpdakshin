"use client"

// Card dimensions: 86mm × 54mm at ~96dpi screen pixels
const CARD_W = 325
const CARD_H = 204

// All pixel positions derived from print CSS percentages:
//   top_px  = CARD_H * (percent / 100)
//   left_px = CARD_W * (percent / 100)

// ── FRONT ──────────────────────────────────────────────────────────────────
// val-name    : top 57%  → 116px  |  left 32.5% → 106px
// val-member  : top 80%  → 163px  |  left 34%   → 111px
// val-photo   : top 35.5%→  72px  |  left 69.8% → 227px  w:26%=85px h:57.5%=117px

// ── BACK ───────────────────────────────────────────────────────────────────
// val-b-name         : top 60.5% → 123px  | left 24% → 78px
// val-b-designation  : top 66.2% → 135px  | left 24% → 78px
// val-b-address (no desig): top 70.4% → 144px | left 24% → 78px
// val-b-address (desig)   : top 74.4% → 152px | left 24% → 78px
// val-qr             : top 58%   → 118px  | right 4% → 13px  width:65px

function truncateText(text: string, maxLen: number): string {
  if (!text) return ""
  return text.length > maxLen ? text.substring(0, maxLen - 3) + "..." : text
}

function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img")) as HTMLImageElement[]
  const promises = imgs.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) resolve()
        else {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }
      })
  )
  return Promise.all(promises).then(() => { })
}

/** Creates an off-screen container that html2canvas can reliably render. */
function makeOffscreenShell(): { shell: HTMLElement; card: HTMLElement } {
  // Outer shell — pushed far off-screen but NOT position:fixed (avoids viewport issues)
  const shell = document.createElement("div")
  shell.style.cssText =
    "position:absolute;left:-10000px;top:0;width:0;height:0;overflow:visible;pointer-events:none;"

  // Inner card — position:relative so absolute children resolve against it
  const card = document.createElement("div")
  card.style.cssText = `
    position: relative;
    width: ${CARD_W}px;
    height: ${CARD_H}px;
    overflow: hidden;
    background: #ffffff;
    box-sizing: border-box;
  `
  shell.appendChild(card)
  return { shell, card }
}

function makeBg(src: string): HTMLImageElement {
  const img = document.createElement("img")
  img.src = src
  img.style.cssText =
    "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;"
  return img
}

function makeText(
  text: string,
  topPx: number,
  leftPx: number,
  styles: string
): HTMLSpanElement {
  const span = document.createElement("span")
  span.textContent = text
  span.style.cssText = `
    position: absolute;
    top: ${topPx}px;
    left: ${leftPx}px;
    white-space: nowrap;
    z-index: 10;
    ${styles}
  `
  return span
}

// ─────────────────────────────────────────────────────────────────────────────
// FRONT CARD
// ─────────────────────────────────────────────────────────────────────────────
function createFrontEl(card: any): HTMLElement {
  const { shell, card: wrap } = makeOffscreenShell()

  // Background template
  wrap.appendChild(makeBg("/ID_Card_Format/card-front.png"))

  // Front Container for structured 1-line key-value fields
  const infoContainer = document.createElement("div")
  infoContainer.style.cssText = `
    position: absolute;
    top: 115px;
    left: 12px;
    width: 205px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: Arial, Helvetica, sans-serif;
    z-index: 20;
  `

  const fields = [
    { label: "Name :", value: truncateText(card.name, 22), labelStyle: "font-weight:700;color:#3a2e22;", valStyle: "font-weight:700;color:#4B0082;" },
    { label: "State :", value: truncateText(card.state || "Karnataka", 20), labelStyle: "font-weight:700;color:#3a2e22;", valStyle: "font-weight:600;color:#1f1a14;" },
    { label: "Constituency :", value: truncateText(card.constituency || "Belagavi Dakshin", 20), labelStyle: "font-weight:700;color:#3a2e22;", valStyle: "font-weight:600;color:#1f1a14;" },
    { label: "Membership No. :", value: truncateText(card.membershipNo, 15), labelStyle: "font-weight:700;color:#3a2e22;", valStyle: "font-weight:700;color:#000000;" },
  ]

  fields.forEach(({ label, value, labelStyle, valStyle }) => {
    const row = document.createElement("div")
    row.style.cssText = "font-size:9.5px;line-height:1.35;white-space:nowrap;"

    const lblSpan = document.createElement("span")
    lblSpan.textContent = label
    lblSpan.style.cssText = `display: inline-block; width: 95px; vertical-align: top; padding: 2px 0; ${labelStyle}`

    const valSpan = document.createElement("span")
    valSpan.textContent = value || ""
    valSpan.style.cssText = `display: inline-block; width: 110px; vertical-align: top; padding: 2px 0; ${valStyle}`

    row.appendChild(lblSpan)
    row.appendChild(valSpan)
    infoContainer.appendChild(row)
  })

  wrap.appendChild(infoContainer)

  // Photo  (top:35.5%→72px, left:69.8%→227px, w:85px, h:117px)
  const photo = document.createElement("img")
  photo.src = card.photoUrl
  photo.crossOrigin = "anonymous"
  photo.style.cssText =
    "position:absolute;top:72px;left:227px;width:85px;height:117px;" +
    "object-fit:cover;border:1px solid #3a2e22;box-sizing:border-box;z-index:15;"
  wrap.appendChild(photo)

  return shell
}

// ─────────────────────────────────────────────────────────────────────────────
// BACK CARD
// ─────────────────────────────────────────────────────────────────────────────
function createBackEl(
  card: any,
  withDesignation: boolean
): HTMLElement {
  const { shell, card: wrap } = makeOffscreenShell()
  const showDesig = withDesignation && !!card.designation

  // Background template
  wrap.appendChild(makeBg("/ID_Card_Format/card-back.png"))

  // Back Container for structured 1-line key-value fields
  const infoContainer = document.createElement("div")
  infoContainer.style.cssText = `
    position: absolute;
    top: 127px;
    left: 12px;
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: Arial, Helvetica, sans-serif;
    z-index: 20;
  `

  // 1. Name Row
  const nameRow = document.createElement("div")
  nameRow.style.cssText = "font-size:9.5px;line-height:1.35;white-space:nowrap;"
  const nameLbl = document.createElement("span")
  nameLbl.textContent = "Name :"
  nameLbl.style.cssText = "display: inline-block; width: 72px; vertical-align: top; font-weight:800; color:#1a1008; padding: 2px 0;"
  const nameVal = document.createElement("span")
  nameVal.textContent = truncateText(card.name || "", 25)
  nameVal.style.cssText = "display: inline-block; width: 148px; vertical-align: top; font-weight:700; color:#4B0082; padding: 2px 0;"
  nameRow.appendChild(nameLbl)
  nameRow.appendChild(nameVal)
  infoContainer.appendChild(nameRow)

  // 2. Designation Row (if present/requested)
  if (showDesig) {
    const desigRow = document.createElement("div")
    desigRow.style.cssText = "font-size:9px;line-height:1.35;white-space:nowrap;"
    const desigLbl = document.createElement("span")
    desigLbl.textContent = "Designation :"
    desigLbl.style.cssText = "display: inline-block; width: 72px; vertical-align: top; font-weight:800; color:#4B0082; padding: 2px 0;"
    const desigVal = document.createElement("span")
    desigVal.textContent = truncateText(card.designation, 25)
    desigVal.style.cssText = "display: inline-block; width: 148px; vertical-align: top; color:#2a1e12; font-weight:600; padding: 2px 0;"
    desigRow.appendChild(desigLbl)
    desigRow.appendChild(desigVal)
    infoContainer.appendChild(desigRow)
  }

  // 3. Address Row
  const addrRow = document.createElement("div")
  addrRow.style.cssText = "font-size:9px;line-height:1.3;"
  const addrLbl = document.createElement("span")
  addrLbl.textContent = "Address :"
  addrLbl.style.cssText = "display: inline-block; width: 72px; vertical-align: top; font-weight:800; color:#1a1008; padding: 2px 0;"
  const addrVal = document.createElement("span")
  addrVal.textContent = `${card.address}, ${card.area}, ${card.state}`
  addrVal.style.cssText = "display: inline-block; width: 148px; vertical-align: top; color:#1f1a14; font-weight:600; word-break:break-word; white-space:normal; padding: 2px 0;"
  addrRow.appendChild(addrLbl)
  addrRow.appendChild(addrVal)
  infoContainer.appendChild(addrRow)

  wrap.appendChild(infoContainer)

  // QR Code  (top:58%→118px, right:4%→13px, width:65px)
  if (card.qrCode?.qrImageUrl) {
    const qr = document.createElement("img")
    qr.src = card.qrCode.qrImageUrl
    qr.crossOrigin = "anonymous"
    qr.style.cssText =
      "position:absolute;top:118px;right:13px;width:65px;height:65px;" +
      "background:#fff;padding:2px;border-radius:4px;z-index:15;"
    wrap.appendChild(qr)
  }

  return shell
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function exportCardsAsZip(
  cards: any[],
  withDesignation: boolean,
  onProgress: (current: number, total: number) => void
): Promise<void> {
  // Dynamic imports — never run on server
  const html2canvas = (await import("html2canvas")).default
  const JSZip = (await import("jszip")).default
  const { saveAs } = await import("file-saver")

  const zip = new JSZip()
  const origin = window.location.origin

  const captureCard = async (
    shell: HTMLElement
  ): Promise<string> => {
    // The actual card div is the first (and only) child of shell
    const cardEl = shell.firstElementChild as HTMLElement
    document.body.appendChild(shell)
    await waitForImages(cardEl)

    const canvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      width: CARD_W,
      height: CARD_H,
      backgroundColor: "#ffffff",
      logging: false,
    } as any)

    document.body.removeChild(shell)
    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1]
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]

    const frontJpeg = await captureCard(createFrontEl(card))
    const backJpeg = await captureCard(createBackEl(card, withDesignation))

    // Folder: membershipNo_Name  (safe for all filesystems)
    const safeName = card.name.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_")
    const folder = zip.folder(`${card.membershipNo}_${safeName}`)!
    folder.file("front.jpg", frontJpeg, { base64: true })
    folder.file("back.jpg", backJpeg, { base64: true })

    onProgress(i + 1, cards.length)
  }

  const blob = await zip.generateAsync({ type: "blob" })
  saveAs(blob, "id-cards-export.zip")
}
