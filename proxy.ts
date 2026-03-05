import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as any)?.role

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url))
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/employee", req.url))
  }

  if (pathname.startsWith("/employee")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname === "/login" && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url))
    return NextResponse.redirect(new URL("/employee", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}