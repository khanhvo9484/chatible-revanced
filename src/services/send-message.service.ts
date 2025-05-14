import { apiClient } from "src/api/index.js";
import { env } from "src/env.js";

export async function sendMessage(
  senderId: string,
  message: Record<string, unknown>
) {
  apiClient.post("/messages", {
    recipient: {
      id: senderId,
    },
    message,
  });
}

export async function sendMessageToRecipients(
  senderIds: string[],
  message: Record<string, unknown>
) {
  const promises = senderIds.map((senderId) => sendMessage(senderId, message));
  await Promise.all(promises);
}
