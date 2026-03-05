import { auth, signOut } from "@/auth"

export default async function EmployeeDashboard() {
  const session = await auth()
  const user = session?.user as any

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name || "Employee"}!
            </h1>
            <p className="text-gray-500">Logged in as: {user?.email}</p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              Role: {user?.role}
            </span>
          </div>

          {/* Server Action Logout Button */}
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <button
              type="submit"
              className="rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Your Tasks</h2>
          <p className="mt-2 text-sm text-gray-500">
            This is where you can display employee-specific data from your PostgreSQL database later!
          </p>
        </div>
      </div>
    </div>
  )
}