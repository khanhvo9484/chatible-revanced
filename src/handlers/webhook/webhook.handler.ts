import type {
  MessageType,
  Messaging,
  WebhookPayload,
} from "src/interfaces/webhook-payload.js";
import { commandHandler } from "./command.handler.js";
import { textHandler } from "./text-message.handler.js";
import { logger } from "src/logger/logger.js";

const messageHandlers = {
  command: (payload: Messaging) => commandHandler(payload),
  text: (payload: Messaging) => textHandler(payload),
  image: (payload: Messaging) => commandHandler(payload),
  sticker: (payload: Messaging) => commandHandler(payload),
  audio: (payload: Messaging) => commandHandler(payload),
  unknown: (payload: Messaging) => commandHandler(payload),
};

export async function handleWebhookEvent(body: WebhookPayload) {
  const messaging = getMessage(body);
  if (!messaging) {
    return;
  }
  const messageType = getMessageType(messaging);

  const handler = messageHandlers[messageType];
  try {
    await handler(messaging);
  } catch (error) {
    logger.error("Error handling message:", error);
    // Handle error (e.g., log it, send a response, etc.)
  }
}

function getMessage(body: WebhookPayload): Messaging | undefined {
  const entry = body.entry[0];
  if (entry && entry.messaging && entry.messaging.length > 0) {
    return entry.messaging[0];
  }

  return undefined;
}

function getMessageType(messaging: Messaging | undefined): MessageType {
  if (!messaging) {
    return "unknown";
  }

  if (messaging.postback || messaging?.message?.quick_reply) {
    return "command";
  }

  if (messaging.message) {
    if (messaging.message.text) {
      return "text";
    } else if (messaging.message.attachments) {
      const attachmentType = messaging.message.attachments[0].type;
      if (attachmentType === "image") {
        if (messaging.message.attachments[0].payload.sticker_id) {
          return "sticker";
        }
        return "image";
      } else if (attachmentType === "audio") {
        return "audio";
      }
    }
  }
  return "unknown";
}
