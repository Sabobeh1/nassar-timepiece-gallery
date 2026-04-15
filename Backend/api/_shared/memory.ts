import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  mapChatMessagesToStoredMessages,
  mapStoredMessagesToChatMessages,
  StoredMessage,
} from "@langchain/core/messages";
import { supabase } from "./supabase.js";

/**
 * Session key format:
 *   web:<uuid>   — website visitors
 *   tg:<chatId>  — Telegram chats
 * Requires table: chat_messages(session_id text, idx int, message jsonb, created_at timestamptz).
 */
export class SupabaseChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["nassar", "memory"];
  constructor(private sessionId: string, private windowSize = 20) {
    super();
  }

  async getMessages(): Promise<BaseMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("message")
      .eq("session_id", this.sessionId)
      .order("idx", { ascending: true })
      .limit(this.windowSize);
    if (error) throw error;
    const stored = (data ?? []).map((r: any) => r.message as StoredMessage);
    return mapStoredMessagesToChatMessages(stored);
  }

  async addMessage(message: BaseMessage): Promise<void> {
    const [stored] = mapChatMessagesToStoredMessages([message]);
    const { data: last } = await supabase
      .from("chat_messages")
      .select("idx")
      .eq("session_id", this.sessionId)
      .order("idx", { ascending: false })
      .limit(1);
    const nextIdx = (last?.[0]?.idx ?? -1) + 1;
    const { error } = await supabase.from("chat_messages").insert({
      session_id: this.sessionId,
      idx: nextIdx,
      message: stored,
    });
    if (error) throw error;
  }

  async clear(): Promise<void> {
    await supabase.from("chat_messages").delete().eq("session_id", this.sessionId);
  }
}
