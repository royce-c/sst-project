import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  numeric,
  serial,
  date,
} from "drizzle-orm/pg-core";

export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    title: varchar("title", { length: 1000 }).notNull(),
    description: varchar("description", { length: 100 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      nameIdx: index("userId_idx").on(table.userId),
    };
  },
);
