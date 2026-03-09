import { useMemo, useState } from "react";
import "@/App.css";
import { parseInstagramData } from "@/lib/instagramParser";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatPane } from "@/components/chat/ChatPane";
import { embeddedInstagramFiles } from "@/data/embeddedInstagramFiles";

const USER_NAME = "Chikki";

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
      className="min-h-screen w-full overflow-hidden bg-[#060B5B] text-[#FAFAFA]"
      data-testid="instagram-chat-app"
    >
      <div className="mx-auto flex h-screen w-full max-w-[1600px]">
        <aside className="hidden h-full w-[360px] shrink-0 border-r border-[#2b1f5e] bg-[#0B0F67]/90 backdrop-blur-sm md:block lg:w-[400px]">
          <ConversationSidebar
            conversations={conversations}
            selectedConversationId={activeConversation?.id}
            onSelectConversation={setSelectedConversationId}
            currentUser={USER_NAME}
            testIdPrefix="desktop"
            showCloseButton={false}
          />
        </aside>

        {isMobileSidebarOpen ? (
          <aside
            className="absolute inset-0 z-20 h-screen w-full bg-[#0B0F67] md:hidden"
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
              testIdPrefix="mobile"
              showCloseButton
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </aside>
        ) : null}

        <section className="relative flex min-w-0 flex-1 flex-col">
          <ChatPane
            conversation={activeConversation}
            currentUser={USER_NAME}
            hasConversations={conversations.length > 0}
            onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
