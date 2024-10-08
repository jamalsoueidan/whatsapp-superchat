import { useQuery } from "@realm/react";
import { useState } from "react";
import { BSON } from "realm";
import { Message, MessageSchema } from "../models/data";

export function useMessages({
  conversationId,
  perPage,
}: {
  conversationId: string;
  perPage: number;
}) {
  const [limit, setLimit] = useState(25);

  const totalMessageCount = useQuery<Message>(
    MessageSchema.name,
    (collection) =>
      collection.filtered(
        `conversation._id = $0 AND hidden == $1`,
        new BSON.ObjectId(conversationId),
        null
      ),
    [conversationId]
  ).length;

  const messages = useQuery<Message>(
    MessageSchema.name,
    (collection) => {
      return collection
        .filtered(
          `conversation._id = $0 AND hidden == $1 SORT(timestamp DESC) LIMIT(${limit})`,
          new BSON.ObjectId(conversationId),
          null,
          limit
        )
        .sorted("timestamp");
    },
    [conversationId, limit]
  );

  const loadMore = () => setLimit((prev) => prev + perPage);

  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    messages,
    totalMessageCount,
    loadMore,
    lastMessage,
  };
}
