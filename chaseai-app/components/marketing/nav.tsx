"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNav() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-40 w-full border-b transition-all duration-200 " +
        (scrolled
          ? "border-border bg-white/85 backdrop-blur-md"
          : "border-transparent bg-white")
      }
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/app">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/app">Start Free Trial</Link>
          </Button>
        </div>

        <button
          className="focus-ring rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-slide-up border-t border-border bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-canvas hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/app">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/app">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
