"use client";

const CHANNEL_NAME = "labs-auth-session";
const STORAGE_KEY = "labs-auth-session-event";
const LOCAL_EVENT_NAME = "labs:auth-session-event";
const TAB_ID_KEY = "labs-auth-tab-id";

function getTabId() {
  try {
    let value = window.sessionStorage.getItem(TAB_ID_KEY);
    if (!value) {
      value = window.crypto?.randomUUID?.() || String(Date.now()) + "-" + String(Math.random());
      window.sessionStorage.setItem(TAB_ID_KEY, value);
    }
    return value;
  } catch {
    return "tab-unavailable";
  }
}

let sender;

function getSender() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }

  if (!sender) {
    sender = new BroadcastChannel(CHANNEL_NAME);
  }

  return sender;
}

export function publishAuthEvent(type) {
  if (typeof window === "undefined") return;

  const event = {
    type,
    createdAt: Date.now(),
    tabId: getTabId(),
  };

  window.dispatchEvent(
    new CustomEvent(LOCAL_EVENT_NAME, { detail: event }),
  );

  try {
    getSender()?.postMessage(event);
  } catch {
    // The storage event below is the compatibility fallback.
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be disabled; the current tab and BroadcastChannel still work.
  }
}

export function subscribeAuthEvents(callback) {
  if (typeof window === "undefined") return () => {};

  const notify = (event) => {
    const detail = event?.detail ?? event?.data;
    if (!detail || typeof detail.type !== "string") return;
    callback({ ...detail, isLocalTab: detail.tabId === getTabId() });
  };

  const channel =
    "BroadcastChannel" in window
      ? new BroadcastChannel(CHANNEL_NAME)
      : null;

  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;

    try {
      notify({ detail: JSON.parse(event.newValue) });
    } catch {
      // Ignore malformed cross-tab notifications.
    }
  };

  window.addEventListener(LOCAL_EVENT_NAME, notify);
  window.addEventListener("storage", onStorage);
  channel?.addEventListener("message", notify);

  return () => {
    window.removeEventListener(LOCAL_EVENT_NAME, notify);
    window.removeEventListener("storage", onStorage);
    channel?.removeEventListener("message", notify);
    channel?.close();
  };
}
