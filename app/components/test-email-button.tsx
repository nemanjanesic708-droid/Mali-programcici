"use client";

import { useState } from "react";

export function TestEmailButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST"
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string; error?: string };

      if (!response.ok || !payload.ok) {
        setStatus("error");
        setMessage(payload.error ?? "Slanje test emaila nije uspelo.");
        return;
      }

      setStatus("success");
      setMessage(payload.message ?? "Test email je poslat.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Slanje test emaila nije uspelo.");
    }
  }

  return (
    <div className="stack">
      <button type="button" className="button button-ghost" onClick={handleClick} disabled={status === "loading"}>
        {status === "loading" ? "Slanje..." : "Posalji test email"}
      </button>
      {message ? <div className={`notice ${status === "error" ? "notice-error" : "notice-success"}`}>{message}</div> : null}
    </div>
  );
}
