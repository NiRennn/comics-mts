import { create } from "zustand";

export type UserStateValue = string | null;

export type UserDto = {
  user_id: number;
  username: string | null;
  first_name: string | null;
  creation_date: string;
  state: UserStateValue;
  rules: boolean;
};

export type AnswerDto = {
  id: number;
  text: string;
};

export type QuestionDto = {
  id: number;
  picture: string;
  picture_overlay: string;
  answers: AnswerDto[];
};

export type AppPayload = {
  user: UserDto | null;
  questions: QuestionDto[];
};

export type FinalResultDto = {
  id: number;
  picture: string;
  text: string;
  promocode_text: string;
  promocode: string;
};

export type FinalResponseDto = {
  success: boolean;
  correct_answers: number;
  total_questions: number;
  result: FinalResultDto;
};

type AppState = {
  user: UserDto | null;
  questions: QuestionDto[];
  isHydrated: boolean;

  selectedAnswersByQuestion: Record<number, number>;
  finalResponse: FinalResponseDto | null;

  setUser: (user: UserDto | null) => void;
  setQuestions: (questions: QuestionDto[]) => void;
  hydrateFromServer: (data: AppPayload) => void;

  setAnswer: (questionId: number, answerId: number) => void;
  resetTestProgress: () => void;

  setFinalResponse: (data: FinalResponseDto | null) => void;
  reset: () => void;
};

const initialState = {
  user: null,
  questions: [],
  isHydrated: false,
  selectedAnswersByQuestion: {},
  finalResponse: null,
}; 

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),

  setQuestions: (questions) => set({ questions }),

  hydrateFromServer: (data) =>
    set({
      user: data.user ?? null,
      questions: Array.isArray(data.questions) ? data.questions : [],
      isHydrated: true,
      selectedAnswersByQuestion: {},
      finalResponse: null,
    }),

  setAnswer: (questionId, answerId) =>
    set((state) => ({
      selectedAnswersByQuestion: {
        ...state.selectedAnswersByQuestion,
        [questionId]: answerId,
      },
    })),

  resetTestProgress: () =>
    set({
      selectedAnswersByQuestion: {},
      finalResponse: null,
    }),

  setFinalResponse: (data) => set({ finalResponse: data }),

  reset: () => set(initialState),
}));