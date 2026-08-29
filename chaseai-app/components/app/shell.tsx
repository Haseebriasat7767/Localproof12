"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plug,
  Search,
  Settings,
  Sparkles,
  Users,
  UserCog,
  Workflow,
  X,
  MessageSquareText,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives";
import { useStore } from "@/components/app/store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/document-requests", label: "Document Requests", icon: FileText, badge: 31 },
  { href: "/app/automations", label: "Automations", icon: Workflow },
  { href: "/app/messages", label: "Messages", icon: MessageSquare, badge: 4 },
  { href: "/app/transaction-questions", label: "Transaction Questions", icon: MessageSquareText, badge: 4 },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/workspace", label: "Workspace", icon: Building2 },
  { href: "/app/team", label: "Team", icon: UserCog },
  { href: "/app/integrations", label: "Integrations", icon: Plug },
];

const BOTTOM_NAV = [
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/help", label: "Help", icon: HelpCircle },
];

function NavLink({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors duration-150",
        active
          ? "bg-white/[0.07] text-white"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-400" />
      )}
      <item.icon
        className={cn("h-[17px] w-[17px] shrink-0", active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300")}
      />
      <span className="truncate">{item.label}</span>
      {"badge" in item && item.badge ? (
        <span className="ml-auto rounded-full bg-teal-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-teal-300">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col bg-navy-900">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/" className="focus-ring rounded-lg" onClick={onNavigate}>
          <Logo invert />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Workspace
        </p>
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={onNavigate} />
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-white/[0.07] px-3 py-3">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={onNavigate} />
        ))}
      </div>

      <div className="border-t border-white/[0.07] p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05] focus-ring">
              <Avatar name="Rachel Kim" size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-white">Rachel Kim</span>
                <span className="block truncate text-[11.5px] text-slate-500">
                  Northstar Bookkeeping
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuLabel>rachel@northstarbooks.com</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings /> Account settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/billing">
                <CreditCard /> Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild destructive>
              <Link href="/">
                <LogOut /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { toast } = useStore();
  const [query, setQuery] = React.useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenNav}
        className="focus-ring rounded-lg p-2 text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form
        className="relative hidden max-w-md flex-1 sm:block"
        onSubmit={(e) => {
          e.preventDefault();
          toast(
            query ? `Searching for “${query}”` : "Search",
            "Demo search — results are illustrative."
          );
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients, documents, messages…"
          className="input pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => toast("AI Chaser queued", "6 reminders drafted for review.")}
        >
          <Sparkles className="h-4 w-4 text-teal-500" />
          Run AI Chaser
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-canvas hover:text-ink focus-ring">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              "Summit Properties escalated after 4 reminders",
              "Smith & Co uploaded the payroll report",
              "Miller Construction answered a transaction question",
            ].map((n) => (
              <DropdownMenuItem key={n} className="whitespace-normal leading-snug">
                {n}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-ring rounded-full">
              <Avatar name="Rachel Kim" size="sm" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Rachel Kim</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/billing">
                <CreditCard /> Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild destructive>
              <Link href="/">
                <LogOut /> Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] lg:block">
        <SidebarContent />
      </aside>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-navy-900/50 backdrop-blur-[2px]"
            onClick={() => setNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[268px] animate-slide-up">
            <button
              onClick={() => setNavOpen(false)}
              className="absolute right-3 top-5 z-10 rounded-lg p-1.5 text-slate-400 hover:text-white focus-ring"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
