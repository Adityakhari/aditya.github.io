import { X } from "lucide-react";
import { getDisplayName } from "@/lib/nameUtils";

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

const withPrefix = (prefix, value) => `${prefix}-${value}`;

export const ConversationSidebar = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUser,
  testIdPrefix,
  showCloseButton,
  onClose,
}) => {
  return (
    <div
      className="flex h-full flex-col bg-[#0B0F67]/90 backdrop-blur-sm"
      data-testid={withPrefix(testIdPrefix, "conversation-sidebar")}
    >
      <div className="border-b border-[#2b1f5e] px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-xs uppercase tracking-[0.25em] text-[#A8A8A8]"
            data-testid={withPrefix(testIdPrefix, "sidebar-brand-label")}
          >
            Instagram Style
          </p>

          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#5f54a0] p-1.5 transition-colors duration-200 hover:bg-[#1a1f7d]"
              data-testid={withPrefix(testIdPrefix, "sidebar-close-button")}
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        <h1
          className="mt-2 text-2xl font-semibold"
          data-testid={withPrefix(testIdPrefix, "sidebar-main-heading")}
        >
          {currentUser}
        </h1>
      </div>

      <div
        className="chat-scrollbar flex-1 overflow-y-auto py-2"
        data-testid={withPrefix(testIdPrefix, "conversation-list-container")}
      >
        {conversations.map((conversation, index) => {
          const isSelected = conversation.id === selectedConversationId;
          return (
            <button
              type="button"
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full border-b border-[#111111] px-5 py-4 text-left transition-colors duration-200 ${
                isSelected ? "bg-[#1a1f7d]/90" : "hover:bg-[#151a73]/80"
              }`}
              data-testid={withPrefix(
                testIdPrefix,
                buildConversationTestId(conversation.id),
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold text-[#FAFAFA]"
                    data-testid={withPrefix(
                      testIdPrefix,
                      `conversation-title-${index}`,
                    )}
                  >
                    {getDisplayName(conversation.title)}
                  </p>
                  <p
                    className="mt-1 truncate text-xs text-[#A8A8A8]"
                    data-testid={withPrefix(
                      testIdPrefix,
                      `conversation-preview-${index}`,
                    )}
                  >
                    {conversation.preview}
                  </p>
                </div>
                <span
                  className="shrink-0 text-[10px] text-[#737373]"
                  data-testid={withPrefix(testIdPrefix, `conversation-time-${index}`)}
                >
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