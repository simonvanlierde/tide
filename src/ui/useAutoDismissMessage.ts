import { useEffect, useEffectEvent, useState } from "react";

/** A transient status message that clears itself after `timeoutMs`. */
export function useAutoDismissMessage(timeoutMs: number) {
  const [message, setMessage] = useState<string | null>(null);
  const clearMessage = useEffectEvent(() => {
    setMessage(null);
  });

  useEffect(() => {
    if (message === null) {
      return;
    }

    const timeoutId = window.setTimeout(clearMessage, timeoutMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message, timeoutMs]);

  return { message, showMessage: setMessage };
}
