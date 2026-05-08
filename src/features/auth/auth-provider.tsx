"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { AuthSession } from "./auth-types";

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "eclesio.session";
const SESSION_EVENT = "eclesio-session-change";
const AuthContext = createContext<AuthContextValue | null>(null);

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

function parseSession(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
}

function emitSessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedSession = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const session = useMemo(() => parseSession(storedSession), [storedSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession(nextSession) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        emitSessionChange();
      },
      clearSession() {
        window.localStorage.removeItem(STORAGE_KEY);
        emitSessionChange();
      },
    }),
    [session],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}