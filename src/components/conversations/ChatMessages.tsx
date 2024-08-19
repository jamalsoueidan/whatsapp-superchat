import { Card, Flex, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useLayoutEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useMessages } from "../../hooks/useMessages";
import { Message } from "../../models/data";
import { InfiniteScroll } from "../InfiniteScroll";
import { MessageSystem } from "./messages/MesageSystem";
import { MessageImage } from "./messages/MessageImage";
import { MessageInteractive } from "./messages/MessageInteractive";
import { MessageInteractiveReply } from "./messages/MessageInteractiveReply";
import { MessageText } from "./messages/MessageText";
import { MessageUnknown } from "./messages/MessageUnknown";

export function ChatMessages() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const viewport = useRef<HTMLDivElement>(null);
  const observerTarget = useRef(null);
  const { messages, totalMessageCount, loadMore } = useMessages({
    conversationId,
    perPage: 20,
  });

  const [stickyStates, setStickyStates] = useState<Record<string, boolean>>({});

  const formatDate = (timestamp: number) => {
    const messageDate = dayjs(timestamp * 1000);
    const currentDate = dayjs();

    const daysDifference = currentDate.diff(messageDate, "day");

    if (daysDifference <= 4) {
      // If the message is within the last 4 days, show the day name
      return messageDate.format("dddd");
    } else {
      // Otherwise, show the full date (MM/DD/YYYY)
      return messageDate.format("MM/DD/YYYY");
    }
  };

  // Function to determine if the day has changed between two messages
  const hasDayChanged = (currentMessage: Message, previousMessage: Message) => {
    return !dayjs(currentMessage.timestamp * 1000).isSame(
      previousMessage.timestamp * 1000,
      "day"
    );
  };

  const handleScroll = () => {
    if (viewport.current) {
      const messagesElements =
        viewport.current.querySelectorAll("[data-message-id]");

      const newStickyStates: Record<string, boolean> = {};

      messagesElements.forEach((element: Element) => {
        const rect = element.getBoundingClientRect();
        const messageDate = element.getAttribute("data-message-date");

        if (messageDate && !newStickyStates[messageDate]) {
          // Make the date sticky if it's above the current viewport (i.e., it has scrolled past)
          newStickyStates[messageDate] = rect.top <= 70;
        }
      });

      setStickyStates(newStickyStates);
    }
  };

  useLayoutEffect(() => {
    const viewportElement = viewport.current;
    console.log(viewportElement);
    viewportElement?.addEventListener("scroll", handleScroll);

    return () => {
      viewportElement?.removeEventListener("scroll", handleScroll);
    };
  }, [messages]);

  return (
    <InfiniteScroll
      key={conversationId}
      data={messages}
      totalData={totalMessageCount}
      loadMore={loadMore}
      ref={viewport}
    >
      <div ref={observerTarget}></div>
      {messages.map((msg, index) => {
        const showDateHeader =
          index === 0 || hasDayChanged(msg, messages[index - 1]);

        const date = dayjs(msg.timestamp * 1000).format("MM/DD/YYYY");

        const isSticky = stickyStates[date];

        return (
          <div
            key={msg._id.toString()}
            id={msg._id.toJSON()}
            data-message-id={msg._id.toString()}
            data-message-date={date}
          >
            {showDateHeader && (
              <Flex justify="center">
                <Card
                  px="xs"
                  py="2px"
                  mt="4px"
                  shadow="xs"
                  radius="md"
                  miw="72px"
                  style={{
                    position: isSticky ? "absolute" : "static",
                    top: isSticky ? "0px" : "auto",
                    zIndex: isSticky ? 10 : "auto",
                  }}
                >
                  <Text c="dimmed" fz="sm" fw="400" ta="center">
                    {formatDate(msg.timestamp)}
                  </Text>
                </Card>
              </Flex>
            )}
            {msg.type === "text" && <MessageText msg={msg} />}
            {msg.type === "image" && <MessageImage msg={msg} />}
            {msg.type === "interactive" && msg.interactive && (
              <MessageInteractive msg={msg} />
            )}
            {msg.type === "interactive_reply" && msg.interactive_reply && (
              <MessageInteractiveReply msg={msg} />
            )}
            {msg.type === "system" && <MessageSystem msg={msg} />}
            {msg.type !== "text" &&
              msg.type !== "image" &&
              msg.type !== "interactive" &&
              msg.type !== "interactive_reply" &&
              msg.type !== "system" && <MessageUnknown msg={msg} />}
          </div>
        );
      })}
    </InfiniteScroll>
  );
}
