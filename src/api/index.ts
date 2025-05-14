import axios from "axios";
import { env } from "src/env.js";

export const apiClient = axios.create({
  baseURL: env.baseUrl, // Replace with your API base URL
  timeout: 10000, // Set a timeout if needed
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    access_token: env.pageAccessToken,
  },
});
