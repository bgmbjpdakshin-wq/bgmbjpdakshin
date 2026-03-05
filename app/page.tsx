import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {

  const session = await auth();

  if (!session) {
    redirect("/login")
  }

  const role = (session.user as any)?.role;

  if (role === "ADMIN") {
    redirect("/admin")
  } else {
    redirect("/employee")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

    </div>
  );
}
