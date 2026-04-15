import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { productLookupTool } from "./tools/productLookup.js";
import { inventoryCheckTool } from "./tools/inventoryCheck.js";
import { buildPlaceOrderTool } from "./tools/placeOrder.js";
import { buildLookupCustomerTool, buildSaveCustomerTool } from "./tools/customerInfo.js";
import { SupabaseChatMessageHistory } from "./memory.js";
import { loadSystemPrompt } from "./systemPrompt.js";

const llm = new ChatOpenAI({
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: 0.4,
});

export interface RunInput {
  sessionId: string; // "web:<uuid>" or "tg:<chatId>"
  userMessage: string;
  channel: "web" | "telegram";
}

export interface RunResult {
  reply: string;
  trace: Array<{ role: string; name?: string; content: string; tool_calls?: unknown }>;
}

export async function runAgent(input: RunInput): Promise<string> {
  return (await runAgentDetailed(input)).reply;
}

export async function runAgentDetailed({
  sessionId,
  userMessage,
  channel,
}: RunInput): Promise<RunResult> {
  const history = new SupabaseChatMessageHistory(sessionId);
  const prior = await history.getMessages();
  const channel_user_id = sessionId.split(":").slice(1).join(":");

  // Runtime-bound tools: identifier is baked in server-side, never exposed to the LLM.
  const ctx = { channel, channel_user_id };
  const tools = [
    productLookupTool,
    inventoryCheckTool,
    buildLookupCustomerTool(ctx),
    buildSaveCustomerTool(ctx),
    buildPlaceOrderTool(ctx),
  ];
  const agent = createReactAgent({ llm, tools });

  const system = new SystemMessage(loadSystemPrompt());
  const human = new HumanMessage(userMessage);

  const result = await agent.invoke({
    messages: [system, ...prior, human] as BaseMessage[],
  });
  const last = result.messages[result.messages.length - 1];
  const text = typeof last.content === "string" ? last.content : JSON.stringify(last.content);

  await history.addMessage(human);
  await history.addMessage(last);

  const trace = result.messages.map((m: any) => ({
    role: m._getType?.() ?? m.role ?? "unknown",
    name: m.name,
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    tool_calls: m.tool_calls,
  }));

  return { reply: text, trace };
}
