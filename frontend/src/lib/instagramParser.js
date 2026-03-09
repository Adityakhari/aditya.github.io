import { isSamePerson } from "@/lib/nameUtils";

const safeString = (value, fallback = "") => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
};

const repairTextEncoding = (input) => {
  const text = safeString(input);

  if (!/[ðâÃ]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    const repaired = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return repaired || text;
  } catch {
    return text;
  }
};

const getPreviewText = (content) => {
  const text = repairTextEncoding(content);
  return text.trim().length > 0 ? text : "(empty message)";
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
    senderName: repairTextEncoding(
      message.sender_name ?? message.senderName ?? message.sender ?? message.from,
    ),
    content: repairTextEncoding(message.content ?? message.text ?? message.message),
    timestamp,
  };
};

const mergeMessageFiles = (files, currentUser) => {
  const filesWithMessages = files.filter((item) => Array.isArray(item?.messages));
  if (filesWithMessages.length === 0) {
    return [];
  }

  const mergedMessages = filesWithMessages
    .flatMap((file, fileIndex) =>
      file.messages.map((message, messageIndex) =>
        normalizeMessage(message, `${fileIndex}-${messageIndex}`),
      ),
    )
    .sort((first, second) => first.timestamp - second.timestamp);

  const uniqueMessages = mergedMessages.filter((message, index, array) => {
    if (index === 0) {
      return true;
    }

    const previous = array[index - 1];
    return !(
      previous.senderName === message.senderName &&
      previous.timestamp === message.timestamp &&
      previous.content === message.content
    );
  });

  const allParticipants = filesWithMessages
    .flatMap((file) => file.participants ?? [])
    .map((item) => repairTextEncoding(item?.name ?? item?.username ?? item))
    .filter(Boolean);

  const uniqueParticipants = [...new Set(allParticipants)];
  const messageSenders = [...new Set(uniqueMessages.map((item) => item.senderName))];
  const participants =
    uniqueParticipants.length > 0
      ? uniqueParticipants
      : [
          currentUser,
          ...messageSenders.filter((name) => !isSamePerson(name, currentUser)),
        ];

  const firstFile = filesWithMessages[0] ?? {};
  const fallbackOtherParticipant =
    messageSenders.find((name) => !isSamePerson(name, currentUser)) ??
    "Conversation";

  return [
    {
      id: safeString(firstFile.id ?? "merged-instagram-thread"),
      title: repairTextEncoding(
        firstFile.conversation_title ??
          firstFile.title ??
          firstFile.chat_with ??
          fallbackOtherParticipant,
      ),
      participants: participants.map((name) => ({ name })),
      messages: uniqueMessages,
    },
  ];
};

const getRawConversations = (rawData, currentUser) => {
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
    const mergedFromFiles = mergeMessageFiles(rawData, currentUser);
    if (mergedFromFiles.length > 0) {
      return mergedFromFiles;
    }

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
    .map((item) => repairTextEncoding(item?.name ?? item?.username ?? item))
    .filter(Boolean);

  const otherParticipants = participants.filter(
    (name) => !isSamePerson(name, currentUser),
  );
  const messages = (conversation.messages ?? [])
    .map((item, messageIndex) => normalizeMessage(item, messageIndex))
    .sort((first, second) => first.timestamp - second.timestamp);

  const lastMessage = messages.at(-1);
  const rawTitle = repairTextEncoding(conversation.title);
  const title =
    rawTitle && !isSamePerson(rawTitle, currentUser)
      ? rawTitle
      : otherParticipants.join(", ") || "Conversation";

  return {
    id: safeString(conversation.id ?? conversation.thread_id, `conv-${index}`),
    title,
    otherParticipants,
    participants,
    messages,
    preview: getPreviewText(lastMessage?.content),
    lastMessageTimestamp: lastMessage?.timestamp ?? null,
  };
};

export const parseInstagramData = (rawData, currentUser) => {
  const conversations = getRawConversations(rawData, currentUser)
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
      preview: "Embed your JSON files in src/data/embeddedInstagramFiles.js",
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