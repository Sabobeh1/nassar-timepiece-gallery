import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { productLookupTool } from "./tools/productLookup.js";
import { inventoryCheckTool } from "./tools/inventoryCheck.js";
import { placeOrderTool } from "./tools/placeOrder.js";
import { SupabaseChatMessageHistory } from "./memory.js";
import { loadSystemPrompt } from "./systemPrompt.js";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.4,
});

const tools = [productLookupTool, inventoryCheckTool, placeOrderTool];

const agent = createReactAgent({ llm, tools });

export interface RunInput {
  sessionId: string;   // "web:<uuid>" or "tg:<chatId>"
  userMessage: string;
  channel: "web" | "telegram";
}

export async function runAgent({ sessionId, userMessage, channel }: RunInput): Promise<string> {
  const history = new SupabaseChatMessageHistory(sessionId);
  const prior = await history.getMessages();
  const system = new SystemMessage(
    loadSystemPrompt() +
      `\n\n[runtime] channel=${channel} session_id=${sessionId}. ` +
      `When calling place_order, pass channel="${channel}" and channel_user_id="${sessionId}".`,
  );
  const human = new HumanMessage(userMessage);

  const result = await agent.invoke({ messages: [system, ...prior, human] });
  const last = result.messages[result.messages.length - 1];
  const text = typeof last.content === "string" ? last.content : JSON.stringify(last.content);

  await history.addMessage(human);
  await history.addMessage(last);

  return text;
}
