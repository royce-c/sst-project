import { pgTable, text, integer, serial  } from "drizzle-orm/pg-core"
import { uploads } from "./uploads"

export const favorites = pgTable("favorites", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    uploadId: integer("uploads_id").notNull().references(() => uploads.id),
  })