import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

import { userProfilePictures as userProfilePicturesTable } from "@my-uploads-app/core/db/schema/user";
import { db } from "@my-uploads-app/core/db";
import { eq, desc } from "drizzle-orm";

import { authMiddleware } from "@my-uploads-app/core/auth";

const app = new Hono();

app.get("/profile-picture", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const profilePictures = await db
    .select()
    .from(userProfilePicturesTable)
    .where(eq(userProfilePicturesTable.userId, userId))
    .orderBy(desc(userProfilePicturesTable.createdAt));
  return c.json({ profilePictures });
});

app.post("/profile-picture", authMiddleware, async (c) => {
  const userId = c.var.userId;
  const body = await c.req.json();
  const profilePicture = {
    ...body.profilePicture,
    userId,
  };
  const newProfilePicture = await db
    .insert(userProfilePicturesTable)
    .values(profilePicture)
    .returning();
  return c.json({ profilePicture: newProfilePicture });
});

app.delete("/profile-picture", authMiddleware, async (c) => {
  const body = await c.req.json();
  const id = body.profilePictureId;
  const deletedProfilePicture = await db
    .delete(userProfilePicturesTable)
    .where(eq(userProfilePicturesTable.id, id))
    .returning();

  return c.json(deletedProfilePicture);
});

export const handler = handle(app);
