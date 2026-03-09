import { MessageBubble } from "@/components/chat/MessageBubble";

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
            Embed your Instagram JSON in <code>src/data/instagram_data.json</code>
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
          const isMine = message.senderName === currentUser;

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={isMine}
              showSender={showSender}
              index={index}
            />
          );
        })}
      </div>

      <div className="border-t border-[#262626] px-4 py-3 md:px-6" data-testid="chat-footer-wrapper">
        <p className="rounded-full border border-[#262626] bg-[#121212] px-4 py-3 text-xs text-[#A8A8A8]" data-testid="chat-footer-note">
          Viewer Mode: Messages are loaded from embedded JSON.
        </p>
      </div>
    </div>
  );
};