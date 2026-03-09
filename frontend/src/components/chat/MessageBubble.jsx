import { isSamePerson } from "@/lib/nameUtils";

const formatTimestamp = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const MessageBubble = ({
  message,
  isMine,
  showSender,
  index,
  isHighlighted,
}) => {
  const isAdityaMessage = isSamePerson(message.senderName, "Aditya");

  return (
    <article
      className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
      data-testid={`message-row-${index}`}
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        {showSender ? (
          <p
            className={`mb-1 text-xs ${isMine ? "text-right text-[#F3E9FF]" : "text-[#D9CBFF]"}`}
            data-testid={`message-sender-${index}`}
          >
            {message.senderName}
          </p>
        ) : null}

        <div
          className={`rounded-[22px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isAdityaMessage
              ? "rounded-bl-md bg-[#472596] text-[#F6EDFF]"
              : "rounded-br-md bg-[#E2D1FE] text-[#1C0F36]"
          } ${
            isHighlighted
              ? "outline outline-2 outline-[#ff67ef] shadow-[0_0_26px_rgba(255,90,245,0.75)]"
              : ""
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