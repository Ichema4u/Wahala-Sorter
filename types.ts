export interface Task {
  id: string;
  title: string;
  column: "now" | "soon" | "later";
  timestamp: Date;
}

export type Column = "now" | "soon" | "later";
