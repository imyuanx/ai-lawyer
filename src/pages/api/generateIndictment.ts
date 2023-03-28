// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export const config = { runtime: "edge" };

import type { NextApiRequest, NextApiResponse } from "next";
import { ChatGPTAPI, ChatMessage } from "chatgpt";

export type GenerateIndictmentBody = {
  fact: string;
  appeal: string;
};

export interface _NextApiRequest extends NextApiRequest {
  body: GenerateIndictmentBody;
}

export default async function handler(
  req: _NextApiRequest,
  res: NextApiResponse<ChatMessage>
) {
  const {
    body: { fact, appeal },
  } = req;
  const OPENAI_API_KEY = (process.env.OPENAI_API_KEY as string) || "";
  if (OPENAI_API_KEY === "") {
    res
      .status(500)
      .json({ id: "0", role: "system", text: "请设置 OPENAI_API_KEY" });
    return;
  }
  const api = new ChatGPTAPI({ apiKey: OPENAI_API_KEY });
  const sendMessage = `
你是一个金牌律师，专注于解决房屋租赁纠纷，你非常严谨并且精通中国法律，你有良好的职业道德并且充分的站在你的委托人的立场，你可以根据委托人提供的事实描述和诉求为委托人编写符合中国法律的起诉书，在起诉书中请你用清晰的逻辑描述事实缘由，如果有必要请在起诉书中附上相关中国法律条款。
请你为你的委托人写一封起诉书，以下是你的委托人提供的资料：

事实描述：
${fact}

诉求：
${appeal}
`;
  const message = await api.sendMessage(sendMessage);
  res.status(200).json(message);
}
