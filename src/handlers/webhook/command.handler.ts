import { eq } from "drizzle-orm";
import { db } from "src/database/db.js";
import { redis } from "src/database/redis.js";
import { sessions } from "src/database/schema.js";
import type { Messaging } from "src/interfaces/webhook-payload.js";
import { logger } from "src/logger/logger.js";
import { TEXT_COMMAND } from "src/models/text-command.model.js";
import {
  sendMessage,
  sendMessageToRecipients,
} from "src/services/send-message.service.js";

const STARTER_MESSAGE = {
  attachment: {
    type: "template",
    payload: {
      template_type: "button",
      text: "Bạn muốn trò chuyện với ai?",
      buttons: [
        {
          type: "postback",
          title: "Nam",
          payload: TEXT_COMMAND.FIND_MALE,
        },
        {
          type: "postback",
          title: "Nữ",
          payload: TEXT_COMMAND.FIND_FEMALE,
        },
        {
          type: "postback",
          title: "Khác",
          payload: TEXT_COMMAND.FIND_OTHER,
        },
      ],
    },
  },
};

const QUICK_REPLY = {
  text: "Bạn muốn trò chuyện với ai?",
  quick_replies: [
    {
      content_type: "text",
      title: "Nam",
      payload: TEXT_COMMAND.FIND_ALL,
    },
    {
      content_type: "text",
      title: "Nữ",
      payload: TEXT_COMMAND.FIND_ALL,
    },
    {
      content_type: "text",
      title: "Khác",
      payload: TEXT_COMMAND.FIND_ALL,
    },
    {
      content_type: "text",
      title: "Tất cả",
      payload: TEXT_COMMAND.FIND_ALL,
    },
  ],
};

export async function commandHandler(messaging: Messaging) {
  const command = messaging?.postback?.payload;

  if (command === TEXT_COMMAND.GET_STARTED) {
    return sendMessage(messaging.sender.id, QUICK_REPLY);
  }

  if (command === TEXT_COMMAND.FIND_MALE) {
    await handleFindCommand({
      bucketToSave: "bucket:female",
      bucketToFind: "bucket:male",
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_FEMALE) {
    await handleFindCommand({
      bucketToSave: "bucket:male",
      bucketToFind: "bucket:female",
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_OTHER) {
    await handleFindCommand({
      bucketToSave: "bucket:other",
      bucketToFind: "bucket:other",
      senderId: messaging.sender.id,
    });
  }

  if (command === TEXT_COMMAND.FIND_ALL) {
    handleFindAllCommand(messaging.sender.id);
  }
}

type HandleFindPeerCommand = {
  bucketToSave: string;
  bucketToFind: string;
  senderId: string;
};

async function handleFindCommand({
  bucketToSave,
  bucketToFind,
  senderId,
}: HandleFindPeerCommand) {
  const existingPeer = await redis.lindex(bucketToFind, -1);

  if (!existingPeer) {
    await addToQueueIfNotExists(bucketToSave, senderId);
    return sendMessage(senderId, {
      text: "Đang tìm kiếm... Vui lòng đợi trong giây lát.",
    });
  }

  if (existingPeer === senderId) {
    logger.info("User tried to connect with themselves");
    return;
  }

  const [userId1, userId2] = getUserOrderId([existingPeer, senderId]);

  try {
    await handleActiveSessions(userId1, userId2);
    await createSession(userId1, userId2);
    await updateQueues(bucketToFind, bucketToSave, existingPeer, senderId);
  } catch (error) {
    logger.error("Error creating session:", error);
    return sendMessage(senderId, {
      text: "Đã xảy ra lỗi khi tạo phiên trò chuyện. Vui lòng thử lại sau.",
    });
  }

  return sendMessageToRecipients([existingPeer, senderId], {
    text: "Đã tìm thấy người bạn chat! Hãy bắt đầu trò chuyện nào.",
  });
}

async function addToQueueIfNotExists(bucket: string, userId: string) {
  const allUsersInQueue = await redis.lrange(bucket, 0, -1);
  if (!allUsersInQueue.includes(userId)) {
    await redis.rpush(bucket, userId);
  }
}

async function handleActiveSessions(userId1: string, userId2: string) {
  const existingActiveSessions = await db.query.sessions.findMany({
    where: (sessions, { eq }) =>
      eq(sessions.user1Id, userId1) &&
      eq(sessions.user2Id, userId2) &&
      eq(sessions.status, "active"),
  });

  if (existingActiveSessions.length === 1) {
    return sendMessageToRecipients([userId1, userId2], {
      text: "Đã tìm thấy người bạn chat! Hãy bắt đầu trò chuyện nào.",
    });
  }

  if (existingActiveSessions.length > 1) {
    logger.error(
      `Found multiple active sessions for users ${userId1} and ${userId2}`
    );
    await db
      .update(sessions)
      .set({ status: "ended" })
      .where(
        eq(sessions.user1Id, userId1) &&
          eq(sessions.user2Id, userId2) &&
          eq(sessions.status, "active")
      );
  }
}

async function createSession(userId1: string, userId2: string) {
  await db.insert(sessions).values({
    user1Id: userId1,
    user2Id: userId2,
  });

  await redis.sadd(`${userId1}`, `${userId2}`);
  await redis.sadd(`${userId2}`, `${userId1}`);
}

async function updateQueues(
  bucketToFind: string,
  bucketToSave: string,
  existingPeer: string,
  senderId: string
) {
  await redis.lrem(bucketToFind, 1, existingPeer);
  await redis.lrem(bucketToSave, 1, senderId);
}

export function getUserOrderId(userIds: string[]): string[] {
  return userIds
    .map((id) => id.replace(/\D/g, "")) // keep only digits
    .sort((a, b) => Number(b) - Number(a)); // sort descending
}

function handleFindAllCommand(senderId: string) {
  // TODO: Implement this function
}
