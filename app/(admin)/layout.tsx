export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5ECD7]">
      <main className="mx-auto max-w-md min-h-screen">
        {children}
      </main>
    </div>
  )
}