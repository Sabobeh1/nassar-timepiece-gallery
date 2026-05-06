import { useEffect, useRef, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────────── */

type Msg = { role: "user" | "assistant"; text: string; ts: number };

const SESSION_KEY = "nassar_chat_session";
const HISTORY_KEY = "nassar_chat_history";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      (crypto.randomUUID?.() as string) ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ── Minimal markdown renderer ─────────────────────────────── */

/** Converts bot markdown (bold, bullets, line breaks) to React nodes. */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      elements.push(
        <hr
          key={i}
          className="my-2 border-t border-gold/30"
        />,
      );
      return;
    }

    // Bullet point
    if (/^[•\-\*]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[•\-\*]\s+/, "");
      elements.push(
        <div key={i} className="flex gap-2 items-start pl-1 py-0.5">
          <span className="text-gold mt-0.5 text-[10px] leading-none select-none">&#9670;</span>
          <span>{inlineMd(content)}</span>
        </div>,
      );
      return;
    }

    // Numbered list
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)/)?.[1];
      const content = trimmed.replace(/^\d+[\.\)]\s+/, "");
      elements.push(
        <div key={i} className="flex gap-2 items-start pl-1 py-0.5">
          <span className="text-gold font-semibold text-xs min-w-[16px]">{num}.</span>
          <span>{inlineMd(content)}</span>
        </div>,
      );
      return;
    }

    // Empty line → small spacer
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Normal text line
    elements.push(
      <div key={i} className="py-0.5">
        {inlineMd(trimmed)}
      </div>,
    );
  });

  return elements;
}

/** Inline markdown: **bold**, *italic*, `code` */
function inlineMd(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>,
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          className="bg-white/10 rounded px-1 py-0.5 text-[11px] font-mono"
        >
          {match[4]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ── Quick reply chips ──────────────────────────────────────── */

const QUICK_REPLIES = [
  { label: "Browse categories", msg: "What categories do you have?" },
  { label: "I need a gift", msg: "I'm looking for an elegant watch as a gift" },
  { label: "Track my order", msg: "I want to check my previous orders" },
];

/* ── Timestamp formatter ────────────────────────────────────── */

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Component ──────────────────────────────────────────────── */

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
  const inputRef = useRef<HTMLInputElement>(null);
  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;

  // Persist & auto-scroll
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? input).trim();
      if (!text || busy) return;
      if (!backend) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "Chat backend URL not configured.",
            ts: Date.now(),
          },
        ]);
        return;
      }
      if (!override) setInput("");
      setMessages((m) => [...m, { role: "user", text, ts: Date.now() }]);
      setBusy(true);
      try {
        const url = /\/api\//.test(backend)
          ? backend
          : `${backend.replace(/\/$/, "")}/api/webhook`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, session_id: getSessionId() }),
        });
        const json = await res.json();
        const reply =
          json.reply ?? json.error ?? "Sorry — something went wrong.";
        setMessages((m) => [
          ...m,
          { role: "assistant", text: reply, ts: Date.now() },
        ]);
      } catch (err: any) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `Connection error. Please try again.`,
            ts: Date.now(),
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [input, busy, backend],
  );

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <>
      {/* ── Toggle button ─────────────────────────────────── */}
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
        className={`
          fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300
          ${open
            ? "bg-neutral-800 hover:bg-neutral-700 rotate-0"
            : "bg-gradient-to-br from-gold-dark to-gold hover:from-gold hover:to-gold-light shadow-gold/25"
          }
        `}
      >
        {open ? (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>

      {/* ── Chat panel ────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[380px] max-w-[92vw] h-[560px] max-h-[80vh]
            rounded-2xl shadow-2xl border border-gold/20 flex flex-col overflow-hidden
            animate-fade-in-up"
          style={{
            background:
              "linear-gradient(180deg, #1a1a1a 0%, #111111 100%)",
          }}
        >
          {/* ── Header ──────────────────────────────────── */}
          <div
            className="relative px-4 py-3 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, #1a1a1a 0%, #2a2216 50%, #1a1a1a 100%)",
              borderBottom: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            {/* Watch icon */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4.5 h-4.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-playfair font-semibold text-white text-sm tracking-wide">
                Nassar Watches
              </div>
              <div className="text-[11px] text-gold/70 font-montserrat">
                Personal Order Assistant
              </div>
            </div>
            {/* Clear chat */}
            <button
              onClick={clearChat}
              className="text-neutral-500 hover:text-gold/80 transition-colors p-1"
              title="Clear chat"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>

          {/* ── Messages ────────────────────────────────── */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3 chat-scroll"
            style={{ background: "linear-gradient(180deg, #111 0%, #0d0d0d 100%)" }}
          >
            {/* Welcome screen */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-2">
                {/* Logo circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4AF37 0%, #AA8C2C 100%)",
                    boxShadow: "0 4px 24px rgba(212,175,55,0.25)",
                  }}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="font-playfair text-white text-base font-semibold tracking-wide">
                    Welcome to Nassar Watches
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1 font-montserrat leading-relaxed">
                    Your personal assistant for browsing our
                    <br />
                    collection and placing orders.
                  </p>
                </div>
                {/* Quick replies */}
                <div className="flex flex-col gap-2 w-full max-w-[260px] mt-1">
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr.msg}
                      onClick={() => send(qr.msg)}
                      disabled={busy}
                      className="text-left text-xs font-montserrat px-3 py-2.5 rounded-xl
                        border border-gold/20 text-gold/90 hover:bg-gold/10
                        hover:border-gold/40 transition-all duration-200
                        disabled:opacity-40"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col gap-0.5 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed font-montserrat
                    ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-gold-dark to-gold text-white rounded-br-md"
                        : "bg-white/[0.06] border border-white/[0.08] text-neutral-200 rounded-bl-md"
                    }`}
                >
                  {m.role === "assistant" ? renderMarkdown(m.text) : m.text}
                </div>
                <span className="text-[10px] text-neutral-600 px-1">
                  {m.ts ? formatTime(m.ts) : ""}
                </span>
              </div>
            ))}

            {/* Typing indicator */}
            {busy && (
              <div className="flex items-start">
                <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* ── Input area ──────────────────────────────── */}
          <div
            className="px-3 py-2.5 flex gap-2 items-center"
            style={{
              background: "#141414",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <input
              ref={inputRef}
              className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-full
                px-4 py-2.5 text-sm text-white placeholder-neutral-500
                outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20
                transition-all duration-200 font-montserrat"
              placeholder="Type a message..."
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
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center
                bg-gradient-to-br from-gold-dark to-gold text-white
                disabled:opacity-30 disabled:from-neutral-700 disabled:to-neutral-600
                hover:from-gold hover:to-gold-light
                transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Scoped styles ──────────────────────────────── */}
      <style>{`
        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,0.2);
          border-radius: 4px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(212,175,55,0.4);
        }
      `}</style>
    </>
  );
}
