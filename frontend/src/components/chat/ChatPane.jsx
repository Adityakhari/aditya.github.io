import { Fragment, useEffect, useMemo, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { isSamePerson } from "@/lib/nameUtils";

const MESSAGE_BATCH_SIZE = 500;

const getDayKey = (timestamp) => new Date(timestamp).toDateString();

const formatDateLabel = (timestamp) =>
  new Date(timestamp).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const ChatPane = ({ conversation, currentUser, hasConversations }) => {
  const [visibleCount, setVisibleCount] = useState(MESSAGE_BATCH_SIZE);

  useEffect(() => {
    setVisibleCount(MESSAGE_BATCH_SIZE);
  }, [conversation?.id]);

  const allMessages = conversation?.messages ?? [];
  const totalMessages = allMessages.length;
  const startIndex = Math.max(totalMessages - visibleCount, 0);
  const visibleMessages = useMemo(
    () => allMessages.slice(startIndex),
    [allMessages, startIndex],
  );

  if (!hasConversations || !conversation) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-6 text-center"
        data-testid="chat-empty-wrapper"
      >
        <div className="max-w-md space-y-3">
          <h2 className="text-2xl font-semibold" data-testid="chat-empty-title">
            No messages yet
          </h2>
          <p className="text-sm text-[#A8A8A8]" data-testid="chat-empty-description">
            Embed your Instagram JSON files in
            <code> src/data/embeddedInstagramFiles.js </code>
            to display chats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="chat-pane">
      <header
        className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#2b1f5e] bg-[#0B0F67]/85 px-4 backdrop-blur-sm md:px-6"
        data-testid="chat-header"
      >
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold" data-testid="chat-header-title">
            {conversation.title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-[#A8A8A8]" data-testid="chat-header-subtitle">
            {conversation.participants.join(" • ")}
          </p>
        </div>
        <span className="hidden text-xs text-[#737373] sm:inline" data-testid="chat-header-message-count">
          {totalMessages} messages
        </span>
      </header>

      <div
        className="chat-scrollbar chat-heart-bg flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-6"
        data-testid="message-list"
      >
        {startIndex > 0 ? (
          <div className="mb-2 flex justify-center" data-testid="load-older-wrapper">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((previous) =>
                  Math.min(previous + MESSAGE_BATCH_SIZE, totalMessages),
                )
              }
              className="rounded-full border border-[#6a57b4] bg-[#1D1E84]/80 px-4 py-2 text-xs text-[#E8DBFF] transition-colors duration-200 hover:bg-[#2a2f9f]/90"
              data-testid="load-older-messages-button"
            >
              Load older messages ({startIndex} remaining)
            </button>
          </div>
        ) : null}

        {visibleMessages.map((message, index) => {
          const actualIndex = startIndex + index;
          const previousMessage = allMessages[actualIndex - 1];
          const showSender = previousMessage?.senderName !== message.senderName;
          const showDateSeparator =
            !previousMessage ||
            getDayKey(previousMessage.timestamp) !== getDayKey(message.timestamp);
          const isMine = isSamePerson(message.senderName, currentUser);

          return (
            <Fragment key={message.id}>
              {showDateSeparator ? (
                <div className="my-2 flex justify-center" data-testid={`message-date-separator-wrapper-${actualIndex}`}>
                  <span
                    className="rounded-full border border-[#6a57b4] bg-[#1D1E84]/80 px-3 py-1 text-[10px] uppercase tracking-wide text-[#E8DBFF]"
                    data-testid={`message-date-separator-${actualIndex}`}
                  >
                    {formatDateLabel(message.timestamp)}
                  </span>
                </div>
              ) : null}

              <MessageBubble
                message={message}
                isMine={isMine}
                showSender={showSender}
                index={actualIndex}
              />
            </Fragment>
          );
        })}
      </div>

      <div
        className="border-t border-[#2b1f5e] bg-[#0B0F67]/90 px-4 pb-20 pt-3 backdrop-blur-sm sm:px-6 sm:pb-3"
        data-testid="chat-footer-wrapper"
      >
        <p
          className="rounded-full border border-[#6a57b4] bg-[#1D1E84]/85 px-4 py-3 pr-20 text-xs text-[#E8DBFF] sm:pr-4"
          data-testid="chat-footer-note"
        >
          Viewer Mode: Timeline merged from embedded JSON files.
        </p>
      </div>
    </div>
  );
};