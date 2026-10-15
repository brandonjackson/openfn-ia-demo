/** AI Assistant sessions in the workflow editor. Types only: no data, no behaviour. */

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Job code the assistant proposed, shown as an artifact with Add / Copy. */
  code?: string;
}

export interface AISession {
  id: string;
  workflowId: string;
  title: string;
  updatedAt: string;
  messages: AIMessage[];
}
