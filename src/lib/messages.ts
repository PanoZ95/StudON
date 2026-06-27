import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
}

/**
 * Φορτώνει όλες τις συνομιλίες του τρέχοντος χρήστη, μαζί με
 * τα βασικά στοιχεία του άλλου συμμετέχοντα και το τελευταίο μήνυμα.
 */
export async function fetchConversations(currentUserId: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, user_a, user_b,
      user_a_profile:profiles!conversations_user_a_fkey ( id, username, avatar_url ),
      user_b_profile:profiles!conversations_user_b_fkey ( id, username, avatar_url ),
      messages ( text, created_at )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης συνομιλιών: ' + error.message);

  return (data ?? []).map((row: any) => {
    const isUserA = row.user_a === currentUserId;
    const otherProfile = isUserA ? row.user_b_profile : row.user_a_profile;
    const msgs = (row.messages ?? []) as { text: string; created_at: string }[];
    const lastMsg = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    return {
      id: row.id,
      otherUserId: otherProfile?.id ?? (isUserA ? row.user_b : row.user_a),
      otherUsername: otherProfile?.username ?? 'Άγνωστος χρήστης',
      otherAvatarUrl: otherProfile?.avatar_url ?? null,
      lastMessageText: lastMsg?.text ?? null,
      lastMessageAt: lastMsg?.created_at ?? null,
    };
  });
}

/**
 * Βρίσκει υπάρχουσα συνομιλία ανάμεσα σε δύο χρήστες, ή τη δημιουργεί αν δεν υπάρχει.
 * Επιστρέφει το conversation id.
 */
export async function getOrCreateConversation(userId: string, otherUserId: string): Promise<string> {
  const [userA, userB] = [userId, otherUserId].sort();

  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_a', userA)
    .eq('user_b', userB)
    .maybeSingle();

  if (fetchError) throw new Error('Αποτυχία αναζήτησης συνομιλίας: ' + fetchError.message);
  if (existing) return existing.id;

  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({ user_a: userA, user_b: userB })
    .select('id')
    .single();

  if (createError) throw new Error('Αποτυχία δημιουργίας συνομιλίας: ' + createError.message);
  return created.id;
}

/** Φορτώνει όλα τα μηνύματα μιας συνομιλίας, σε χρονολογική σειρά. */
export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, text, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error('Αποτυχία φόρτωσης μηνυμάτων: ' + error.message);

  return (data ?? []).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.text,
    createdAt: m.created_at,
  }));
}

/** Στέλνει ένα νέο μήνυμα σε μια συνομιλία. */
export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, text });

  if (error) throw new Error('Αποτυχία αποστολής μηνύματος: ' + error.message);
}

/**
 * "Ακούει" για καινούργια μηνύματα σε μια συνομιλία σε πραγματικό χρόνο.
 * Επιστρέφει συνάρτηση αποσύνδεσης (unsubscribe) για χρήση σε useEffect cleanup.
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: ChatMessage) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload: any) => {
        onNewMessage({
          id: payload.new.id,
          senderId: payload.new.sender_id,
          text: payload.new.text,
          createdAt: payload.new.created_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
