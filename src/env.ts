import "dotenv/config";

export const env = {
  port: parseInt(process.env.PORT || "3000"),
};
