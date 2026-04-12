"use server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { imagekit } from "@/lib/imagekit"
import QRCode from "qrcode"
import { revalidatePath } from "next/cache"

export async function createIdCard(formData: FormData) {
  const session = await auth()

  const employeeEmail = session?.user?.email
  if (!employeeEmail) throw new Error("Unauthorized")
  if (!session?.user) throw new Error("Unauthorized")

  const creatorId = session.user.id

  const name = formData.get("name") as string
  const designationRaw = formData.get("designation") as string | null
  const designation = designationRaw?.trim() ? designationRaw.trim() : null
  const address = formData.get("address") as string
  const area = formData.get("area") as string
  const mobileNo = formData.get("mobileNo") as string
  const state = formData.get("state") as string
  const constituency = formData.get("constituency") as string
  const membershipNo = formData.get("membershipNo") as string
  const qrIdNo = await getNextQrIdNo()
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
        name, designation, address, area, mobileNo, state, constituency, membershipNo,
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

export async function getIdCardById(id: string) {
  const session = await auth()
  if (!session?.user) return null

  try {
    const idCard = await prisma.idCard.findUnique({
      where: { id },
      include: { qrCode: true }
    })

    if (!idCard) return null

    return {
      ...idCard,
      qrIdNo: idCard.qrCode?.qrIdNo || "",
    }
  } catch (error) {
    console.error("Error fetching ID card:", error)
    return null
  }
}

export async function updateIdCard(formData: FormData) {
  const session = await auth()
  
  const employeeEmail = session?.user?.email
  if (!employeeEmail) throw new Error("Unauthorized")
  if (!session?.user) throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const designationRaw = formData.get("designation") as string | null
  const designation = designationRaw?.trim() ? designationRaw.trim() : null
  const address = formData.get("address") as string
  const area = formData.get("area") as string
  const mobileNo = formData.get("mobileNo") as string
  const state = formData.get("state") as string
  const constituency = formData.get("constituency") as string
  const membershipNo = formData.get("membershipNo") as string
  const qrIdNo = formData.get("qrIdNo") as string
  const photoBase64 = formData.get("photoBase64") as string | null

  if (!id) throw new Error("ID Card ID is required for updating")

  try {
    let photoUrl = undefined;
    if (photoBase64) {
      const photoUpload = await imagekit.upload({
        file: photoBase64,
        fileName: `photo-${membershipNo}-${Date.now()}.jpg`,
        folder: "/idcards/photos",
      })
      photoUrl = photoUpload.url
    }

    const qrDataUrl = await QRCode.toDataURL(`ID:${membershipNo}|QR:${qrIdNo}`)
    const qrUpload = await imagekit.upload({
      file: qrDataUrl,
      fileName: `qr-${qrIdNo}-${Date.now()}.png`,
      folder: "/idcards/qrcodes",
    })

    const updateData: any = {
      name, designation, address, area, mobileNo, state, constituency, membershipNo,
      qrCode: {
        update: {
          qrIdNo,
          qrImageUrl: qrUpload.url,
        }
      }
    }

    if (photoUrl) {
      updateData.photoUrl = photoUrl
    }

    await prisma.idCard.update({
      where: { id },
      data: updateData
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error updating ID Card:", error)
    return { success: false, error: error.message || "Failed to update ID Card" }
  }
}

export async function deleteIdCardAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const id = formData.get("id") as string
  if (!id) return

  try {
    await prisma.idCard.delete({ where: { id } })
    revalidatePath("/idcards")
  } catch (error) {
    console.error("Failed to delete ID card:", error)
  }
}

async function getNextQrIdNo(): Promise<string> {
  const prefix = "BJPBGMDAK";
  
  const lastQr = await prisma.qrCode.findFirst({
    where: {
      qrIdNo: { startsWith: prefix },
    },
    orderBy: {
      qrIdNo: 'desc',
    },
  });

  if (!lastQr) {
    return `${prefix}001001`;
  }

  const lastNumberStr = lastQr.qrIdNo.replace(prefix, "");
  const lastNumber = parseInt(lastNumberStr, 10);

  if (isNaN(lastNumber)) {
    return `${prefix}001001`;
  }

  const nextNumber = lastNumber + 1;
  const nextNumberStr = nextNumber.toString().padStart(6, '0');

  return `${prefix}${nextNumberStr}`;
}