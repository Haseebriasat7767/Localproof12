"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CloudUpload,
  FileText,
  Loader2,
  Lock,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogoMark } from "@/components/brand/logo";
import { CLIENTS } from "@/data/mock";
import { cn } from "@/lib/utils";

const ACCEPTED = ["pdf", "jpg", "jpeg", "png", "csv", "xlsx"];

const AI_STEPS = [
  "AI is reviewing your document…",
  "Document received",
  "Document type detected",
  "Information extracted",
];

type Upload = {
  id: string;
  name: string;
  progress: number;
  stage: number; // -1 uploading, 0..3 AI steps
  error?: string;
};

function UploadDialog({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onComplete: (name: string) => void;
}) {
  const [uploads, setUploads] = React.useState<Upload[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const id = `${file.name}-${Date.now()}-${Math.random()}`;

      if (!ACCEPTED.includes(ext)) {
        setUploads((u) => [
          ...u,
          { id, name: file.name, progress: 0, stage: -1, error: `.${ext} files aren't accepted` },
        ]);
        return;
      }

      setUploads((u) => [...u, { id, name: file.name, progress: 0, stage: -1 }]);

      const tick = setInterval(() => {
        setUploads((prev) =>
          prev.map((up) => {
            if (up.id !== id || up.error) return up;
            const next = Math.min(100, up.progress + 12 + Math.random() * 14);
            return { ...up, progress: next };
          })
        );
      }, 160);

      setTimeout(() => {
        clearInterval(tick);
        setUploads((prev) => prev.map((up) => (up.id === id ? { ...up, progress: 100, stage: 0 } : up)));
        // AI review sequence
        [1, 2, 3].forEach((s, i) => {
          setTimeout(() => {
            setUploads((prev) => prev.map((up) => (up.id === id ? { ...up, stage: s } : up)));
            if (s === 3) onComplete(file.name);
          }, 750 * (i + 1));
        });
      }, 1500);
    });
  };

  React.useEffect(() => {
    if (!open) setTimeout(() => setUploads([]), 250);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            PDF, JPG, PNG, CSV or XLSX. Drop them below or browse your files.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-teal-500 bg-teal-50/60"
              : "border-slate-300 bg-canvas/50 hover:border-teal-500/50 hover:bg-teal-50/30"
          )}
        >
          <motion.span
            animate={dragging ? { y: -4 } : { y: 0 }}
            className="rounded-xl bg-white p-3 text-teal-600 shadow-card"
          >
            <CloudUpload className="h-6 w-6" />
          </motion.span>
          <p className="mt-4 text-[14px] font-medium text-ink">
            Drag files here, or click to browse
          </p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Accepted: {ACCEPTED.map((e) => `.${e}`).join(", ")}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        <div className="mt-4 space-y-3">
          <AnimatePresence>
            {uploads.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "rounded-lg border p-3.5",
                  u.error ? "border-rose-200 bg-rose-50/60" : "border-border bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-lg p-2",
                      u.error ? "bg-rose-100 text-rose-600" : "bg-canvas text-ink-soft"
                    )}
                  >
                    {u.error ? <X className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{u.name}</p>
                    {u.error ? (
                      <p className="mt-0.5 text-[12.5px] text-rose-600">{u.error}</p>
                    ) : u.stage < 0 ? (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          className="h-full rounded-full bg-teal-500"
                          animate={{ width: `${u.progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <button
                    onClick={() => setUploads((prev) => prev.filter((p) => p.id !== u.id))}
                    className="rounded-md p-1 text-ink-muted hover:text-ink focus-ring"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {u.stage >= 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {AI_STEPS.map((label, i) => {
                      const reached = u.stage >= i;
                      const isCurrent = u.stage === i && i === 0;
                      if (!reached) return null;
                      return (
                        <motion.li
                          key={label}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-[12.5px]"
                        >
                          {i === 0 && u.stage === 0 ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                          ) : i === 0 ? (
                            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-teal-600" strokeWidth={3} />
                          )}
                          <span className={isCurrent ? "text-ink" : "text-ink-soft"}>{label}</span>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientPortalPage() {
  const params = useParams<{ clientId: string }>();
  const base = CLIENTS.find((c) => c.id === params.clientId) ?? CLIENTS[0];

  const [items, setItems] = React.useState(() =>
    base.documents.slice(0, 5).map((d) => ({ id: d.id, name: d.name, received: d.received }))
  );
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [banner, setBanner] = React.useState<string | null>(null);

  const done = items.filter((i) => i.received).length;
  const progress = Math.round((done / Math.max(1, items.length)) * 100);

  const markNextReceived = (fileName: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => !i.received);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], received: true };
      setBanner(`${fileName} matched to “${next[idx].name}”`);
      setTimeout(() => setBanner(null), 4000);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-[15px] font-semibold tracking-tight text-ink">ABC Accounting</p>
              <p className="text-[12px] text-ink-muted">Secure client portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="hidden text-[13px] font-medium text-ink sm:inline">{base.name}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-[12px] text-ink-soft">
              <Lock className="h-3 w-3" /> Secure link
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink">July Bookkeeping</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-soft">
            Hi {base.contact.split(" ")[0]} — here&apos;s everything we still need to close out
            your July books. No login required.
          </p>
        </motion.div>

        <div className="mt-7 rounded-xl border border-border bg-white p-5 shadow-card">
          <div className="mb-2.5 flex items-baseline justify-between">
            <p className="text-[13.5px] font-medium text-ink">Your progress</p>
            <p className="text-[20px] font-semibold tracking-tight text-teal-600">{progress}%</p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-2.5 text-[12.5px] text-ink-muted">
            {done} of {items.length} items received
            {progress === 100 ? " — you're all set, thank you!" : ""}
          </p>
        </div>

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2.5 rounded-xl border border-teal-500/25 bg-teal-50 px-4 py-3 text-[13.5px] text-teal-800"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {banner}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-white shadow-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-[15px] font-semibold tracking-tight text-ink">Document checklist</p>
          </div>
          <ul className="divide-y divide-border">
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3.5 px-5 py-4"
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    item.received ? "bg-teal-500 text-white" : "border-2 border-slate-200 text-slate-300"
                  )}
                >
                  {item.received ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3 w-3" />}
                </span>
                <span
                  className={cn(
                    "flex-1 text-[14px]",
                    item.received ? "text-ink-muted line-through" : "font-medium text-ink"
                  )}
                >
                  {item.name}
                </span>
                <span className="text-[12.5px] text-ink-muted">
                  {item.received ? "Received" : "Needed"}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" /> Upload Documents
          </Button>
          <p className="text-center text-[12.5px] text-ink-muted">
            Questions? Reply to any email from ABC Accounting and a real person will answer.
          </p>
        </div>
      </main>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onComplete={markNextReceived} />
    </div>
  );
}
