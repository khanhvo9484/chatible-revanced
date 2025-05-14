export interface Messaging {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: {
    mid: string;
    text: string;
    attachments?: any[];
  };
  postback?: {
    payload: string;
    title: string;
    mid: string;
  };
}

export interface Entry {
  id: string;
  time: number;
  messaging: Messaging[];
}

export interface WebhookPayload {
  object: "page";
  entry: Entry[];
}

export type MessageType =
  | "text"
  | "postback"
  | "image"
  | "sticker"
  | "audio"
  | "unknown";
