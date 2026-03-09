const safeString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
};

const toTimestamp = (value) => {
  if (typeof value === "number") {
    return value;
  }
  const parsed = Date.parse(safeString(value));
  return Number.isNaN(parsed) ? Date.now() : parsed;
};

const normalizeMessage = (message, index) => {
  const timestamp = toTimestamp(
    message.timestamp_ms ?? message.timestamp ?? message.created_at,
  );

  return {
    id: safeString(message.id, `msg-${index}-${timestamp}`),
    senderName: safeString(
      message.sender_name ?? message.sender ?? message.from,
      "Unknown",
    ),
    content: safeString(message.content ?? message.text ?? message.message),
    timestamp,
  };
};

const getRawConversations = (rawData) => {
  if (Array.isArray(rawData?.conversations)) {
    return rawData.conversations;
  }

  if (Array.isArray(rawData?.inbox?.conversations)) {
    return rawData.inbox.conversations;
  }

  if (Array.isArray(rawData?.messages)) {
    return [
      {
        id: "embedded-conversation",
        participants: rawData.participants ?? [{ name: "Friend" }],
        messages: rawData.messages,
      },
    ];
  }

  if (Array.isArray(rawData)) {
    return [
      {
        id: "embedded-array-conversation",
        participants: [{ name: "Friend" }],
        messages: rawData,
      },
    ];
  }

  return [];
};

const normalizeConversation = (conversation, index, currentUser) => {
  const participants = (conversation.participants ?? [])
    .map((item) => safeString(item?.name ?? item?.username ?? item))
    .filter(Boolean);

  const otherParticipants = participants.filter((name) => name !== currentUser);
  const messages = (conversation.messages ?? [])
    .map((item, messageIndex) => normalizeMessage(item, messageIndex))
    .filter((item) => item.content.trim().length > 0)
    .sort((first, second) => first.timestamp - second.timestamp);

  const lastMessage = messages.at(-1);
  const title =
    safeString(conversation.title) ||
    otherParticipants.join(", ") ||
    "Conversation";

  return {
    id: safeString(conversation.id ?? conversation.thread_id, `conv-${index}`),
    title,
    otherParticipants,
    participants,
    messages,
    preview: safeString(lastMessage?.content, "No messages yet"),
    lastMessageTimestamp: lastMessage?.timestamp ?? null,
  };
};

export const parseInstagramData = (rawData, currentUser) => {
  const conversations = getRawConversations(rawData)
    .map((item, index) => normalizeConversation(item, index, currentUser))
    .filter((item) => item.messages.length > 0);

  if (conversations.length > 0) {
    return conversations;
  }

  return [
    {
      id: "demo-fallback",
      title: "No Data Found",
      otherParticipants: ["Friend"],
      participants: [currentUser, "Friend"],
      preview: "Embed your JSON in src/data/instagram_data.json",
      lastMessageTimestamp: Date.now(),
      messages: [
        {
          id: "demo-msg-1",
          senderName: "Friend",
          content: "I couldn't find valid message data in the embedded JSON.",
          timestamp: Date.now() - 60_000,
        },
        {
          id: "demo-msg-2",
          senderName: currentUser,
          content: "I will paste/export my Instagram JSON and try again.",
          timestamp: Date.now(),
        },
      ],
    },
  ];
};