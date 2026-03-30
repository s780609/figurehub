export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { getAllOrders } from "@/data/orders";
import { updateOrderStatus } from "@/lib/actions";
import AdminOrderList from "@/components/AdminOrderList";

export default async function AdminOrdersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const orders = await getAllOrders(userId);

  async function updateStatusAction(orderId: string, status: "paid" | "failed") {
    "use server";
    await updateOrderStatus(orderId, status);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">訂單管理</h2>
        <span className="text-sm text-[var(--foreground)]/50">
          共 {orders.length} 筆訂單
        </span>
      </div>

      <AdminOrderList orders={orders} updateStatusAction={updateStatusAction} />
    </div>
  );
}
