"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError("Invalid email or password. Please try again.")
            setIsLoading(false)
        } else {
            const session = await getSession()

            const userRole = (session?.user as any)?.role

            if (userRole === "ADMIN") {
                router.push("/admin")
            } else {
                router.push("/employee")
            }

            router.refresh()
        }

    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-root {
          min-height: 100vh;
          background-color: #e8e0d0;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(0,0,0,0.04) 27px,
              rgba(0,0,0,0.04) 28px
            );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Courier Prime', 'Courier New', monospace;
        }

        .card {
          width: 100%;
          max-width: 420px;
          background-color: #f5efe4;
          border: 2px solid #3a2e22;
          box-shadow: 6px 6px 0px #3a2e22;
          padding: 0;
        }

        .card-header {
          background-color: #3a2e22;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-header-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background-color: #6b5a44;
          border: 1px solid #8a7560;
        }

        .card-header-title {
          font-family: 'Courier Prime', monospace;
          font-size: 11px;
          color: #c8b89a;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .card-body {
          padding: 32px 32px 36px;
        }

        .masthead {
          text-align: center;
          border-bottom: 2px solid #3a2e22;
          padding-bottom: 20px;
          margin-bottom: 26px;
        }

        .masthead-rule {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .rule-line {
          flex: 1;
          height: 1px;
          background: #3a2e22;
        }

        .rule-diamond {
          width: 6px;
          height: 6px;
          background: #3a2e22;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        .masthead h1 {
          font-family: 'IM Fell English', Georgia, serif;
          font-size: 26px;
          color: #1e1710;
          letter-spacing: 0.02em;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .masthead-sub {
          font-family: 'Courier Prime', monospace;
          font-size: 10px;
          color: #7a6a52;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .error-box {
          border: 1px solid #8b2020;
          background-color: #f9ebe8;
          padding: 9px 12px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #8b2020;
          font-family: 'Courier Prime', monospace;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .error-box::before {
          content: "✗";
          font-weight: bold;
          flex-shrink: 0;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-family: 'Courier Prime', monospace;
          font-size: 11px;
          font-weight: 700;
          color: #3a2e22;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .field input {
          width: 100%;
          background-color: #fdf8f0;
          border: 1px solid #3a2e22;
          border-radius: 0;
          padding: 9px 11px;
          font-family: 'Courier Prime', monospace;
          font-size: 14px;
          color: #1e1710;
          outline: none;
          transition: box-shadow 0.15s;
          -webkit-appearance: none;
        }

        .field input::placeholder {
          color: #b0a090;
          font-style: italic;
        }

        .field input:focus {
          box-shadow: inset 0 0 0 1px #3a2e22, 2px 2px 0px #3a2e22;
          background-color: #fffdf7;
        }

        .divider {
          border: none;
          border-top: 1px dashed #b0a090;
          margin: 22px 0;
        }

        .submit-btn {
          width: 100%;
          background-color: #3a2e22;
          color: #e8dfc8;
          border: 2px solid #3a2e22;
          padding: 11px 16px;
          font-family: 'Courier Prime', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #1e1710;
          box-shadow: 3px 3px 0 #1e1710;
          transform: translate(-1px, -1px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: none;
        }

        .submit-btn:disabled {
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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .card-footer {
          border-top: 1px solid #c8b89a;
          padding: 12px 32px;
          text-align: center;
          font-family: 'Courier Prime', monospace;
          font-size: 10px;
          color: #9a8a72;
          letter-spacing: 0.1em;
        }
      `}</style>

            <div className="page-root">
                <div className="card">

                    {/* Title bar */}
                    <div className="card-header">
                        <div className="card-header-dots">
                            <div className="dot" />
                            <div className="dot" />
                            <div className="dot" />
                        </div>
                        <span className="card-header-title">Secure Terminal</span>
                        <div style={{ width: 44 }} />
                    </div>

                    <div className="card-body">

                        {/* Masthead */}
                        <div className="masthead">
                            <div className="masthead-rule">
                                <div className="rule-line" />
                                <div className="rule-diamond" />
                                <div className="rule-line" />
                            </div>
                            <h1>Sign In</h1>
                            <p className="masthead-sub">Authorised Personnel Only</p>
                            <div className="masthead-rule" style={{ marginTop: 12, marginBottom: 0 }}>
                                <div className="rule-line" />
                                <div className="rule-diamond" />
                                <div className="rule-line" />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="error-box">{error}</div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <hr className="divider" />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="submit-btn"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Proceed »"
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="card-footer">
                        © All rights reserved &nbsp;·&nbsp; Unauthorised access is prohibited
                    </div>

                </div>
            </div>
        </>
    )
}