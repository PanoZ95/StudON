import { supabase } from './supabase';

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'meet' | 'message' | 'system';
  title: string;
  message: string;
  timeAgo: string;
  isUnread: boolean;
  actorAvatar: string | null;
  relatedPostId: string | null;
  relatedMeetId: string | null;
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return 'Τώρα';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} λ`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ώ`;
  const days = Math.floor(hours / 24);
  return `${days} μ`;
}

/** Φορτώνει όλες τις ειδοποιήσεις του τρέχοντος χρήστη, πιο πρόσφατες πρώτα. */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id, type, title, message, is_unread, created_at, related_post_id, related_meet_id,
      profiles!notifications_actor_id_fkey ( avatar_url )
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error('Αποτυχία φόρτωσης ειδοποιήσεων: ' + error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    timeAgo: timeAgo(row.created_at),
    isUnread: row.is_unread,
    actorAvatar: row.profiles?.avatar_url ?? null,
    relatedPostId: row.related_post_id,
    relatedMeetId: row.related_meet_id,
  }));
}

/** Σημειώνει μία ειδοποίηση ως αναγνωσμένη. */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_unread: false }).eq('id', notificationId);
  if (error) throw new Error('Αποτυχία ενημέρωσης: ' + error.message);
}

/** Σημειώνει όλες τις ειδοποιήσεις ενός χρήστη ως αναγνωσμένες. */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_unread: false }).eq('recipient_id', userId);
  if (error) throw new Error('Αποτυχία ενημέρωσης: ' + error.message);
}

/** Σβήνει μία ειδοποίηση. */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
  if (error) throw new Error('Αποτυχία διαγραφής: ' + error.message);
}

/**
 * "Ακούει" για καινούργιες ειδοποιήσεις σε πραγματικό χρόνο.
 * Επιστρέφει συνάρτηση αποσύνδεσης για useEffect cleanup.
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: () => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
      () => onNewNotification()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
