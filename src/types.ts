export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  color: string;     // Tailwind color class
  checklist?: ChecklistItem[];
}

export interface RecurringTask {
  id: string;
  title: string;
  time: string; // HH:MM
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
}

export interface DailyLog {
  energy: number;    // 1 to 5
  mood: string;      // emoji or short text
  notes: string;
}

export interface ActivityMap {
  [date: string]: number; // YYYY-MM-DD -> score
}

