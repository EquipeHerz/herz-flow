import { Message } from "@/components/chat/ChatMessage";

export interface AuditLog {
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
}

// Types
export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  status: 'bot' | 'waiting_human' | 'human_active' | 'closed';
  messages: Message[];
  unreadCount: number;
  lastMessageAt: Date;
  requiresIntervention: boolean;
  interventionReason?: string;
  auditLogs: AuditLog[];
}

// Mock Database
let sessions: ChatSession[] = [];
const subscribers: ((sessions: ChatSession[]) => void)[] = [];

// Helper to notify subscribers
const notify = () => {
  subscribers.forEach(cb => cb([...sessions]));
};

export const chatService = {
  // Initialize a session
  startSession: (userId: string, userName: string): ChatSession => {
    let session = sessions.find(s => s.userId === userId && s.status !== 'closed');
    if (!session) {
      session = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        userName,
        status: 'bot',
        messages: [{
          id: '1',
          text: "Olá! Eu sou a Bruna, assistente virtual do Grupo Herz. Como posso ajudá-lo hoje?",
          isBot: true,
          timestamp: new Date(),
        }],
        unreadCount: 0,
        lastMessageAt: new Date(),
        requiresIntervention: false,
        auditLogs: [{
          timestamp: new Date(),
          action: 'SESSION_STARTED',
          actor: 'system',
          details: 'Nova sessão iniciada'
        }]
      };
      sessions.push(session);
      notify();
    }
    return session;
  },

  // Send a message
  sendMessage: (sessionId: string, text: string, isBot: boolean): Message => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) throw new Error("Session not found");

    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot, // true if bot or human agent, false if user
      timestamp: new Date()
    };

    session.messages.push(message);
    session.lastMessageAt = new Date();
    
    // If user sent it, and status is human_active, increment unread for admin
    if (!isBot && session.status === 'human_active') {
      session.unreadCount++;
    }

    notify();
    return message;
  },

  // Flag for intervention
  flagForIntervention: (sessionId: string, reason: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.requiresIntervention = true;
      session.interventionReason = reason;
      session.auditLogs.push({
        timestamp: new Date(),
        action: 'FLAGGED_FOR_INTERVENTION',
        actor: 'system',
        details: reason
      });
      notify();
    }
  },

  // Transfer to human
  requestHuman: (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'waiting_human';
      // Also flag it if not already flagged
      if (!session.requiresIntervention) {
        session.requiresIntervention = true;
        session.interventionReason = "Solicitação direta de humano";
      }
      session.auditLogs.push({
        timestamp: new Date(),
        action: 'HUMAN_REQUESTED',
        actor: 'user',
        details: 'Usuário solicitou atendimento humano'
      });
      notify();
    }
  },

  // Human accepts chat
  acceptChat: (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'human_active';
      session.unreadCount = 0;
      session.auditLogs.push({
        timestamp: new Date(),
        action: 'CHAT_ACCEPTED',
        actor: 'admin',
        details: 'Atendente assumiu a conversa'
      });
      notify();
    }
  },

  // Get all sessions (for admin)
  getSessions: () => [...sessions],

  // Subscribe to changes
  subscribe: (callback: (sessions: ChatSession[]) => void) => {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) subscribers.splice(index, 1);
    };
  }
};
