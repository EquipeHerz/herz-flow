import { useState, useEffect } from "react";
import { ChatSession, chatService } from "@/services/chatService";
import { FloatingChatWindow } from "./FloatingChatWindow";
import { Button } from "@/components/ui/button";
import { User, MessageSquare } from "lucide-react";

export const AdminChatManager = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChats, setActiveChats] = useState<string[]>([]); // Sessions currently open as windows
  const [minimizedChats, setMinimizedChats] = useState<string[]>([]); // Sessions minimized to dock

  useEffect(() => {
    // Initial load
    setSessions(chatService.getSessions());

    // Subscribe to changes
    const unsubscribe = chatService.subscribe((newSessions) => {
      setSessions(newSessions);
      
      // Check for new 'waiting_human' sessions that aren't tracked yet
      newSessions.forEach(session => {
        if (session.status === 'waiting_human' && !activeChats.includes(session.id) && !minimizedChats.includes(session.id)) {
          // New chat request! Auto-open if < 3 active windows
          if (activeChats.length < 3) {
            setActiveChats(prev => [...prev, session.id]);
            // Also accept it automatically for demo purposes, or wait for agent action?
            // Let's auto-accept for now to show the chat window immediately active
            chatService.acceptChat(session.id);
          } else {
            // Minimize if too many windows
            setMinimizedChats(prev => [...prev, session.id]);
          }
        }
      });
    });

    return unsubscribe;
  }, [activeChats, minimizedChats]);

  const handleClose = (sessionId: string) => {
    setActiveChats(prev => prev.filter(id => id !== sessionId));
    setMinimizedChats(prev => prev.filter(id => id !== sessionId));
  };

  const handleMinimize = (sessionId: string) => {
    setActiveChats(prev => prev.filter(id => id !== sessionId));
    if (!minimizedChats.includes(sessionId)) {
      setMinimizedChats(prev => [...prev, sessionId]);
    }
  };

  const handleRestore = (sessionId: string) => {
    setMinimizedChats(prev => prev.filter(id => id !== sessionId));
    if (!activeChats.includes(sessionId)) {
      setActiveChats(prev => [...prev, sessionId]);
    }
  };

  // Only render if there are active or minimized chats
  if (activeChats.length === 0 && minimizedChats.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {/* Active Windows */}
      {activeChats.map((sessionId, index) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return null;
        
        // Calculate position based on index (simple stacking)
        // In a real app, this would be more sophisticated
        const rightOffset = 20 + (index * 340); // 320px width + 20px gap
        
        return (
          <div key={sessionId} className="pointer-events-auto">
            <FloatingChatWindow 
              session={session}
              onClose={() => handleClose(sessionId)}
              onMinimize={() => handleMinimize(sessionId)}
              position={{ x: window.innerWidth - rightOffset - 320, y: window.innerHeight - 400 }}
            />
          </div>
        );
      })}

      {/* Dock for Minimized Chats */}
      {minimizedChats.length > 0 && (
        <div className="fixed bottom-0 right-0 p-2 flex gap-2 bg-background/80 backdrop-blur-sm border-t border-l border-border rounded-tl-lg pointer-events-auto">
          {minimizedChats.map(sessionId => {
            const session = sessions.find(s => s.id === sessionId);
            if (!session) return null;
            
            return (
              <Button
                key={sessionId}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white hover:bg-accent"
                onClick={() => handleRestore(sessionId)}
              >
                <User className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{session.userName || `User ${sessionId.substr(0,4)}`}</span>
                {session.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1 rounded-full">{session.unreadCount}</span>
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
