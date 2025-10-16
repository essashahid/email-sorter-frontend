import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import EmailContent from "./EmailContent.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://email-sorter-server.vercel.app";

function EmailCard({ email, onGood, onBad, remaining }) {
  const { user } = useAuth();
  const [threadMessages, setThreadMessages] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const pointerIdRef = useRef(null);
  const dragStartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setThreadMessages(null);
    setThreadError("");

    if (!email?.threadId || !user) {
      setThreadLoading(false);
      return () => {
        cancelled = true;
      };
    }

    async function loadThread() {
      setThreadLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/threads/${encodeURIComponent(email.threadId)}`,
          {
            withCredentials: true,
          }
        );
        if (cancelled) {
          return;
        }
        const messages = Array.isArray(response.data?.messages)
          ? response.data.messages
          : [];
        setThreadMessages(messages);
      } catch (error) {
        if (!cancelled) {
          const message =
            error.response?.data?.error || error.message || "Unknown error";
          setThreadError(message);
        }
      } finally {
        if (!cancelled) {
          setThreadLoading(false);
        }
      }
    }

    loadThread();

    return () => {
      cancelled = true;
    };
  }, [email?.threadId, user]);

  useEffect(() => {
    if (threadError) {
      // Surface errors to the console for debugging while keeping the UI clean.
      console.warn("Failed to load Gmail thread:", threadError);
    }
  }, [threadError]);

  useEffect(() => {
    if (!email) {
      setThreadMessages(null);
      setThreadError("");
      setThreadLoading(false);
      setDragOffset(0);
      setIsDragging(false);
      setSwipeDirection(null);
    }
  }, [email]);

  useEffect(() => {
    setDragOffset(0);
    setIsDragging(false);
    setSwipeDirection(null);
  }, [email?.id]);

  if (!email) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-600">
          You're all caught up! 🎉
        </p>
        <p className="mt-2 text-sm text-slate-500">
          No more emails in the queue. Refresh to fetch the latest inbox.
        </p>
      </div>
    );
  }

  const conversation = useMemo(() => {
    if (threadMessages && threadMessages.length > 0) {
      return threadMessages;
    }

    return [
      {
        id: email.id,
        threadId: email.threadId,
        from: email.from,
        to: email.to || "",
        snippet: email.snippet || "",
        body: email.body || email.snippet || "",
        subject: email.subject,
        date: email.date || null,
      },
    ];
  }, [threadMessages, email]);

  const latestMessage = conversation[conversation.length - 1] || email;

  const sentAtRaw =
    latestMessage?.date || latestMessage?.headerDate || email.date || null;
  const sentAt = email.date ? new Date(email.date) : null;
  const formattedDate =
    sentAt && !Number.isNaN(sentAt.valueOf())
      ? sentAt.toLocaleString()
      : null;
  const latestFormattedDate = formatDisplayDate(sentAtRaw);

  const cardStyle = {
    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.03}deg)`,
    transition: isDragging ? "none" : "transform 0.2s ease",
  };

  const swipeProgress = Math.min(Math.abs(dragOffset) / 140, 1);
  const showGood = swipeDirection === "right" && swipeProgress > 0;
  const showBad = swipeDirection === "left" && swipeProgress > 0;

  const handlePointerDown = (event) => {
    if (!email) {
      return;
    }
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    dragStartRef.current = event.clientX;
    setIsDragging(true);
    setSwipeDirection(null);
    setDragOffset(0);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || pointerIdRef.current !== event.pointerId) {
      return;
    }

    if (dragStartRef.current == null) {
      dragStartRef.current = event.clientX;
    }

    const delta = event.clientX - dragStartRef.current;
    setDragOffset(delta);
    if (Math.abs(delta) < 8) {
      setSwipeDirection(null);
    } else {
      setSwipeDirection(delta > 0 ? "right" : "left");
    }
  };

  const finalizeSwipe = (direction) => {
    setIsDragging(false);
    setSwipeDirection(null);
    setDragOffset(0);
    pointerIdRef.current = null;
    dragStartRef.current = null;

    if (direction === "right") {
      onGood();
    } else if (direction === "left") {
      onBad();
    }
  };

  const handlePointerUp = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    const hasThreshold = Math.abs(dragOffset) >= 140;
    const direction = dragOffset > 0 ? "right" : "left";

    if (hasThreshold) {
      finalizeSwipe(direction);
    } else {
      setIsDragging(false);
      setSwipeDirection(null);
      setDragOffset(0);
      pointerIdRef.current = null;
      dragStartRef.current = null;
    }
  };

  const handlePointerCancel = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    setIsDragging(false);
    setSwipeDirection(null);
    setDragOffset(0);
    pointerIdRef.current = null;
    dragStartRef.current = null;
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {showGood && (
          <div
            className="rounded-full border-2 border-success bg-success/20 px-4 py-2 text-sm font-semibold text-success shadow-sm"
            style={{ opacity: swipeProgress }}
          >
            ✅ Swipe right
          </div>
        )}
        {showBad && (
          <div
            className="rounded-full border-2 border-danger bg-danger/20 px-4 py-2 text-sm font-semibold text-danger shadow-sm"
            style={{ opacity: swipeProgress }}
          >
            ❌ Swipe left
          </div>
        )}
      </div>
      <div
        className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-lg ring-1 ring-slate-100 touch-pan-y"
        style={cardStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="text-sm font-medium text-slate-800">{email.from}</p>
          </div>
          {formattedDate && (
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {formattedDate}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold leading-tight text-slate-900">
          {email.subject}
        </h2>

        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Conversation messages:{" "}
            <span className="text-slate-700">{conversation.length}</span>
          </span>
          {latestFormattedDate && (
            <span>Latest reply: {latestFormattedDate}</span>
          )}
        </div>
      </header>

        <section className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        {threadLoading ? (
          <div className="text-sm text-slate-500">Loading conversation…</div>
        ) : (
          <>
            <ol className="space-y-4">
              {conversation.map((message) => {
                const messageDate = formatDisplayDate(
                  message.date || message.headerDate
                );
                return (
                  <li
                    key={message.id}
                    className="rounded-lg border border-slate-200 bg-white/70 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            From
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {message.from}
                          </p>
                          {message.to && (
                            <p className="text-xs text-slate-500">
                              To:{" "}
                              <span className="font-medium text-slate-600">
                                {message.to}
                              </span>
                            </p>
                          )}
                        </div>
                        {messageDate && (
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                            {messageDate}
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg bg-white/80 p-3">
                        <EmailContent
                          body={message.body || message.snippet || ""}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-slate-500">
          Remaining emails:{" "}
          <span className="font-medium">
            {Math.max(remaining - 1, 0)}
          </span>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onBad}
            className="flex-1 rounded-lg border border-danger bg-white px-4 py-2 font-semibold text-danger transition hover:bg-danger hover:text-white sm:flex-none"
          >
            ❌ Swipe left
          </button>
          <button
            type="button"
            onClick={onGood}
            className="flex-1 rounded-lg border border-success bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90 sm:flex-none"
          >
            ✅ Swipe right
          </button>
        </div>
        </footer>
      </div>
    </div>
  );
}

export default EmailCard;

function formatDisplayDate(rawValue) {
  if (!rawValue) {
    return "";
  }

  const date = new Date(rawValue);
  if (!Number.isNaN(date.valueOf())) {
    return date.toLocaleString();
  }

  if (typeof rawValue === "string") {
    return rawValue;
  }

  return "";
}
