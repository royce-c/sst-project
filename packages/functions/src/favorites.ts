import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { favorites as favoritesTable } from "@my-uploads-app/core/db/schema/favorites";
import { db } from "@my-uploads-app/core/db";

import { authMiddleware } from "@my-uploads-app/core/auth";

const app = new Hono();

app.post("/favorites", authMiddleware, async (c) => {
  const body = await c.req.json();
  const uploadId = body.uploadId;
  const userId = body.userId;

  const favorited = await db
    .insert(favoritesTable)
    .values({ userId: userId, uploadId: uploadId })
    .returning();
  return c.json({ favorited: favorited });
});

export const handler = handle(app);
