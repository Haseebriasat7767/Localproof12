import { AppShell } from "@/components/app/shell";
import { DemoStoreProvider, ToastViewport } from "@/components/app/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoStoreProvider>
      <AppShell>{children}</AppShell>
      <ToastViewport />
    </DemoStoreProvider>
  );
}
