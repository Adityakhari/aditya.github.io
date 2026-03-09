import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Menu, Search } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { getDisplayName, isSamePerson } from "@/lib/nameUtils";
import { AADI_PROFILE_IMAGES } from "@/lib/profileImages";

const MESSAGE_BATCH_SIZE = 500;

const getDayKey = (timestamp) => new Date(timestamp).toDateString();

const formatDateLabel = (timestamp) =>
  new Date(timestamp).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatCompactCount = (count) =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;

const formatResultDateTime = (timestamp) =>
  new Date(timestamp).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const normalizeForSearch = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/[.,!?;:()[\]{}"“”\\/@#$%^&*_+=~<>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const ChatPane = ({
  conversation,
  currentUser,
  hasConversations,
  onMobileMenuOpen,
}) => {
  const [windowStart, setWindowStart] = useState(0);
  const [windowEnd, setWindowEnd] = useState(MESSAGE_BATCH_SIZE);
  const [searchText, setSearchText] = useState("");
  const [searchMatchIndexes, setSearchMatchIndexes] = useState([]);
  const [activeMatchPointer, setActiveMatchPointer] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const messageListRef = useRef(null);

  const allMessages = conversation?.messages ?? [];
  const totalMessages = allMessages.length;
  const visibleMessages = useMemo(
    () => allMessages.slice(windowStart, windowEnd),
    [allMessages, windowStart, windowEnd],
  );

  useEffect(() => {
    const latestStart = Math.max(totalMessages - MESSAGE_BATCH_SIZE, 0);
    setWindowStart(latestStart);
    setWindowEnd(totalMessages);
    setHighlightedIndex(null);
    setSearchMatchIndexes([]);
    setActiveMatchPointer(-1);
    setSearchText("");
    setIsSearchPanelOpen(false);
  }, [conversation?.id, totalMessages]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToLatest(distanceFromBottom > 220);
    };

    onScroll();
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [windowStart, windowEnd, visibleMessages.length]);

  const focusMessageIndex = (index) => {
    setHighlightedIndex(index);

    const centeredStart = Math.max(index - Math.floor(MESSAGE_BATCH_SIZE / 2), 0);
    const centeredEnd = Math.min(centeredStart + MESSAGE_BATCH_SIZE, totalMessages);
    const adjustedStart = Math.max(centeredEnd - MESSAGE_BATCH_SIZE, 0);

    setWindowStart(adjustedStart);
    setWindowEnd(centeredEnd);
  };

  useEffect(() => {
    if (highlightedIndex === null) {
      return;
    }

    if (highlightedIndex < windowStart || highlightedIndex >= windowEnd) {
      return;
    }

    const timer = setTimeout(() => {
      const element = document.getElementById(`message-anchor-${highlightedIndex}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 130);

    return () => clearTimeout(timer);
  }, [highlightedIndex, windowStart, windowEnd]);

  const computeMatches = (queryValue) => {
    const query = queryValue.trim().toLowerCase();
    const normalizedQuery = normalizeForSearch(query);

    if (!query) {
      return [];
    }

    const matches = [];

    allMessages.forEach((message, index) => {
      const searchLine = `${message.senderName} ${message.content}`.toLowerCase();
      const normalizedSearchLine = normalizeForSearch(searchLine);

      if (
        searchLine.includes(query) ||
        (normalizedQuery.length > 0 &&
          normalizedSearchLine.includes(normalizedQuery))
      ) {
        matches.push(index);
      }
    });

    return matches;
  };

  const runSearch = (shouldFocusFirst = true) => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      setSearchMatchIndexes([]);
      setActiveMatchPointer(-1);
      setHighlightedIndex(null);
      setIsSearchPanelOpen(false);
      return;
    }

    const matches = computeMatches(query);

    setSearchMatchIndexes(matches);
    setIsSearchPanelOpen(true);

    if (matches.length > 0 && shouldFocusFirst) {
      setActiveMatchPointer(0);
      focusMessageIndex(matches[0]);
      return;
    }

    if (matches.length > 0) {
      setActiveMatchPointer(0);
      return;
    }

    setActiveMatchPointer(-1);
    setHighlightedIndex(null);
  };

  const searchResultItems = useMemo(
    () =>
      searchMatchIndexes.slice(0, 120).map((matchIndex, resultIndex) => ({
        resultIndex,
        matchIndex,
        senderName: allMessages[matchIndex]?.senderName ?? "Unknown",
        content: allMessages[matchIndex]?.content ?? "",
        timestamp: allMessages[matchIndex]?.timestamp ?? Date.now(),
      })),
    [allMessages, searchMatchIndexes],
  );

  const jumpToMatch = (direction) => {
    if (searchMatchIndexes.length === 0) {
      return;
    }

    const nextPointer =
      direction === "next"
        ? (activeMatchPointer + 1) % searchMatchIndexes.length
        : (activeMatchPointer - 1 + searchMatchIndexes.length) %
          searchMatchIndexes.length;

    setActiveMatchPointer(nextPointer);
    focusMessageIndex(searchMatchIndexes[nextPointer]);
  };

  const jumpToLatest = () => {
    const latestStart = Math.max(totalMessages - MESSAGE_BATCH_SIZE, 0);
    setWindowStart(latestStart);
    setWindowEnd(totalMessages);
    setHighlightedIndex(null);

    setTimeout(() => {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 80);
  };

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
        className="flex min-h-[52px] shrink-0 items-center justify-between border-b border-[#2b1f5e] bg-[#0B0F67]/85 px-4 backdrop-blur-sm md:px-6"
        data-testid="chat-header"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMobileMenuOpen}
              className="rounded-full border border-[#5f54a0] p-1.5 text-[#E8DBFF] transition-all duration-200 hover:bg-[#1a1f7d] active:scale-95 md:hidden"
              data-testid="mobile-open-sidebar-button"
            >
              <Menu size={15} />
            </button>
            <h2 className="truncate text-base font-semibold" data-testid="chat-header-title">
              {getDisplayName(conversation.title)}
            </h2>
            <div className="flex -space-x-2" data-testid="chat-header-profile-circles">
              {AADI_PROFILE_IMAGES.map((imageUrl, index) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={`Aadi profile ${index + 1}`}
                  className="h-6 w-6 rounded-full border border-[#6a57b4] object-cover"
                  data-testid={`chat-header-profile-circle-${index + 1}`}
                />
              ))}
            </div>
          </div>
          <p className="mt-0.5 truncate text-xs text-[#A8A8A8]" data-testid="chat-header-subtitle">
            Aadi is sorry
          </p>
        </div>

        <span className="ml-3 text-xs text-[#c8b5f2]" data-testid="chat-header-message-count">
          {formatCompactCount(totalMessages)} total
        </span>
      </header>

      <div
        className="flex flex-wrap items-center gap-2 border-b border-[#2b1f5e] bg-[#0B0F67]/80 px-4 py-1.5 sm:px-6"
        data-testid="chat-search-toolbar"
      >
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-[#6a57b4] bg-[#111870]/90 px-3 py-1.5 transition-all duration-300 focus-within:shadow-[0_0_18px_rgba(213,153,255,0.55)]">
          <Search size={14} className="text-[#E8DBFF]" />
          <input
            value={searchText}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchText(nextValue);

              if (!nextValue.trim()) {
                setSearchMatchIndexes([]);
                setActiveMatchPointer(-1);
                setHighlightedIndex(null);
                setIsSearchPanelOpen(false);
                return;
              }

              const liveMatches = computeMatches(nextValue);
              setSearchMatchIndexes(liveMatches);
              setActiveMatchPointer(liveMatches.length > 0 ? 0 : -1);
              setIsSearchPanelOpen(true);
            }}
            onFocus={() => {
              if (searchText.trim().length > 0) {
                setIsSearchPanelOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                runSearch(true);
              }
            }}
            placeholder="Search all messages"
            className="w-full bg-transparent text-xs text-[#F3EAFF] outline-none placeholder:text-[#bca8ea]"
            data-testid="chat-search-input"
          />
          <button
            type="button"
            onClick={() => runSearch(true)}
            className="rounded-full bg-[#472596] px-2 py-1 text-[11px] text-[#f5ecff] transition-all duration-200 hover:shadow-[0_0_14px_rgba(206,136,255,0.75)] active:scale-95"
            data-testid="chat-search-submit-button"
          >
            Find
          </button>

          {searchText.trim().length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSearchText("");
                setSearchMatchIndexes([]);
                setActiveMatchPointer(-1);
                setHighlightedIndex(null);
                setIsSearchPanelOpen(false);
              }}
              className="rounded-full border border-[#6a57b4] px-2 py-1 text-[11px] text-[#e8dbff] transition-all duration-200 hover:bg-[#1a1f7d] active:scale-95"
              data-testid="chat-search-clear-button"
            >
              Clear
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => jumpToMatch("prev")}
          className="rounded-full border border-[#6a57b4] p-1.5 text-[#E8DBFF] transition-all duration-200 hover:bg-[#1a1f7d] active:scale-95 disabled:opacity-40"
          disabled={searchMatchIndexes.length === 0}
          data-testid="chat-search-prev-button"
        >
          <ChevronUp size={14} />
        </button>

        <button
          type="button"
          onClick={() => jumpToMatch("next")}
          className="rounded-full border border-[#6a57b4] p-1.5 text-[#E8DBFF] transition-all duration-200 hover:bg-[#1a1f7d] active:scale-95 disabled:opacity-40"
          disabled={searchMatchIndexes.length === 0}
          data-testid="chat-search-next-button"
        >
          <ChevronDown size={14} />
        </button>

        <span
          className="text-[11px] text-[#c8b5f2] transition-colors duration-200"
          data-testid="chat-search-results-count"
        >
          {searchMatchIndexes.length > 0
            ? activeMatchPointer >= 0
              ? `${activeMatchPointer + 1}/${searchMatchIndexes.length} matches`
              : `${searchMatchIndexes.length} matches`
            : "No active search"}
        </span>
      </div>

      {isSearchPanelOpen && searchText.trim().length > 0 ? (
        <div
          className="max-h-52 overflow-y-auto border-b border-[#2b1f5e] bg-[#0B0F67]/82 px-4 py-2 sm:px-6"
          data-testid="chat-search-results-panel"
        >
          {searchResultItems.length > 0 ? (
            searchResultItems.map((item) => (
              <button
                type="button"
                key={`search-result-${item.matchIndex}`}
                onClick={() => {
                  const pointerIndex = searchMatchIndexes.findIndex(
                    (value) => value === item.matchIndex,
                  );
                  setActiveMatchPointer(pointerIndex);
                  focusMessageIndex(item.matchIndex);
                  setIsSearchPanelOpen(false);
                }}
                className="mb-1 flex w-full flex-col rounded-xl border border-transparent px-3 py-2 text-left transition-all duration-200 hover:border-[#6a57b4] hover:bg-[#1a1f7d]/70"
                data-testid={`chat-search-result-item-${item.resultIndex}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#efe6ff]" data-testid={`chat-search-result-sender-${item.resultIndex}`}>
                    {getDisplayName(item.senderName)}
                  </span>
                  <span className="text-[10px] text-[#bfa8ec]" data-testid={`chat-search-result-time-${item.resultIndex}`}>
                    {formatResultDateTime(item.timestamp)}
                  </span>
                </div>
                <span
                  className="mt-1 line-clamp-1 text-xs text-[#d7c5ff]"
                  data-testid={`chat-search-result-content-${item.resultIndex}`}
                >
                  {item.content || "(empty message)"}
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-[#c8b5f2]" data-testid="chat-search-no-results-text">
              No messages found for this search.
            </p>
          )}
        </div>
      ) : null}

      <div
        ref={messageListRef}
        className="chat-scrollbar chat-heart-bg flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 sm:px-6"
        data-testid="message-list"
      >
        {windowStart > 0 ? (
          <div className="mb-2 flex justify-center" data-testid="load-older-wrapper">
            <button
              type="button"
              onClick={() => setWindowStart((previous) => Math.max(previous - MESSAGE_BATCH_SIZE, 0))}
              className="rounded-full border border-[#6a57b4] bg-[#1D1E84]/80 px-4 py-2 text-xs text-[#E8DBFF] transition-all duration-200 hover:bg-[#2a2f9f]/90 hover:shadow-[0_0_12px_rgba(171,124,255,0.45)] active:scale-95"
              data-testid="load-older-messages-button"
            >
              Show previous {Math.min(MESSAGE_BATCH_SIZE, windowStart)} messages
            </button>
          </div>
        ) : null}

        {windowEnd < totalMessages ? (
          <div className="mb-2 flex justify-center" data-testid="load-newer-wrapper">
            <button
              type="button"
              onClick={() =>
                setWindowEnd((previous) =>
                  Math.min(previous + MESSAGE_BATCH_SIZE, totalMessages),
                )
              }
              className="rounded-full border border-[#6a57b4] bg-[#1D1E84]/80 px-4 py-2 text-xs text-[#E8DBFF] transition-all duration-200 hover:bg-[#2a2f9f]/90 hover:shadow-[0_0_12px_rgba(171,124,255,0.45)] active:scale-95"
              data-testid="load-newer-messages-button"
            >
              Show newer messages
            </button>
          </div>
        ) : null}

        {visibleMessages.map((message, index) => {
          const actualIndex = windowStart + index;
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

              <div id={`message-anchor-${actualIndex}`} data-testid={`message-anchor-${actualIndex}`}>
                <MessageBubble
                  message={message}
                  isMine={isMine}
                  showSender={showSender}
                  index={actualIndex}
                  isHighlighted={actualIndex === highlightedIndex}
                />
              </div>
            </Fragment>
          );
        })}

        <div className="h-2" data-testid="message-list-bottom-anchor" />

        {showScrollToLatest ? (
          <button
            type="button"
            onClick={jumpToLatest}
            className="sticky bottom-3 ml-1 mr-auto flex items-center gap-2 rounded-full border border-[#6a57b4] bg-[#111870]/90 px-4 py-2 text-xs text-[#E8DBFF] shadow-lg transition-all duration-200 hover:bg-[#1a1f7d] hover:shadow-[0_0_14px_rgba(171,124,255,0.5)] active:scale-95"
            data-testid="jump-to-latest-button"
          >
            Jump to latest <ChevronDown size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
};