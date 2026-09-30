"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { safeStorage } from "../../lib/safeStorage";
import { WALKTHROUGH_STEPS } from "../../lib/adminSop";

// Seen flag is per admin, per browser. Resume key carries the open step across page navigation.
const SEEN_KEY_PREFIX = "anchorp-admin-walkthrough-seen:";
const RESUME_KEY = "anchorp-admin-walkthrough-resume";

export default function AdminWalkthrough() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const total = WALKTHROUGH_STEPS.length;
  const current = WALKTHROUGH_STEPS[step];

  // ---------- FIRST LOGIN / RESUME CHECK ----------
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      let resume: string | null = null;
      try {
        resume = window.sessionStorage.getItem(RESUME_KEY);
        window.sessionStorage.removeItem(RESUME_KEY);
      } catch {}

      if (resume !== null) {
        const idx = Number(resume);
        setStep(Number.isInteger(idx) && idx >= 0 && idx < total ? idx : 0);
        setOpen(true);
        return;
      }

      if (uid && !safeStorage.get(SEEN_KEY_PREFIX + uid)) {
        setStep(0);
        setOpen(true);
      }
    };

    init();
  }, [total]);

  // ---------- HANDLERS ----------
  const markSeen = useCallback(() => {
    if (userId) safeStorage.set(SEEN_KEY_PREFIX + userId, new Date().toISOString());
  }, [userId]);

  const close = useCallback(() => {
    markSeen();
    setOpen(false);
  }, [markSeen]);

  const next = useCallback(() => {
    if (step < total - 1) setStep(step + 1);
    else close();
  }, [step, total, close]);

  const back = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const reopen = () => {
    setStep(0);
    setOpen(true);
  };

  const goToLink = (href: string) => {
    markSeen();
    // Keep the tour going on the next page, one step ahead.
    const resumeAt = step < total - 1 ? step + 1 : null;
    if (resumeAt !== null) {
      try {
        window.sessionStorage.setItem(RESUME_KEY, String(resumeAt));
      } catch {}
    }
    setOpen(false);
    router.push(href);
  };

  // ---------- KEYBOARD + FOCUS ----------
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  // ---------- RENDER ----------
  return (
    <>
      {!open && (
        <button
          type="button"
          className="walkthrough-fab"
          onClick={reopen}
          aria-label="Open admin guide"
        >
          <span className="walkthrough-fab-icon" aria-hidden="true">
            ?
          </span>
          <span className="walkthrough-fab-label">Admin guide</span>
        </button>
      )}

      {open && current && (
        <div className="walkthrough-backdrop" onClick={close}>
          <div
            ref={dialogRef}
            className="walkthrough-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="walkthrough-header">
              <div className="walkthrough-count">
                Step {step + 1} of {total}
              </div>
              <button
                type="button"
                className="walkthrough-close"
                onClick={close}
                aria-label="Close walkthrough"
              >
                ✕
              </button>
            </div>

            <div className="walkthrough-progress" aria-hidden="true">
              <div
                className="walkthrough-progress-fill"
                style={{ width: `${((step + 1) / total) * 100}%` }}
              />
            </div>

            <h2 id="walkthrough-title" className="walkthrough-title">
              {current.title}
            </h2>
            <p className="walkthrough-body">{current.body}</p>

            {current.bullets && (
              <ul className="walkthrough-list">
                {current.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}

            {current.link && (
              <button
                type="button"
                className="link-button walkthrough-link"
                onClick={() => goToLink(current.link!.href)}
              >
                {current.link.label} →
              </button>
            )}

            <div className="walkthrough-actions">
              {step < total - 1 ? (
                <button type="button" className="link-button" onClick={close}>
                  Skip tour
                </button>
              ) : (
                <span />
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {step > 0 && (
                  <button type="button" className="btn-secondary" onClick={back}>
                    Back
                  </button>
                )}
                <button type="button" className="btn-primary" onClick={next}>
                  {step < total - 1 ? "Next" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
