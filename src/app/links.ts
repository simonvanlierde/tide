import type { MouseEvent } from "react";

export function shouldHandleAppNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

// Follows a same-app link without a reload. The shell listens for popstate, so a
// screen can link to another without being handed the shell's navigate.
export function followAppLink(event: MouseEvent<HTMLAnchorElement>) {
  if (!shouldHandleAppNavigation(event)) {
    return;
  }
  event.preventDefault();
  const { pathname, search, hash } = event.currentTarget;
  window.history.pushState(null, "", `${pathname}${search}${hash}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
