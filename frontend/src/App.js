import { useMemo, useState } from "react";
import "@/App.css";
import { Menu } from "lucide-react";
import { parseInstagramData } from "@/lib/instagramParser";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatPane } from "@/components/chat/ChatPane";
import { embeddedInstagramFiles } from "@/data/embeddedInstagramFiles";

const USER_NAME = "Aditya";

function App() {
  const conversations = useMemo(
    () => parseInstagramData(embeddedInstagramFiles, USER_NAME),
    [],
  );

  const [selectedConversationId, setSelectedConversationId] = useState(
    conversations[0]?.id ?? null,
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeConversation =
    conversations.find((item) => item.id === selectedConversationId) ??
    conversations[0] ??
    null;

  return (
    <main
      className="min-h-screen w-full overflow-hidden bg-[#000000] text-[#FAFAFA]"
      data-testid="instagram-chat-app"
    >
      <div className="mx-auto flex h-screen w-full max-w-[1600px]">
        <aside className="hidden h-full w-[360px] shrink-0 border-r border-[#262626] md:block lg:w-[400px]">
          <ConversationSidebar
            conversations={conversations}
            selectedConversationId={activeConversation?.id}
            onSelectConversation={setSelectedConversationId}
            currentUser={USER_NAME}
          />
        </aside>

        {isMobileSidebarOpen ? (
          <aside
            className="absolute inset-0 z-20 h-screen w-full bg-[#000000] md:hidden"
            data-testid="mobile-sidebar-overlay"
          >
            <ConversationSidebar
              conversations={conversations}
              selectedConversationId={activeConversation?.id}
              onSelectConversation={(id) => {
                setSelectedConversationId(id);
                setIsMobileSidebarOpen(false);
              }}
              currentUser={USER_NAME}
            />
          </aside>
        ) : null}

        <section className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex h-[60px] items-center border-b border-[#262626] px-4 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-full border border-[#363636] p-2 transition-colors duration-200 hover:bg-[#121212]"
              data-testid="mobile-open-sidebar-button"
            >
              <Menu size={18} />
            </button>
            <p
              className="ml-3 text-sm font-medium"
              data-testid="mobile-active-conversation-name"
            >
              {activeConversation?.title ?? "No Conversation"}
            </p>
          </div>

          <ChatPane
            conversation={activeConversation}
            currentUser={USER_NAME}
            hasConversations={conversations.length > 0}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
