// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export const config = { runtime: "edge" };
import { createParser } from "eventsource-parser";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string) || "";

export type GenerateIndictmentBody = {
  fact: string;
  appeal: string;
};

interface OpenAIStreamPayload {
  model: string;
  prompt: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].text;

            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse);
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
}

export default async function handler(
  req: NextRequest,
  context: NextFetchEvent
) {
  const { fact, appeal } = await req.json();
  if (OPENAI_API_KEY === "") {
    return NextResponse.json({
      id: "0",
      role: "system",
      text: "请设置 OPENAI_API_KEY",
    });
  }

  // ...专注于解决房屋租赁纠纷...
  const sendMessage = `
  你是一个金牌律师，你非常严谨并且精通中国法律，你有良好的职业道德并且充分的站在你的委托人的立场，你可以根据委托人提供的事实描述和诉求为委托人编写符合中国法律的起诉书，在起诉书中请你用清晰的逻辑描述事实缘由，如果有必要请在起诉书中附上相关中国法律条款。
  请你为你的委托人写一封起诉书，以下是你的委托人提供的资料：

  事实描述：
  ${fact}

  诉求：
  ${appeal}
  `;
  const payload = {
    model: "text-davinci-003",
    prompt: sendMessage,
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1.0,
    frequency_penalty: 0.0,
    stream: true,
    presence_penalty: 0.0,
    n: 1,
  };
  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
