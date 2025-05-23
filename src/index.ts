import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { app } from "./server.js";
import { logger } from "./logger/logger.js";
import { handleWebhookEvent } from "./handlers/webhook/webhook.handler.js";
import type { WebhookPayload } from "./interfaces/webhook-payload.js";
import { setupMenu } from "./services/setup-menu.service.js";

app.get("/", (c) => {
  return c.text("Hello, World!");
});

app.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === env.verifyToken) {
      logger.info("Webhook verified");
      return c.text(challenge ?? "", 200);
    } else {
      logger.error("Invalid token");
      return c.text("Invalid token", 403);
    }
  } else {
    logger.error("Missing parameters");
    return c.text("Missing parameters", 400);
  }
});

app.post("/webhook", async (context) => {
  const body = await context.req.json<WebhookPayload>();

  await handleWebhookEvent(body);
  return context.text("EVENT_RECEIVED", 200);
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    logger.info(`Server is running on port:${info.port}`);
    setupMenu()
      .then(() => {
        logger.info("Menu setup completed");
      })
      .catch((error) => {
        logger.error("Error setting up menu:", error);
      });
  }
);
