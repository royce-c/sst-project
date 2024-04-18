import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { uploads as uploadsTable } from "@my-uploads-app/core/db/schema/uploads";
import { favorites as favoritesTable } from "@my-uploads-app/core/db/schema/favorites";
import { db } from "@my-uploads-app/core/db";
import { eq, desc } from "drizzle-orm";

import { authMiddleware } from "@my-uploads-app/core/auth";

const app = new Hono();

app.get("/uploads", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const uploads = await db
    .select()
    .from(uploadsTable)
    .where(eq(uploadsTable.userId, userId))
    .orderBy(desc(uploadsTable.date));
  return c.json({ uploads });
});

app.post("/uploads", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json();
  const upload = {
    ...body.upload,
    userId,
  };
  const newupload = await db.insert(uploadsTable).values(upload).returning();
  return c.json({ uploads: newupload });
});

app.delete("/uploads", async (c) => {
  const body = await c.req.json();
  const id = body.uploadId;
  await db
    .delete(favoritesTable)
    .where(eq(favoritesTable.uploadId, id))
    .returning();
  await db.delete(uploadsTable).where(eq(uploadsTable.id, id)).returning();
  const deletedUpload = await db
    .delete(uploadsTable)
    .where(eq(uploadsTable.id, id))
    .returning();

  return c.json(deletedUpload);
});

export const handler = handle(app);
