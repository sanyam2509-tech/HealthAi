"use client";

import { useState } from "react";

import { useTimedMessage } from "@/hooks/useTimedMessage";

export function useClipboard(successMessage = "Copied") {
  const [copied, setCopied] = useState(false);
  const { setMessage, clearMessage } = useTimedMessage(1800);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setMessage(successMessage);
      window.setTimeout(() => {
        setCopied(false);
        clearMessage();
      }, 1800);
      return true;
    } catch {
      setCopied(false);
      clearMessage();
      return false;
    }
  }

  return {
    copied,
    copy
  };
}
