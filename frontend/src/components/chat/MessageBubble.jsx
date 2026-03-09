const formatTimestamp = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const MessageBubble = ({ message, isMine, showSender, index }) => {
  return (
    <article
      className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
      data-testid={`message-row-${index}`}
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        {showSender ? (
          <p
            className={`mb-1 text-xs ${isMine ? "text-right text-[#8CC7FF]" : "text-[#A8A8A8]"}`}
            data-testid={`message-sender-${index}`}
          >
            {message.senderName}
          </p>
        ) : null}

        <div
          className={`rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isMine
              ? "rounded-br-md bg-[#3797F0] text-white"
              : "rounded-bl-md bg-[#262626] text-[#FAFAFA]"
          }`}
          data-testid={`message-bubble-${index}`}
        >
          <p className="whitespace-pre-wrap break-words" data-testid={`message-content-${index}`}>
            {message.content}
          </p>
        </div>

        <p
          className={`mt-1 text-[10px] text-[#737373] ${isMine ? "text-right" : "text-left"}`}
          data-testid={`message-time-${index}`}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </article>
  );
};