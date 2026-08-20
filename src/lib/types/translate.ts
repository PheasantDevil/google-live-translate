export type SessionStatus =
  "idle" | "requesting_mic" | "connecting" | "translating" | "paused" | "reconnecting" | "error";

export interface SubtitleLine {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface AppError {
  code: string;
  message: string;
}

export interface TranslateState {
  status: SessionStatus;
  targetLanguage: string;
  subtitles: SubtitleLine[];
  audioLevel: number;
  error: AppError | null;
  sessionStartedAt: number | null;
}

export type TranslateAction =
  | { type: "SET_STATUS"; status: SessionStatus }
  | { type: "SET_TARGET_LANGUAGE"; targetLanguage: string }
  | { type: "SET_AUDIO_LEVEL"; audioLevel: number }
  | { type: "SET_ERROR"; error: AppError | null }
  | { type: "ADD_SUBTITLE"; line: SubtitleLine }
  | { type: "UPDATE_SUBTITLE"; id: string; text: string; isFinal: boolean }
  | { type: "CLEAR_SUBTITLES" }
  | { type: "SESSION_STARTED" }
  | { type: "SESSION_STOPPED" }
  | { type: "RESET" };

export const initialTranslateState: TranslateState = {
  status: "idle",
  targetLanguage: "ja",
  subtitles: [],
  audioLevel: 0,
  error: null,
  sessionStartedAt: null,
};

export function translateReducer(state: TranslateState, action: TranslateAction): TranslateState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_TARGET_LANGUAGE":
      return { ...state, targetLanguage: action.targetLanguage };
    case "SET_AUDIO_LEVEL":
      return { ...state, audioLevel: action.audioLevel };
    case "SET_ERROR":
      return { ...state, error: action.error, status: action.error ? "error" : state.status };
    case "ADD_SUBTITLE":
      return {
        ...state,
        subtitles: [...state.subtitles.slice(-4), action.line],
      };
    case "UPDATE_SUBTITLE": {
      const subtitles = state.subtitles.map((line) =>
        line.id === action.id ? { ...line, text: action.text, isFinal: action.isFinal } : line,
      );
      return { ...state, subtitles };
    }
    case "CLEAR_SUBTITLES":
      return { ...state, subtitles: [] };
    case "SESSION_STARTED":
      return {
        ...state,
        sessionStartedAt: Date.now(),
        error: null,
        subtitles: [],
      };
    case "SESSION_STOPPED":
      return {
        ...state,
        status: "idle",
        sessionStartedAt: null,
        audioLevel: 0,
      };
    case "RESET":
      return { ...initialTranslateState, targetLanguage: state.targetLanguage };
    default:
      return state;
  }
}
