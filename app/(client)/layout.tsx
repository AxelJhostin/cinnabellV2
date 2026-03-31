export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-amber-50">
      <main className="mx-auto max-w-md min-h-screen">
        {children}
      </main>
    </div>
  )
}