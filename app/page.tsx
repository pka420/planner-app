import ClientApp from "@/components/client-app"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Planner</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground md:text-base">
                    For V|| Semester 2025
        </p>
      </header>
      <ClientApp />
    </main>
  )
}
