import { AppShell } from "@/components/AppShell";
import { DashboardClient } from "@/components/DashboardClient";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard 學習進度"
      description="Track your practice progress. 進度只儲存在這台裝置的瀏覽器 localStorage。"
    >
      <DashboardClient />
    </AppShell>
  );
}
