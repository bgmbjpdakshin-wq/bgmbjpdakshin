"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { createIdCard } from "@/app/actions/idcard"
import { useRouter } from "next/navigation"

export default function NewIdCardPage() {
  const router = useRouter()
  const webcamRef = useRef<Webcam>(null)

  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) setImgSrc(imageSrc)
  }, [webcamRef])

  const handleSubmit = async (formData: FormData) => {
    if (!imgSrc) {
      setError("Please capture a photograph first.")
      return
    }
    setIsLoading(true)
    setError("")
    formData.append("photoBase64", imgSrc)
    const result = await createIdCard(formData)
    if (result.success) {
      router.push("/idcards")
      router.refresh()
    } else {
      setError(result.error || "Something went wrong.")
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&display=swap');

        .newid-root {
          min-height: 100vh;
          background-color: #e8e0d0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent, transparent 27px,
            rgba(0,0,0,0.04) 27px, rgba(0,0,0,0.04) 28px
          );
          padding: 40px 24px;
          font-family: 'Courier Prime', 'Courier New', monospace;
        }

        .newid-inner {
          max-width: 880px;
          margin: 0 auto;
        }

        /* ── Page heading ── */
        .newid-page-header {
          border-bottom: 2px solid #3a2e22;
          padding-bottom: 14px;
          margin-bottom: 28px;
        }

        .newid-eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7a6a52;
          margin-bottom: 4px;
        }

        .newid-title {
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 26px;
          color: #1e1710;
        }

        /* ── Error ── */
        .newid-error {
          border: 1px solid #8b2020;
          background-color: #f9ebe8;
          padding: 9px 12px;
          margin-bottom: 22px;
          font-size: 12px;
          color: #8b2020;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .newid-error::before { content: "✗"; font-weight: bold; flex-shrink: 0; }

        /* ── Layout ── */
        .newid-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        @media (max-width: 640px) {
          .newid-grid { grid-template-columns: 1fr; }
        }

        /* ── Panel (shared card style) ── */
        .newid-panel {
          background-color: #f5efe4;
          border: 2px solid #3a2e22;
          box-shadow: 5px 5px 0 #3a2e22;
        }

        .newid-panel-header {
          background-color: #3a2e22;
          padding: 9px 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c8b89a;
        }

        .newid-panel-body {
          padding: 20px 20px 22px;
        }

        /* ── Webcam / photo ── */
        .newid-camera-wrap {
          border: 2px solid #3a2e22;
          background: #1e1710;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .newid-camera-wrap video,
        .newid-camera-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .newid-cam-placeholder {
          text-align: center;
          color: #7a6a52;
        }

        .newid-cam-placeholder p {
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        .newid-cam-btns {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .btn-capture {
          flex: 1;
          background-color: #3a2e22;
          color: #e8dfc8;
          border: 2px solid #3a2e22;
          padding: 9px 12px;
          font-family: 'Courier Prime', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.15s, box-shadow 0.12s, transform 0.1s;
        }

        .btn-capture:hover {
          background-color: #1e1710;
          box-shadow: 3px 3px 0 #1e1710;
          transform: translate(-1px, -1px);
        }

        .btn-retake {
          flex: 1;
          background-color: transparent;
          color: #3a2e22;
          border: 2px solid #3a2e22;
          padding: 9px 12px;
          font-family: 'Courier Prime', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .btn-retake:hover {
          background-color: #ddd5c0;
        }

        /* ── Form fields ── */
        .newid-field {
          margin-bottom: 14px;
        }

        .newid-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3a2e22;
          margin-bottom: 5px;
        }

        .newid-field input,
        .newid-field textarea {
          width: 100%;
          background-color: #fdf8f0;
          border: 1px solid #3a2e22;
          border-radius: 0;
          padding: 8px 10px;
          font-family: 'Courier Prime', monospace;
          font-size: 13px;
          color: #1e1710;
          outline: none;
          -webkit-appearance: none;
          transition: box-shadow 0.15s;
        }

        .newid-field input::placeholder,
        .newid-field textarea::placeholder {
          color: #b0a090;
          font-style: italic;
        }

        .newid-field input:focus,
        .newid-field textarea:focus {
          box-shadow: inset 0 0 0 1px #3a2e22, 2px 2px 0 #3a2e22;
          background-color: #fffdf7;
        }

        .newid-field textarea {
          resize: vertical;
          min-height: 70px;
        }

        .newid-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .newid-divider {
          border: none;
          border-top: 1px dashed #b0a090;
          margin: 18px 0;
        }

        .btn-submit {
          width: 100%;
          background-color: #3a2e22;
          color: #e8dfc8;
          border: 2px solid #3a2e22;
          padding: 12px 16px;
          font-family: 'Courier Prime', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.15s, box-shadow 0.12s, transform 0.1s;
        }

        .btn-submit:hover:not(:disabled) {
          background-color: #1e1710;
          box-shadow: 3px 3px 0 #1e1710;
          transform: translate(-1px, -1px);
        }

        .btn-submit:disabled {
          background-color: #7a6a52;
          border-color: #7a6a52;
          cursor: not-allowed;
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #c8b89a;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .rule-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .rule-line { flex: 1; height: 1px; background: #b0a090; }
        .rule-diamond { width: 5px; height: 5px; background: #3a2e22; transform: rotate(45deg); flex-shrink: 0; }
      `}</style>

      <div className="newid-root">
        <div className="newid-inner">

          <div className="rule-row">
            <div className="rule-line" /><div className="rule-diamond" /><div className="rule-line" />
          </div>

          <div className="newid-page-header">
            <p className="newid-eyebrow">Identification Office</p>
            <h1 className="newid-title">Generate New ID Card</h1>
          </div>

          {error && <div className="newid-error">{error}</div>}

          <div className="newid-grid">

            {/* ── Camera panel ── */}
            <div className="newid-panel">
              <div className="newid-panel-header">Photograph Station</div>
              <div className="newid-panel-body">
                <div className="newid-camera-wrap">
                  {!imgSrc ? (
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <img src={imgSrc} alt="Captured" />
                  )}
                </div>
                <div className="newid-cam-btns">
                  {!imgSrc ? (
                    <button
                      className="btn-capture"
                      onClick={(e) => { e.preventDefault(); capture(); }}
                    >
                      ◉ &nbsp;Capture Photo
                    </button>
                  ) : (
                    <button
                      className="btn-retake"
                      onClick={(e) => { e.preventDefault(); setImgSrc(null); }}
                    >
                      ↺ &nbsp;Retake Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form panel ── */}
            <div className="newid-panel">
              <div className="newid-panel-header">Personal &amp; Record Details</div>
              <div className="newid-panel-body">
                <form action={handleSubmit}>

                  <div className="newid-field">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" type="text" name="name" placeholder="e.g. John A. Smith" required />
                  </div>

                  <div className="newid-field">
                    <label htmlFor="mobileNo">Mobile No.</label>
                    <input id="mobileNo" type="text" name="mobileNo" placeholder="+91 00000 00000" required />
                  </div>

                  <div className="newid-field">
                    <label htmlFor="address">Address</label>
                    <textarea id="address" name="address" placeholder="Street, City, PIN" required />
                  </div>

                  <div className="newid-two-col">
                    <div className="newid-field">
                      <label htmlFor="area">Area</label>
                      <input id="area" type="text" name="area" placeholder="Area" required />
                    </div>
                    <div className="newid-field">
                      <label htmlFor="state">State</label>
                      <input id="state" type="text" name="state" placeholder="State" required />
                    </div>
                  </div>

                  <div className="newid-field">
                    <label htmlFor="constituency">Constituency</label>
                    <input id="constituency" type="text" name="constituency" placeholder="Constituency" required />
                  </div>

                  <div className="newid-two-col">
                    <div className="newid-field">
                      <label htmlFor="membershipNo">Membership No.</label>
                      <input id="membershipNo" type="text" name="membershipNo" placeholder="MBR-0001" required />
                    </div>
                    <div className="newid-field">
                      <label htmlFor="qrIdNo">QR ID No.</label>
                      <input id="qrIdNo" type="text" name="qrIdNo" placeholder="QR-0001" required />
                    </div>
                  </div>

                  <hr className="newid-divider" />

                  <button type="submit" disabled={isLoading || !imgSrc} className="btn-submit">
                    {isLoading ? (
                      <><div className="spinner" /> Processing Record…</>
                    ) : (
                      "Generate &amp; Save ID Card »"
                    )}
                  </button>

                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}