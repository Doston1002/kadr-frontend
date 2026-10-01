"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuthStore, validateSession } from "@/lib/store";

const AuthHydrationContext = createContext(false);

export function AuthHydrator({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      validateSession();
      setHydrated(true);
    };

    const persistApi = useAuthStore.persist;
    if (!persistApi) {
      finish();
      return () => {
        cancelled = true;
      };
    }

    if (persistApi.hasHydrated()) {
      finish();
      return () => {
        cancelled = true;
      };
    }

    const unsub = persistApi.onFinishHydration(finish);
    persistApi.rehydrate();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <AuthHydrationContext.Provider value={hydrated}>
      {children}
    </AuthHydrationContext.Provider>
  );
}

export function useAuthHydrated() {
  return useContext(AuthHydrationContext);
}
