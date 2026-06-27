import { supabase } from './supabase';
import { Discovery } from '../types';

function mapRowToDiscovery(row: any, currentUserId: string): Discovery & { hasLiked: boolean; authorUsername: string } {
  const likesArray: any[] = row.discovery_likes ?? [];
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    image: row.image_url,
    tag: row.tag ?? undefined,
    likesCount: likesArray.length,
    hasLiked: likesArray.some((l) => l.user_id === currentUserId),
    authorUsername: row.profiles?.username ?? 'Άγνωστος χρήστης',
  };
}

export async function fetchDiscoveries(currentUserId: string) {
  const { data, error } = await supabase
    .from('discoveries')
    .select(`
      id, category, title, description, image_url, tag, created_at,
      profiles!discoveries_user_id_fkey ( username ),
      discovery_likes ( user_id )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης ανακαλύψεων: ' + error.message);
  return (data ?? []).map((row) => mapRowToDiscovery(row, currentUserId));
}

interface NewDiscoveryInput {
  userId: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: string;
}

export async function createDiscovery(input: NewDiscoveryInput): Promise<void> {
  const { error } = await supabase.from('discoveries').insert({
    user_id: input.userId,
    category: input.category,
    title: input.title,
    description: input.description,
    image_url: input.imageUrl,
    tag: input.tag ?? null,
  });
  if (error) throw new Error('Αποτυχία δημιουργίας ανακάλυψης: ' + error.message);
}

export async function likeDiscovery(discoveryId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('discovery_likes').insert({ discovery_id: discoveryId, user_id: userId });
  if (error) throw new Error('Αποτυχία like: ' + error.message);
}

export async function unlikeDiscovery(discoveryId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('discovery_likes')
    .delete()
    .eq('discovery_id', discoveryId)
    .eq('user_id', userId);
  if (error) throw new Error('Αποτυχία αφαίρεσης like: ' + error.message);
}
