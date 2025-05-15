import { apiClient } from "src/api/index.js";
import {
  PERSISTENT_MENU,
  TEXT_COMMAND,
} from "src/models/text-command.model.js";

async function setupGetStartedButton() {
  await apiClient.post("/messenger_profile", {
    get_started: {
      payload: TEXT_COMMAND.GET_STARTED,
    },
  });
}

async function setupPersistentMenu() {
  await apiClient.post("/messenger_profile", PERSISTENT_MENU);
}

export async function setupMenu() {
  return Promise.all([setupGetStartedButton(), setupPersistentMenu()]);
}
