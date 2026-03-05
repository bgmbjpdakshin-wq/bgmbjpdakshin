"use server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { imagekit } from "@/lib/imagekit"
import QRCode from "qrcode"

export async function createIdCard(formData: FormData) {
  const session = await auth()

  const employeeEmail = session?.user?.email
  if (!employeeEmail) throw new Error("Unauthorized")
  if (!session?.user) throw new Error("Unauthorized")

  const creatorId = session.user.id

  const name = formData.get("name") as string
  const address = formData.get("address") as string
  const area = formData.get("area") as string
  const mobileNo = formData.get("mobileNo") as string
  const state = formData.get("state") as string
  const constituency = formData.get("constituency") as string
  const membershipNo = formData.get("membershipNo") as string
  const qrIdNo = formData.get("qrIdNo") as string
  const photoBase64 = formData.get("photoBase64") as string

  if (!photoBase64) throw new Error("Webcam photo is required")

  try {
    const photoUpload = await imagekit.upload({
      file: photoBase64,
      fileName: `photo-${membershipNo}.jpg`,
      folder: "/idcards/photos",
    })

    const qrDataUrl = await QRCode.toDataURL(`ID:${membershipNo}|QR:${qrIdNo}`)
    
    const qrUpload = await imagekit.upload({
      file: qrDataUrl,
      fileName: `qr-${qrIdNo}.png`,
      folder: "/idcards/qrcodes",
    })

    await prisma.idCard.create({
      data: {
        name, address, area, mobileNo, state, constituency, membershipNo,
        photoUrl: photoUpload.url,
        createdBy: {
          connect: { email: employeeEmail }
        },
        qrCode: {
          create: {
            qrIdNo,
            qrImageUrl: qrUpload.url,
          }
        }
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: error.message || "Failed to create ID Card" }
  }
}