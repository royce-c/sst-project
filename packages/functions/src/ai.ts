import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
// import { auth } from "auth";

const app = new Hono();

export const runtime = "edge";

type Message = {
  role: "system" | "user" | "assistant";
  content: any;
};

export const messageForAI: Message[] = [
    {
      role: "system",
      content: "You are an expert at explaining images"
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

app.post("/ai", async (c) => {
  const { content } = await c.req.json()

//   const session = await auth()

//   if (!session) {
//     return { failure: "not authenticated" }
//   }

  let messages: Message[] = [
    {
      role: "user",
      content: content,
    },
  ];

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    // model: "gpt-4-1106-preview",
    model: "gpt-4-vision-preview",
    stream: true,
    messages: [...messageForAI, ...messages],
    max_tokens: 4096,
  };

  const iterator = await openai.chat.completions.create(params);

  const stream = OpenAIStream(iterator, {
    async onStart() {
      console.log("onStart");
    },
    async onCompletion(completion: any) {
      console.log("onCompletion", completion);
      // revalidatePath("/");
    },
  });

  return new StreamingTextResponse(stream);
});

export const handler = handle(app);