import Link from "next/link"
import { auth, signOut } from "@/auth"

export default async function Navbar() {

    const session = await auth()
    const user = session?.user as any

    if (!session) return null

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Courier+Prime:wght@400;700&display=swap');

                .navbar-root {
                    background-color: #3a2e22;
                    border-bottom: 3px solid #1e1710;
                    box-shadow: 0 3px 0 #1e1710;
                    font-family: 'Courier Prime', 'Courier New', monospace;
                }

                .navbar-inner {
                    max-width: 960px;
                    margin: 0 auto;
                    padding: 0 16px;
                    display: flex;
                    align-items: stretch;
                    justify-content: space-between;
                    min-height: 52px;
                }

                /* ── Brand ── */
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                    padding: 10px 0;
                }

                .navbar-brand-diamond {
                    width: 7px;
                    height: 7px;
                    background: #c8b89a;
                    transform: rotate(45deg);
                    flex-shrink: 0;
                }

                .navbar-brand-text {
                    font-family: 'IM Fell English', Georgia, serif;
                    font-size: 19px;
                    color: #e8dfc8;
                    letter-spacing: 0.03em;
                    line-height: 1;
                }

                /* ── Nav links ── */
                .navbar-links {
                    display: flex;
                    align-items: stretch;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .navbar-links li {
                    display: flex;
                    align-items: stretch;
                }

                .navbar-link {
                    display: flex;
                    align-items: center;
                    padding: 0 16px;
                    font-family: 'Courier Prime', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #b0a090;
                    text-decoration: none;
                    border-left: 1px solid #52422e;
                    transition: background-color 0.15s, color 0.15s;
                    white-space: nowrap;
                }

                .navbar-link:hover {
                    background-color: #2a2018;
                    color: #e8dfc8;
                }

                /* ── User section ── */
                .navbar-user {
                    display: flex;
                    align-items: center;
                    border-left: 2px solid #52422e;
                    padding-left: 16px;
                    gap: 12px;
                    margin-left: 4px;
                }

                .navbar-email {
                    font-family: 'Courier Prime', monospace;
                    font-size: 10px;
                    color: #7a6a52;
                    letter-spacing: 0.08em;
                    font-style: italic;
                    max-width: 180px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .navbar-signout-btn {
                    background-color: transparent;
                    border: 1px solid #7a6a52;
                    color: #b0a090;
                    padding: 5px 12px;
                    font-family: 'Courier Prime', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background-color 0.15s, color 0.15s, border-color 0.15s;
                    white-space: nowrap;
                }

                .navbar-signout-btn:hover {
                    background-color: #1e1710;
                    border-color: #c8b89a;
                    color: #e8dfc8;
                }

                /* ── Top rule strip ── */
                .navbar-topstrip {
                    height: 3px;
                    background: repeating-linear-gradient(
                        90deg,
                        #c8b89a 0px,
                        #c8b89a 4px,
                        transparent 4px,
                        transparent 10px
                    );
                }

                /* ── Mobile navbar ── */
                @media (max-width: 640px) {
                    .navbar-inner {
                        padding: 0 10px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }
                    .navbar-links {
                        margin-top: 4px;
                        flex-wrap: wrap;
                    }
                    .navbar-link {
                        padding: 6px 10px;
                        font-size: 10px;
                    }
                    .navbar-user {
                        width: 100%;
                        border-left: none;
                        border-top: 1px solid #52422e;
                        margin-left: 0;
                        margin-top: 4px;
                        padding: 4px 0 6px;
                        justify-content: space-between;
                    }
                    .navbar-email {
                        max-width: 140px;
                        font-size: 9px;
                    }
                }
            `}</style>

            <nav className="navbar-root">
                {/* Decorative dashed top strip */}
                <div className="navbar-topstrip" />

                <div className="navbar-inner">

                    {/* Brand */}
                    <Link
                        href={user?.role === "ADMIN" ? "/admin" : "/employee"}
                        className="navbar-brand"
                    >
                        <div className="navbar-brand-diamond" />
                        <span className="navbar-brand-text">BGM BJP Dakshin</span>
                        <div className="navbar-brand-diamond" />
                    </Link>

                    {/* Right side: links + user */}
                    <div style={{ display: "flex", alignItems: "stretch" }}>

                        {/* Nav links */}
                        <ul className="navbar-links">
                            {user?.role === "ADMIN" ? (
                                <>
                                    <li>
                                        <Link href="/admin" className="navbar-link">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/idcards/new" className="navbar-link">
                                            Create ID
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/idcards/" className="navbar-link">
                                            See ID Cards
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link href="/idcards/new" className="navbar-link">
                                            Create ID
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>

                        {/* User info + sign out */}
                        <div className="navbar-user">
                            <span className="navbar-email">{user?.email}</span>
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut({ redirectTo: "/login" })
                                }}
                            >
                                <button type="submit" className="navbar-signout-btn">
                                    Sign Out
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </nav>
        </>
    )
}