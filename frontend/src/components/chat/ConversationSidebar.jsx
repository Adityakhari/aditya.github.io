const formatTime = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildConversationTestId = (id) =>
  `conversation-item-${String(id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const ConversationSidebar = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUser,
}) => {
  return (
    <div className="flex h-full flex-col bg-[#000000]" data-testid="conversation-sidebar">
      <div className="border-b border-[#262626] px-5 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#A8A8A8]" data-testid="sidebar-brand-label">
          Instagram Style
        </p>
        <h1 className="mt-2 text-2xl font-semibold" data-testid="sidebar-main-heading">
          {currentUser}
        </h1>
      </div>

      <div className="chat-scrollbar flex-1 overflow-y-auto py-2" data-testid="conversation-list-container">
        {conversations.map((conversation, index) => {
          const isSelected = conversation.id === selectedConversationId;
          return (
            <button
              type="button"
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full border-b border-[#111111] px-5 py-4 text-left transition-colors duration-200 ${
                isSelected ? "bg-[#121212]" : "hover:bg-[#0d0d0d]"
              }`}
              data-testid={buildConversationTestId(conversation.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#FAFAFA]" data-testid={`conversation-title-${index}`}>
                    {conversation.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#A8A8A8]" data-testid={`conversation-preview-${index}`}>
                    {conversation.preview}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-[#737373]" data-testid={`conversation-time-${index}`}>
                  {formatTime(conversation.lastMessageTimestamp)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};