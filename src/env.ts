import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT || "8100"),
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
};
