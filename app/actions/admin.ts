"use server"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { auth } from "@/auth"

export async function createNewUser(formData: FormData) {
  const session = await auth()
  
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "USER",
    },
  })

  return { success: true }
}