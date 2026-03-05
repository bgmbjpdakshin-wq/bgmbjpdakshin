"use client"

import { useState, useRef } from "react"
import { createNewUser } from "@/app/actions/admin"

export default function AdminDashboard() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleCreateUser = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await createNewUser(formData)
      if (result.success) {
        setMessage({ type: "success", text: "New user account created successfully." })
        formRef.current?.reset()
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create user." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&display=swap');

        .admin-root {
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

        .admin-inner {
          max-width: 560px;
          margin: 0 auto;
        }

        /* ── Page header ── */
        .admin-page-header {
          border-bottom: 2px solid #3a2e22;
          padding-bottom: 14px;
          margin-bottom: 28px;
        }

        .admin-eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7a6a52;
          margin-bottom: 4px;
        }

        .admin-title {
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 28px;
          color: #1e1710;
          line-height: 1.1;
        }

        /* ── Card ── */
        .admin-card {
          background-color: #f5efe4;
          border: 2px solid #3a2e22;
          box-shadow: 5px 5px 0 #3a2e22;
        }

        .admin-card-header {
          background-color: #3a2e22;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-card-header-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c8b89a;
        }

        .admin-card-header-dots {
          display: flex;
          gap: 5px;
        }

        .admin-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #6b5a44;
          border: 1px solid #8a7560;
        }

        .admin-card-body {
          padding: 26px 28px 30px;
        }

        /* ── Messages ── */
        .admin-msg {
          padding: 10px 13px;
          margin-bottom: 22px;
          font-size: 12px;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .admin-msg-success {
          border: 1px solid #2a6b2a;
          background-color: #eaf5ea;
          color: #2a6b2a;
        }

        .admin-msg-success::before { content: "✓"; font-weight: bold; flex-shrink: 0; }

        .admin-msg-error {
          border: 1px solid #8b2020;
          background-color: #f9ebe8;
          color: #8b2020;
        }

        .admin-msg-error::before { content: "✗"; font-weight: bold; flex-shrink: 0; }

        /* ── Section label ── */
        .admin-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7a6a52;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-section-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #c8b89a;
        }

        /* ── Fields ── */
        .admin-field {
          margin-bottom: 16px;
        }

        .admin-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3a2e22;
          margin-bottom: 5px;
        }

        .admin-field input {
          width: 100%;
          background-color: #fdf8f0;
          border: 1px solid #3a2e22;
          border-radius: 0;
          padding: 9px 11px;
          font-family: 'Courier Prime', monospace;
          font-size: 13px;
          color: #1e1710;
          outline: none;
          -webkit-appearance: none;
          transition: box-shadow 0.15s;
        }

        .admin-field input::placeholder {
          color: #b0a090;
          font-style: italic;
        }

        .admin-field input:focus {
          box-shadow: inset 0 0 0 1px #3a2e22, 2px 2px 0 #3a2e22;
          background-color: #fffdf7;
        }

        .admin-field .admin-hint {
          font-size: 10px;
          color: #9a8a72;
          margin-top: 4px;
          font-style: italic;
          letter-spacing: 0.05em;
        }

        .admin-divider {
          border: none;
          border-top: 1px dashed #b0a090;
          margin: 22px 0;
        }

        /* ── Submit ── */
        .admin-submit-btn {
          width: 100%;
          background-color: #3a2e22;
          color: #e8dfc8;
          border: 2px solid #3a2e22;
          padding: 11px 16px;
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

        .admin-submit-btn:hover:not(:disabled) {
          background-color: #1e1710;
          box-shadow: 3px 3px 0 #1e1710;
          transform: translate(-1px, -1px);
        }

        .admin-submit-btn:disabled {
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

        /* ── Footer note ── */
        .admin-card-footer {
          border-top: 1px solid #c8b89a;
          padding: 11px 28px;
          font-size: 10px;
          color: #9a8a72;
          letter-spacing: 0.08em;
          font-style: italic;
        }

        .rule-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .rule-line { flex: 1; height: 1px; background: #b0a090; }
        .rule-diamond { width: 5px; height: 5px; background: #3a2e22; transform: rotate(45deg); flex-shrink: 0; }
      `}</style>

      <div className="admin-root">
        <div className="admin-inner">

          <div className="rule-row">
            <div className="rule-line" /><div className="rule-diamond" /><div className="rule-line" />
          </div>

          {/* Page header */}
          <div className="admin-page-header">
            <p className="admin-eyebrow">Control Panel</p>
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>

          {/* Card */}
          <div className="admin-card">

            <div className="admin-card-header">
              <span className="admin-card-header-title">User Provisioning</span>
              <div className="admin-card-header-dots">
                <div className="admin-dot" />
                <div className="admin-dot" />
                <div className="admin-dot" />
              </div>
            </div>

            <div className="admin-card-body">

              <p className="admin-section-label">Register New Account</p>

              {message && (
                <div className={`admin-msg ${message.type === "success" ? "admin-msg-success" : "admin-msg-error"}`}>
                  {message.text}
                </div>
              )}

              <form ref={formRef} action={handleCreateUser}>

                <div className="admin-field">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" name="name" type="text" required placeholder="e.g. Jane M. Doe" />
                </div>

                <div className="admin-field">
                  <label htmlFor="email">Email Address</label>
                  <input id="email" name="email" type="email" required placeholder="user@example.com" />
                </div>

                <div className="admin-field">
                  <label htmlFor="password">Temporary Password</label>
                  <input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
                  <p className="admin-hint">Minimum 6 characters. User should change on first login.</p>
                </div>

                <hr className="admin-divider" />

                <button type="submit" disabled={isLoading} className="admin-submit-btn">
                  {isLoading ? (
                    <><div className="spinner" /> Creating Account…</>
                  ) : (
                    "Create Account »"
                  )}
                </button>

              </form>
            </div>

            <div className="admin-card-footer">
              All accounts are subject to access-level restrictions as defined by system role policy.
            </div>

          </div>

        </div>
      </div>
    </>
  )
}