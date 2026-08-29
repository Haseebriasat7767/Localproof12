"use client";

import * as React from "react";
import {
  CLIENTS,
  INTEGRATIONS,
  MESSAGES,
  TEAM,
  TX_QUESTIONS,
  type Client,
  type Message,
  type TeamMember,
  type TxQuestion,
} from "@/data/mock";

type Toast = { id: number; title: string; description?: string };

type Store = {
  clients: Client[];
  addClient: (c: Client) => void;
  removeClient: (id: string) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  toggleDoc: (clientId: string, docId: string) => void;

  team: TeamMember[];
  addMember: (m: TeamMember) => void;
  removeMember: (id: string) => void;

  messages: Message[];
  sendMessage: (id: string) => void;
  addMessage: (m: Message) => void;

  questions: TxQuestion[];
  answerQuestion: (id: string, answer: string) => void;

  integrations: typeof INTEGRATIONS;
  toggleIntegration: (id: string) => void;

  toasts: Toast[];
  toast: (title: string, description?: string) => void;
};

const StoreContext = React.createContext<Store | null>(null);

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <DemoStoreProvider>");
  return ctx;
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = React.useState<Client[]>(CLIENTS);
  const [team, setTeam] = React.useState<TeamMember[]>(TEAM);
  const [messages, setMessages] = React.useState<Message[]>(MESSAGES);
  const [questions, setQuestions] = React.useState<TxQuestion[]>(TX_QUESTIONS);
  const [integrations, setIntegrations] = React.useState(INTEGRATIONS);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((title: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, description }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value: Store = {
    clients,
    addClient: (c) => setClients((prev) => [c, ...prev]),
    removeClient: (id) => setClients((prev) => prev.filter((c) => c.id !== id)),
    updateClient: (id, patch) =>
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    toggleDoc: (clientId, docId) =>
      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          const documents = c.documents.map((d) =>
            d.id === docId ? { ...d, received: !d.received, reminder: !d.received ? "—" : d.reminder } : d
          );
          const missing = documents.filter((d) => !d.received).length;
          const progress = Math.round(
            ((documents.length - missing) / Math.max(1, documents.length)) * 100
          );
          const status: Client["status"] =
            missing === 0 ? "Complete" : c.status === "Complete" ? "Waiting" : c.status;
          return { ...c, documents, missing, progress, status };
        })
      ),

    team,
    addMember: (m) => setTeam((prev) => [...prev, m]),
    removeMember: (id) => setTeam((prev) => prev.filter((m) => m.id !== id)),

    messages,
    sendMessage: (id) =>
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "Sent", sentAt: "Just now", scheduled: undefined } : m
        )
      ),
    addMessage: (m) => setMessages((prev) => [m, ...prev]),

    questions,
    answerQuestion: (id, answer) =>
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, answer, status: "Answered" } : q))
      ),

    integrations,
    toggleIntegration: (id) =>
      setIntegrations((prev) =>
        prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
      ),

    toasts,
    toast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function ToastViewport() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-slide-up rounded-xl border border-border bg-navy-900 px-4 py-3 shadow-lift"
        >
          <p className="text-[13.5px] font-medium text-white">{t.title}</p>
          {t.description && (
            <p className="mt-0.5 text-[12.5px] text-slate-300">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
