import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const SESSION_KEY = "nassar_chat_session";
const HISTORY_KEY = "nassar_chat_history";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() as string) ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const listRef = useRef<HTMLDivElement>(null);
  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    if (!backend) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Chat backend URL not configured (VITE_BACKEND_URL)." },
      ]);
      return;
    }
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch(`${backend}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: getSessionId() }),
      });
      const json = await res.json();
      const reply = json.reply ?? json.error ?? "Sorry — something went wrong.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${err?.message ?? err}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        aria-label="Open chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-black text-white shadow-lg hover:bg-neutral-800 flex items-center justify-center"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[92vw] h-[520px] max-h-[80vh] rounded-2xl bg-white shadow-2xl border border-neutral-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-neutral-900 text-white">
            <div className="font-semibold">Nassar Watches</div>
            <div className="text-xs opacity-70">Order assistant</div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-neutral-50">
            {messages.length === 0 && (
              <div className="text-sm text-neutral-500">
                Hello — tell me what you're looking for and I'll help you place an order.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-black text-white"
                    : "mr-auto bg-white border border-neutral-200"
                }`}
              >
                {m.text}
              </div>
            ))}
            {busy && <div className="text-xs text-neutral-400">typing…</div>}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 rounded-full border px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={busy}
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="rounded-full bg-black px-4 text-sm text-white disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
