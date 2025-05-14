export interface ResponseMessage {
  recipient: {
    id: string;
  };
  message: {
    text: string;
    quick_replies?: {
      content_type: string;
      title: string;
      payload: string;
    }[];
  };
  sender_action?: "typing_on" | "typing_off" | "mark_seen";
}
