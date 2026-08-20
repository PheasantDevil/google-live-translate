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
import { OUTPUT_DEVICE_STORAGE_KEY } from "@/lib/audio/output-devices";
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
  setOutputDevice: (deviceId: string) => Promise<void>;
  isActive: boolean;
}

const TranslateContext = createContext<TranslateContextValue | null>(null);

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(translateReducer, initialTranslateState, (initial) => {
    if (typeof window === "undefined") return initial;
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const storedOutput = window.localStorage.getItem(OUTPUT_DEVICE_STORAGE_KEY);
    return {
      ...initial,
      targetLanguage: storedLanguage ?? initial.targetLanguage,
      outputDeviceId: storedOutput ?? initial.outputDeviceId,
    };
  });

  const sessionManagerRef = useRef<TranslateSessionManager | null>(null);
  const statsTimerRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const manager = new TranslateSessionManager();
    manager.setCallbacks({
      onStatusChange: (status) => dispatch({ type: "SET_STATUS", status }),
      onSubtitle: (line) => dispatch({ type: "ADD_SUBTITLE", line }),
      onAudioLevel: (level) => dispatch({ type: "SET_AUDIO_LEVEL", audioLevel: level }),
      onSessionStats: (stats) => dispatch({ type: "SET_SESSION_STATS", sessionStats: stats }),
      onError: (error) =>
        dispatch({
          type: "SET_ERROR",
          error: { code: "SESSION_ERROR", message: error.message },
        }),
    });
    sessionManagerRef.current = manager;

    return () => {
      if (statsTimerRef.current) {
        window.clearInterval(statsTimerRef.current);
      }
      void manager.stop();
    };
  }, []);

  useEffect(() => {
    sessionStartedAtRef.current = state.sessionStartedAt;
  }, [state.sessionStartedAt]);

  useEffect(() => {
    if (!state.sessionStartedAt) {
      if (statsTimerRef.current) {
        window.clearInterval(statsTimerRef.current);
        statsTimerRef.current = null;
      }
      return;
    }

    statsTimerRef.current = window.setInterval(() => {
      const startedAt = sessionStartedAtRef.current;
      if (!startedAt) return;
      dispatch({
        type: "SET_SESSION_STATS",
        sessionStats: {
          sessionDurationMs: Date.now() - startedAt,
        },
      });
    }, 1000);

    return () => {
      if (statsTimerRef.current) {
        window.clearInterval(statsTimerRef.current);
        statsTimerRef.current = null;
      }
    };
  }, [state.sessionStartedAt]);

  const setTargetLanguage = useCallback((language: string) => {
    dispatch({ type: "SET_TARGET_LANGUAGE", targetLanguage: language });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, []);

  const setOutputDevice = useCallback(async (deviceId: string) => {
    dispatch({ type: "SET_OUTPUT_DEVICE", outputDeviceId: deviceId });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(OUTPUT_DEVICE_STORAGE_KEY, deviceId);
    }
    await sessionManagerRef.current?.setOutputDevice(deviceId);
  }, []);

  const startSession = useCallback(async () => {
    dispatch({ type: "SET_ERROR", error: null });
    dispatch({ type: "SESSION_STARTED" });
    await sessionManagerRef.current?.setOutputDevice(state.outputDeviceId);
    await sessionManagerRef.current?.start(state.targetLanguage || DEFAULT_TARGET_LANGUAGE);
  }, [state.targetLanguage, state.outputDeviceId]);

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
      setOutputDevice,
      isActive,
    }),
    [
      state,
      startSession,
      stopSession,
      pauseSession,
      resumeSession,
      setTargetLanguage,
      setOutputDevice,
      isActive,
    ],
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
