import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, Search, ArrowLeft, Loader2, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  subscribeToMessages,
  getOrCreateConversation,
  ConversationSummary,
  ChatMessage,
} from '../lib/messages';
import { searchPostsAndUsers, UserSearchResult } from '../lib/posts';

interface ChatsTabProps {
  userId: string;
}

export default function ChatsTab({ userId }: ChatsTabProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationSummary | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchConversations(userId);
      setConversations(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleStartConversation = async (otherUser: UserSearchResult) => {
    const conversationId = await getOrCreateConversation(userId, otherUser.id);
    const summary: ConversationSummary = {
      id: conversationId,
      otherUserId: otherUser.id,
      otherUsername: otherUser.username,
      otherAvatarUrl: otherUser.avatarUrl,
      lastMessageText: null,
      lastMessageAt: null,
    };
    setShowNewChat(false);
    setActiveConversation(summary);
    loadConversations();
  };

  if (activeConversation) {
    return (
      <ChatWindow
        userId={userId}
        conversation={activeConversation}
        onBack={() => {
          setActiveConversation(null);
          loadConversations();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-on-surface">Συνομιλίες</h2>
        <button
          onClick={() => setShowNewChat(true)}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-xl font-medium text-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
        >
          <Search className="w-4 h-4" />
          Νέα συνομιλία
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary-container animate-spin" />
        </div>
      )}

      {!loading && loadError && (
        <div className="text-center py-12 bg-red-950/20 border border-red-900/30 rounded-xl">
          <p className="text-red-400 text-sm mb-3">{loadError}</p>
          <button onClick={loadConversations} className="text-sm text-primary-container underline">
            Δοκίμασε ξανά
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="space-y-2">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#12141C] border border-outline-variant/20 hover:border-primary-container/30 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high shrink-0 border border-primary-container/20">
                  {conv.otherAvatarUrl && (
                    <img src={conv.otherAvatarUrl} alt={conv.otherUsername} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-on-surface truncate">{conv.otherUsername}</h4>
                  <p className="text-xs text-on-surface-variant truncate">
                    {conv.lastMessageText ?? 'Ξεκίνα τη συνομιλία...'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 bg-surface-container/30 rounded-xl border border-outline-variant/10">
              <MessageCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
              <p className="text-on-surface-variant">Δεν έχεις ακόμη συνομιλίες. Ξεκίνα μία!</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal onClose={() => setShowNewChat(false)} onSelectUser={handleStartConversation} userId={userId} />
        )}
      </AnimatePresence>
    </div>
  );
}

interface NewChatModalProps {
  userId: string;
  onClose: () => void;
  onSelectUser: (user: UserSearchResult) => void;
}

function NewChatModal({ userId, onClose, onSelectUser }: NewChatModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { users } = await searchPostsAndUsers(trimmed, userId);
        setResults(users.filter((u) => u.id !== userId));
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query, userId]);

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-md flex flex-col max-h-[70vh] shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Νέα συνομιλία</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-outline-variant/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              autoFocus
              placeholder="Αναζήτησε χρήστη..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 pl-9 pr-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {searching && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-primary-container animate-spin" />
            </div>
          )}
          {!searching &&
            results.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelectUser(u)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                  {u.avatarUrl && <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
                <span className="text-sm text-on-surface">{u.username}</span>
              </button>
            ))}
          {!searching && query.trim() && results.length === 0 && (
            <p className="text-center text-sm text-on-surface-variant py-6">Δεν βρέθηκαν χρήστες.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface ChatWindowProps {
  userId: string;
  conversation: ConversationSummary;
  onBack: () => void;
}

function ChatWindow({ userId, conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMessages(conversation.id).then((data) => {
      if (active) {
        setMessages(data);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToMessages(conversation.id, (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    setNewText('');
    try {
      await sendMessage(conversation.id, userId, text);
    } catch {
      setNewText(text);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-6rem)] bg-[#12141C] border border-outline-variant/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container-high shrink-0">
          {conversation.otherAvatarUrl && (
            <img src={conversation.otherAvatarUrl} alt={conversation.otherUsername} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          )}
        </div>
        <h3 className="font-semibold text-sm text-on-surface">{conversation.otherUsername}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-primary-container animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-on-surface-variant py-8">Στείλε το πρώτο μήνυμα!</p>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === userId;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-primary-container text-on-primary-container rounded-br-md'
                      : 'bg-surface-container-high text-on-surface rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-outline-variant/20 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Γράψε μήνυμα..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="flex-1 bg-surface-container text-on-surface py-2.5 px-4 rounded-xl border border-outline-variant/20 focus:outline-none focus:border-primary-container text-sm"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="bg-primary-container text-on-primary-container p-2.5 rounded-xl disabled:opacity-40 hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
