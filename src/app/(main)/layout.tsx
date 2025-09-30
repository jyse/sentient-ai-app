export default async function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-gray-800">
      <main className="flex-1">{children}</main>
    </div>
  );
}
