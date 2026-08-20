"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { DEFAULT_TARGET_LANGUAGE, LANGUAGE_STORAGE_KEY } from "@/lib/constants/languages";
import { TranslateSessionManager } from "@/lib/gemini/session-manager";
import {
  initialTranslateState,
  translateReducer,
  type TranslateState,
} from "@/lib/types/translate";

interface TranslateContextValue extends TranslateState {
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  setTargetLanguage: (language: string) => void;
  isActive: boolean;
}

const TranslateContext = createContext<TranslateContextValue | null>(null);

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(translateReducer, initialTranslateState, (initial) => {
    if (typeof window === "undefined") return initial;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored ? { ...initial, targetLanguage: stored } : initial;
  });

  const sessionManagerRef = useRef<TranslateSessionManager | null>(null);

  useEffect(() => {
    const manager = new TranslateSessionManager();
    manager.setCallbacks({
      onStatusChange: (status) => dispatch({ type: "SET_STATUS", status }),
      onSubtitle: (line) => dispatch({ type: "ADD_SUBTITLE", line }),
      onAudioLevel: (level) => dispatch({ type: "SET_AUDIO_LEVEL", audioLevel: level }),
      onError: (error) =>
        dispatch({
          type: "SET_ERROR",
          error: { code: "SESSION_ERROR", message: error.message },
        }),
    });
    sessionManagerRef.current = manager;

    return () => {
      void manager.stop();
    };
  }, []);

  const setTargetLanguage = useCallback((language: string) => {
    dispatch({ type: "SET_TARGET_LANGUAGE", targetLanguage: language });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, []);

  const startSession = useCallback(async () => {
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SESSION_STARTED" });
    await sessionManagerRef.current?.start(state.targetLanguage || DEFAULT_TARGET_LANGUAGE);
  }, [state.targetLanguage]);

  const stopSession = useCallback(async () => {
    await sessionManagerRef.current?.stop();
    dispatch({ type: "SESSION_STOPPED" });
  }, []);

  const pauseSession = useCallback(() => {
    sessionManagerRef.current?.pause();
  }, []);

  const resumeSession = useCallback(() => {
    sessionManagerRef.current?.resume();
  }, []);

  const isActive = useMemo(() => !["idle", "error"].includes(state.status), [state.status]);

  const value = useMemo<TranslateContextValue>(
    () => ({
      ...state,
      startSession,
      stopSession,
      pauseSession,
      resumeSession,
      setTargetLanguage,
      isActive,
    }),
    [state, startSession, stopSession, pauseSession, resumeSession, setTargetLanguage, isActive],
  );

  return <TranslateContext.Provider value={value}>{children}</TranslateContext.Provider>;
}

export function useTranslate(): TranslateContextValue {
  const context = useContext(TranslateContext);
  if (!context) {
    throw new Error("useTranslate must be used within TranslateProvider");
  }
  return context;
}
