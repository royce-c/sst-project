import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { authMiddleware } from "@my-expenses-app/core/auth";

const app = new Hono();

export const runtime = "edge";

type Message = {
  role: "system" | "user" | "assistant";
  content: any;
};

export const messageForAI: Message[] = [
  {
    role: "system",
    content: "You are an expert at explaining images",
  },
  {
    role: "user",
    content: "Please explain this image to me",
  },
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Model =
  | "gpt-4-vision-preview"
  | "gpt-4-1106-preview"
  | "gpt-3.5-turbo-1106";

app.post("/ai", authMiddleware, async (c) => {
  const { content } = await c.req.json();

  let messages: Message[] = [
    {
      role: "user",
      content: content,
    },
  ];

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: "gpt-4-vision-preview",
    messages: [...messageForAI, ...messages],
    max_tokens: 4096,
  };

  try {
    const AIResponse = await openai.chat.completions.create(params);
    const firstChoice = AIResponse.choices[0];
    const assistantMessage = firstChoice.message;
    const assistantContent = assistantMessage.content;

    return c.json(assistantContent);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return c.json({ error: "Failed to get AI response" });
  }
});

export const handler = handle(app);
