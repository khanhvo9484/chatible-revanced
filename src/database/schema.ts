import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  user1Id: text("user1_id").notNull(),
  user2Id: text("user2_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});
