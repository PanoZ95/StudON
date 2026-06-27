import { supabase } from './supabase';

export interface ProfileData {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  postsCount: number;
}

/** Φορτώνει το προφίλ ενός χρήστη, μαζί με το πλήθος των αναρτήσεών του. */
export async function fetchProfile(userId: string): Promise<ProfileData> {
  const [{ data: profile, error: profileError }, { count, error: countError }] = await Promise.all([
    supabase.from('profiles').select('id, username, avatar_url, bio').eq('id', userId).single(),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  if (profileError) throw new Error('Αποτυχία φόρτωσης προφίλ: ' + profileError.message);
  if (countError) throw new Error('Αποτυχία μέτρησης αναρτήσεων: ' + countError.message);

  return {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    bio: profile.bio ?? '',
    postsCount: count ?? 0,
  };
}

interface UpdateProfileInput {
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
}

/** Ενημερώνει το προφίλ ενός χρήστη. */
export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      username: input.username,
      bio: input.bio,
      avatar_url: input.avatarUrl,
    })
    .eq('id', input.userId);

  if (error) {
    if (error.message.includes('duplicate key')) {
      throw new Error('Αυτό το όνομα χρήστη χρησιμοποιείται ήδη.');
    }
    throw new Error('Αποτυχία ενημέρωσης προφίλ: ' + error.message);
  }
}

export interface UserPostThumbnail {
  id: string;
  imageUrl: string;
}

/** Φορτώνει τις αναρτήσεις ενός χρήστη, μόνο όσα χρειάζεται για ένα grid μικρογραφιών. */
export async function fetchUserPostThumbnails(userId: string): Promise<UserPostThumbnail[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content_image_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης αναρτήσεων: ' + error.message);

  return (data ?? [])
    .filter((p) => !!p.content_image_url)
    .map((p) => ({ id: p.id, imageUrl: p.content_image_url as string }));
}
