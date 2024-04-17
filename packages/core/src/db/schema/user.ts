import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  serial,
  date,
} from "drizzle-orm/pg-core";

export const userProfilePictures = pgTable(
  "user_profile_pictures",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return {
      userImageIdx: index("userId_idx").on(table.userId),
    };
  }
);
