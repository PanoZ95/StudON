import { supabase } from './supabase';
import { Post, Comment } from '../types';

// Μετατρέπει μία γραμμή από τη βάση δεδομένων (με τα joins της)
// στη μορφή Post που περιμένει ήδη το frontend σου.
function mapRowToPost(row: any, currentUserId: string): Post {
  const likesArray: any[] = row.post_likes ?? [];
  const firesArray: any[] = row.post_fires ?? [];
  const commentsArray: any[] = row.comments ?? [];

  const commentsList: Comment[] = commentsArray
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((c) => ({
      id: c.id,
      username: c.profiles?.username ?? 'Άγνωστος χρήστης',
      avatar: c.profiles?.avatar_url ?? '',
      timeAgo: timeAgo(c.created_at),
      text: c.text,
    }));

  return {
    id: row.id,
    username: row.profiles?.username ?? 'Άγνωστος χρήστης',
    avatar: row.profiles?.avatar_url ?? '',
    timeAgo: timeAgo(row.created_at),
    contentImage: row.content_image_url ?? '',
    isVideo: row.is_video ?? false,
    engineTag: row.engine_tag ?? undefined,
    likes: likesArray.length,
    fireCount: firesArray.length,
    commentsCount: commentsArray.length,
    contentText: row.content_text ?? '',
    category: row.category_id,
    hasLiked: likesArray.some((l) => l.user_id === currentUserId),
    hasFired: firesArray.some((f) => f.user_id === currentUserId),
    commentsList,
  };
}

// Μικρή βοηθητική συνάρτηση: μετατρέπει timestamp σε "πριν 5 λεπτά" κ.λπ.
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

/**
 * Φορτώνει τα posts από τη βάση δεδομένων, μαζί με τα likes/fires/comments τους,
 * έτοιμα στη μορφή που περιμένει το HomeTab.
 */
export async function fetchPosts(currentUserId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content_text, content_image_url, is_video, engine_tag, category_id, created_at,
      profiles!posts_user_id_fkey ( username, avatar_url ),
      post_likes ( user_id ),
      post_fires ( user_id ),
      comments ( id, text, created_at, profiles!comments_user_id_fkey ( username, avatar_url ) )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Αποτυχία φόρτωσης αναρτήσεων: ' + error.message);

  return (data ?? []).map((row) => mapRowToPost(row, currentUserId));
}

interface NewPostInput {
  userId: string;
  category: string;
  contentText: string;
  contentImageUrl: string;
  isVideo?: boolean;
  engineTag?: string;
}

/** Δημιουργεί μια καινούργια ανάρτηση στη βάση δεδομένων. */
export async function createPost(input: NewPostInput): Promise<void> {
  const { error } = await supabase.from('posts').insert({
    user_id: input.userId,
    category_id: input.category,
    content_text: input.contentText,
    content_image_url: input.contentImageUrl,
    is_video: input.isVideo ?? false,
    engine_tag: input.engineTag ?? null,
  });

  if (error) throw new Error('Αποτυχία δημιουργίας ανάρτησης: ' + error.message);
}

/** Προσθέτει like από τον τρέχοντα χρήστη σε ένα post. */
export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw new Error('Αποτυχία like: ' + error.message);
}

/** Αφαιρεί το like του τρέχοντος χρήστη από ένα post. */
export async function unlikePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  if (error) throw new Error('Αποτυχία αφαίρεσης like: ' + error.message);
}

/** Προσθέτει fire reaction από τον τρέχοντα χρήστη σε ένα post. */
export async function firePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_fires').insert({ post_id: postId, user_id: userId });
  if (error) throw new Error('Αποτυχία αντίδρασης: ' + error.message);
}

/** Αφαιρεί το fire reaction του τρέχοντος χρήστη από ένα post. */
export async function unfirePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_fires').delete().eq('post_id', postId).eq('user_id', userId);
  if (error) throw new Error('Αποτυχία αφαίρεσης αντίδρασης: ' + error.message);
}

/** Προσθέτει σχόλιο σε ένα post. */
export async function addComment(postId: string, userId: string, text: string): Promise<void> {
  const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, text });
  if (error) throw new Error('Αποτυχία προσθήκης σχολίου: ' + error.message);
}

export interface UserSearchResult {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Ψάχνει πραγματικά στη βάση δεδομένων για posts (κείμενο ή κατηγορία)
 * ΚΑΙ για χρήστες (username), παράλληλα.
 */
export async function searchPostsAndUsers(
  query: string,
  currentUserId: string
): Promise<{ posts: Post[]; users: UserSearchResult[] }> {
  const trimmed = query.trim();
  if (!trimmed) return { posts: [], users: [] };

  // Καθαρίζουμε την είσοδο του χρήστη από χαρακτήρες που έχουν ειδικό νόημα
  // στη σύνταξη φίλτρων του PostgREST (π.χ. ',' '(' ')' '%' '*'), ώστε κάποιος
  // να μην μπορεί να "σπάσει" το query και να αλλάξει το νόημά του.
  const safe = trimmed.replace(/[,()%*]/g, '');
  if (!safe) return { posts: [], users: [] };

  const [postsResult, usersResult] = await Promise.all([
    supabase
      .from('posts')
      .select(`
        id, content_text, content_image_url, is_video, engine_tag, category_id, created_at,
        profiles!posts_user_id_fkey ( username, avatar_url ),
        post_likes ( user_id ),
        post_fires ( user_id ),
        comments ( id, text, created_at, profiles!comments_user_id_fkey ( username, avatar_url ) )
      `)
      .or(`content_text.ilike.%${safe}%,category_id.ilike.%${safe}%`)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${safe}%`)
      .limit(10),
  ]);

  if (postsResult.error) throw new Error('Αποτυχία αναζήτησης αναρτήσεων: ' + postsResult.error.message);
  if (usersResult.error) throw new Error('Αποτυχία αναζήτησης χρηστών: ' + usersResult.error.message);

  const posts = (postsResult.data ?? []).map((row) => mapRowToPost(row, currentUserId));
  const users = (usersResult.data ?? []).map((u) => ({
    id: u.id,
    username: u.username,
    avatarUrl: u.avatar_url,
  }));

  return { posts, users };
}
