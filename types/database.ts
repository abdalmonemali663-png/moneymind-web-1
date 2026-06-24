// src/types/database.ts
// أنواع TypeScript مطابقة تماماً لـ schema قاعدة بيانات Supabase
// (انظر moneymind-db/01_schema.sql). أي تعديل في القاعدة يجب أن يُعكس هنا.

export type CurrencyCode = "EGP" | "USD" | "EUR" | "GBP" | "SAR" | "AED";
export type AppLanguage = "ar" | "en";
export type AppTheme = "light" | "dark" | "system";

export type IncomeSource = "salary" | "freelance" | "investment" | "bonus" | "custom";

export type ExpenseCategory =
  | "housing"
  | "food"
  | "transportation"
  | "bills"
  | "education"
  | "health"
  | "entertainment"
  | "shopping"
  | "custom";

export type InvestmentType = "stocks" | "real_estate" | "gold" | "business" | "crypto";

export type GoalType = "car" | "house" | "business" | "travel" | "custom";
export type GoalStatus = "active" | "completed" | "paused" | "cancelled";

export type NotificationType =
  | "spending_increase"
  | "budget_exceeded"
  | "savings_drop"
  | "goal_near_complete"
  | "ai_insight"
  | "system";

export type AiChatRole = "user" | "assistant";
export type LiabilityType = "loan" | "debt" | "custom";

export interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  job_title: string | null;
  preferred_currency: CurrencyCode;
  preferred_language: AppLanguage;
  theme: AppTheme;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  source: IncomeSource;
  custom_label: string | null;
  amount: number;
  currency: CurrencyCode;
  received_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  custom_label: string | null;
  amount: number;
  currency: CurrencyCode;
  spent_at: string;
  is_recurring: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: CurrencyCode;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  savings_goal_id: string;
  user_id: string;
  amount: number;
  contributed_at: string;
  notes: string | null;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  type: InvestmentType;
  name: string;
  initial_amount: number;
  current_value: number;
  currency: CurrencyCode;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  type: GoalType;
  custom_label: string | null;
  title: string;
  target_amount: number;
  saved_amount: number;
  currency: CurrencyCode;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  type: LiabilityType;
  custom_label: string | null;
  name: string;
  total_amount: number;
  remaining_amount: number;
  currency: CurrencyCode;
  due_date: string | null;
  monthly_payment: number | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialHealthSnapshot {
  id: string;
  user_id: string;
  score: number;
  savings_score: number | null;
  expenses_score: number | null;
  investment_score: number | null;
  goals_score: number | null;
  debt_score: number | null;
  snapshot_date: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AiChatSession {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: AiChatRole;
  content: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  period_start: string;
  period_end: string;
  file_path: string | null;
  summary_json: Record<string, unknown> | null;
  created_at: string;
}

export interface Settings {
  user_id: string;
  notifications_enabled: boolean;
  budget_alerts_enabled: boolean;
  goal_alerts_enabled: boolean;
  monthly_budget_limit: number | null;
  updated_at: string;
}

export interface WealthRoadmap {
  id: string;
  user_id: string;
  horizon_years: 1 | 3 | 5 | 10;
  roadmap_json: {
    summary: string;
    milestones: Array<{
      year: number;
      title: string;
      target_net_worth_estimate: number;
      key_actions: string[];
    }>;
    risks: string[];
    recommendations: string[];
  };
  generated_at: string;
  is_current: boolean;
}

// ---------------------------------------------------------------------
// Views (محسوبة ديناميكياً، انظر moneymind-db/03_views.sql)
// ---------------------------------------------------------------------
export interface UserNetWorthView {
  user_id: string;
  total_investments: number;
  total_savings: number;
  total_liabilities: number;
  net_worth: number;
}

export interface GoalProgressView {
  goal_id: string;
  user_id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  currency: CurrencyCode;
  progress_percentage: number;
  target_date: string | null;
  status: GoalStatus;
}

export interface ExpensesByCategoryView {
  user_id: string;
  category: ExpenseCategory;
  currency: CurrencyCode;
  total_amount: number;
  transaction_count: number;
}

// ---------------------------------------------------------------------
// Database type wrapper (للاستخدام مع createClient<Database>)
// ---------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      income: { Row: Income; Insert: Partial<Income>; Update: Partial<Income> };
      expenses: { Row: Expense; Insert: Partial<Expense>; Update: Partial<Expense> };
      savings_goals: {
        Row: SavingsGoal;
        Insert: Partial<SavingsGoal>;
        Update: Partial<SavingsGoal>;
      };
      savings_contributions: {
        Row: SavingsContribution;
        Insert: Partial<SavingsContribution>;
        Update: Partial<SavingsContribution>;
      };
      investments: {
        Row: Investment;
        Insert: Partial<Investment>;
        Update: Partial<Investment>;
      };
      financial_goals: {
        Row: FinancialGoal;
        Insert: Partial<FinancialGoal>;
        Update: Partial<FinancialGoal>;
      };
      liabilities: {
        Row: Liability;
        Insert: Partial<Liability>;
        Update: Partial<Liability>;
      };
      financial_health_snapshots: {
        Row: FinancialHealthSnapshot;
        Insert: Partial<FinancialHealthSnapshot>;
        Update: Partial<FinancialHealthSnapshot>;
      };
      notifications: {
        Row: AppNotification;
        Insert: Partial<AppNotification>;
        Update: Partial<AppNotification>;
      };
      ai_chat_sessions: {
        Row: AiChatSession;
        Insert: Partial<AiChatSession>;
        Update: Partial<AiChatSession>;
      };
      ai_chat_messages: {
        Row: AiChatMessage;
        Insert: Partial<AiChatMessage>;
        Update: Partial<AiChatMessage>;
      };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings> };
      wealth_roadmaps: {
        Row: WealthRoadmap;
        Insert: Partial<WealthRoadmap>;
        Update: Partial<WealthRoadmap>;
      };
    };
    Views: {
      v_user_net_worth: { Row: UserNetWorthView };
      v_goal_progress: { Row: GoalProgressView };
      v_expenses_by_category: { Row: ExpensesByCategoryView };
    };
  };
}
