import { auth } from "@/lib/auth";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {session && <AdminNav />}
      {children}
      {modal}
    </div>
  );
}
