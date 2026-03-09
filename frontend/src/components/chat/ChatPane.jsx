import { Fragment } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";

const getDayKey = (timestamp) => new Date(timestamp).toDateString();

const formatDateLabel = (timestamp) =>
  new Date(timestamp).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const ChatPane = ({ conversation, currentUser, hasConversations }) => {
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
        className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#262626] px-4 md:px-6"
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
          {conversation.messages.length} messages
        </span>
      </header>

      <div
        className="chat-scrollbar insta-grid-bg flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-6"
        data-testid="message-list"
      >
        {conversation.messages.map((message, index) => {
          const previousMessage = conversation.messages[index - 1];
          const showSender = previousMessage?.senderName !== message.senderName;
          const showDateSeparator =
            !previousMessage ||
            getDayKey(previousMessage.timestamp) !== getDayKey(message.timestamp);
          const isMine = message.senderName === currentUser;

          return (
            <Fragment key={message.id}>
              {showDateSeparator ? (
                <div className="my-2 flex justify-center" data-testid={`message-date-separator-wrapper-${index}`}>
                  <span
                    className="rounded-full border border-[#2c2c2c] bg-[#0e0e0e] px-3 py-1 text-[10px] uppercase tracking-wide text-[#A8A8A8]"
                    data-testid={`message-date-separator-${index}`}
                  >
                    {formatDateLabel(message.timestamp)}
                  </span>
                </div>
              ) : null}

              <MessageBubble
                message={message}
                isMine={isMine}
                showSender={showSender}
                index={index}
              />
            </Fragment>
          );
        })}
      </div>

      <div
        className="border-t border-[#262626] px-4 pb-20 pt-3 sm:px-6 sm:pb-3"
        data-testid="chat-footer-wrapper"
      >
        <p
          className="rounded-full border border-[#262626] bg-[#121212] px-4 py-3 pr-20 text-xs text-[#A8A8A8] sm:pr-4"
          data-testid="chat-footer-note"
        >
          Viewer Mode: Timeline merged from embedded JSON files.
        </p>
      </div>
    </div>
  );
};