import { redis } from "src/database/redis.js";
import type { Messaging } from "src/interfaces/webhook-payload.js";
import { logger } from "src/logger/logger.js";
import {
  QUICK_REPLY,
  TEXT_COMMAND,
  TEXT_RESPONSES,
} from "src/models/text-command.model.js";
import { Queuing } from "src/services/queuing.service.js";
import {
  sendMessage,
  sendMessageToRecipients,
} from "src/services/send-message.service.js";
import { REDIS_BUCKETS, Sessions } from "src/services/session.service.js";

export async function commandHandler(messaging: Messaging) {
  const command =
    messaging?.postback?.payload || messaging?.message?.quick_reply?.payload;

  if (command === TEXT_COMMAND.GET_STARTED) {
    return sendMessage(messaging.sender.id, QUICK_REPLY);
  }

  if (command === TEXT_COMMAND.FIND_MALE) {
    await handleFindCommand({
      bucketToSave: REDIS_BUCKETS.female,
      bucketToFinds: [REDIS_BUCKETS.male],
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_FEMALE) {
    await handleFindCommand({
      bucketToSave: REDIS_BUCKETS.male,
      bucketToFinds: [REDIS_BUCKETS.female],
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_OTHER) {
    await handleFindCommand({
      bucketToSave: REDIS_BUCKETS.other,
      bucketToFinds: [REDIS_BUCKETS.other],
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_ALL) {
    await handleFindAllCommand({
      allBuckets: [
        REDIS_BUCKETS.male,
        REDIS_BUCKETS.female,
        REDIS_BUCKETS.other,
      ],
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.END_CHAT) {
    await handleEndChat({
      senderId: messaging.sender.id,
    });
  }
}

type HandleFindPeerCommand = {
  bucketToSave: string;
  bucketToFinds: string[];
  senderId: string;
};

async function handleFindCommand({
  bucketToSave,
  bucketToFinds,
  senderId,
}: HandleFindPeerCommand): Promise<void> {
  const bucketToFind = bucketToFinds[0];
  const existingPeer = await redis.lindex(bucketToFind, -1);

  if (!existingPeer) {
    await Queuing.addToQueueIfNotExists(bucketToSave, senderId);
    await sendMessage(senderId, {
      text: TEXT_RESPONSES.WAITING_FOR_PARTNER,
    });
    return;
  }

  if (existingPeer === senderId) {
    logger.info("User is already in the queue");
    return;
  }

  try {
    await Sessions.createSession(senderId, existingPeer);
    await Queuing.removeFromAllQueues(senderId);
    await Queuing.removeFromAllQueues(existingPeer);

    return sendMessageToRecipients([existingPeer, senderId], {
      text: TEXT_RESPONSES.FOUND_PARTNER,
    });
  } catch (error) {
    logger.error("Error creating session:", error);
    return sendMessage(senderId, {
      text: TEXT_RESPONSES.ERRORS.CANNOT_CREATE_SESSION,
    });
  }
}

type HandleFindAllCommand = {
  allBuckets: string[];
  senderId: string;
};
async function handleFindAllCommand({
  allBuckets,
  senderId,
}: HandleFindAllCommand): Promise<void> {
  for (const bucket of allBuckets) {
    const existingPeer = await redis.lindex(bucket, -1);

    if (existingPeer) {
      if (existingPeer === senderId) {
        logger.info("User is already in the queue");
        continue;
      }

      try {
        await Sessions.createSession(senderId, existingPeer);
        await Queuing.removeFromQueue(bucket, existingPeer);

        return sendMessageToRecipients([existingPeer, senderId], {
          text: TEXT_RESPONSES.FOUND_PARTNER,
        });
      } catch (error) {
        logger.error("Error creating session:", error);
        return sendMessage(senderId, {
          text: TEXT_RESPONSES.ERRORS.CANNOT_CREATE_SESSION,
        });
      }
    }
  }

  await Promise.all(
    allBuckets.map((bucket) => Queuing.addToQueueIfNotExists(bucket, senderId))
  );

  return sendMessage(senderId, {
    text: TEXT_RESPONSES.WAITING_FOR_PARTNER,
  });
}

type HandleEndChatCommand = {
  senderId: string;
};

async function handleEndChat({ senderId }: HandleEndChatCommand) {
  const partnerId = await Sessions.getPartnerId(senderId);

  if (!partnerId) {
    await sendMessage(senderId, {
      text: TEXT_RESPONSES.ERRORS.END_CHAT.NO_PARTNER,
    });
    return;
  }

  try {
    await Sessions.deleteSession(senderId, partnerId);
    await Queuing.removeFromAllQueues(senderId);
    await Queuing.removeFromAllQueues(partnerId);

    await sendMessage(senderId, {
      text: TEXT_RESPONSES.END_CHAT.SELF_END,
    });
    await sendMessage(partnerId, {
      text: TEXT_RESPONSES.END_CHAT.PARTNER_END,
    });
    setTimeout(async () => {
      await sendMessageToRecipients([senderId, partnerId], QUICK_REPLY);
    }, 1000);
  } catch (error) {
    logger.error("Error ending session:", error);
    return sendMessage(senderId, {
      text: TEXT_RESPONSES.ERRORS.END_CHAT.CAN_NOT_END_SESSION,
    });
  }
}
