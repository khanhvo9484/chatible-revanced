import { apiClient } from "src/api/index.js";
import { env } from "src/env.js";
import { TEXT_COMMAND } from "src/models/text-command.model.js";

async function setupGetStartedButton() {
  await apiClient.post("/messenger_profile", {
    get_started: {
      payload: TEXT_COMMAND.GET_STARTED,
    },
  });
}

async function setupPersistentMenu() {
  await apiClient.post("/messenger_profile", {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: "postback",
            title: "Get Started",
            payload: TEXT_COMMAND.GET_STARTED,
          },
        ],
      },
    ],
  });
}

function setUpGreetingText() {
  return apiClient.post("/messenger_profile", {
    greeting: [
      {
        locale: "default",
        text: "Xin chào, ấn Bắt đầu để trò chuyện",
      },
    ],
  });
}

export async function setupMenu() {
  return Promise.all([setupGetStartedButton(), setupPersistentMenu()]);
}
