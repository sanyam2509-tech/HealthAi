"use client";

import { useEffect, useState } from "react";

export function useTimedMessage(durationMs = 2500) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(""), durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [message, durationMs]);

  return {
    message,
    setMessage,
    clearMessage: () => setMessage("")
  };
}
