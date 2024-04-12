import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { uploads as uploadsTable } from "@my-uploads-app/core/db/schema/uploads";
import { db } from "@my-uploads-app/core/db";
import { sum, eq, desc } from "drizzle-orm";

import { authMiddleware } from "@my-uploads-app/core/auth";

const app = new Hono();

app.get("/uploads/total-description", authMiddleware, async (c) => {
  const userId = c.var.userId;

  console.log(userId);
  const result = await db
    .select({ total: sum(uploadsTable.description) })
    .from(uploadsTable)
    .where(eq(uploadsTable.userId, userId))
    .then((res) => res[0]);
  return c.json(result);
});

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

export const handler = handle(app);
