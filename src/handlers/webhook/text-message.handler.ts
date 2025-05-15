import type { Messaging } from "src/interfaces/webhook-payload.js";
import { sendMessage } from "src/services/send-message.service.js";
import { Sessions } from "src/services/session.service.js";

export async function textHandler(messaging: Messaging) {
  const text = messaging?.message?.text;
  if (!text) {
    return;
  }

  const partnerId = await Sessions.getPartnerId(messaging.sender.id);
  if (partnerId) {
    await sendMessage(partnerId, {
      text,
    });
  }
}
