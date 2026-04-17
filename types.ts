
export enum AppView {
  AUTH = 'auth',
  HOME = 'home',
  QUIZ_MENU = 'quiz_menu',
  QUIZ_MIX_MENU = 'quiz_mix_menu',
  QUIZ_TOPIC_MENU = 'quiz_topic_menu',
  QUIZ_SUBTOPIC_MENU = 'quiz_subtopic_menu',
  QUIZ_TOPIC_TESTS_MENU = 'quiz_topic_tests_menu',
  EXAM_MENU = 'exam_menu',
  AI_TEST = 'ai_test',
  QUIZ_ACTIVE = 'quiz_active',
  SCORECARD = 'scorecard',
  REVIEW = 'review',
  REVEAL_ALL = 'reveal_all',
  PROFILE = 'profile',
  EDIT_PROFILE = 'edit_profile',
  BOOKMARKS = 'bookmarks'
}

export enum AuthSubView {
  CHOICE = 'choice',
  LOGIN = 'login',
  SIGNUP = 'signup',
  FORGOT_PHONE = 'forgot_phone',
  FORGOT_OTP = 'forgot_otp',
  RESET_PASSWORD = 'reset_password'
}

export enum QuizType {
  MIX = 'mix',
  TOPIC = 'topic',
  EXAM = 'exam',
  AI = 'ai'
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface User {
  phone: string;
  name?: string;
  password?: string;
  profilePic?: string; // Base64 image string
}

export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  examName: string;
  examYear: number;
  subject: string;
  topic?: string;
}

export interface QuizSession {
  type: QuizType;
  title: string;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | null>;
  startTime: number;
  durationInMinutes: number;
  completed: boolean;
  testId?: string;
}

export interface QuizResults {
  score: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  unattemptedCount: number;
  totalQuestions: number;
  timeTaken: string;
  session: QuizSession;
  positiveMarks: number;
  negativeMarks: number;
}

export interface AttemptRecord {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: number;
  correct: number;
  total: number;
}
