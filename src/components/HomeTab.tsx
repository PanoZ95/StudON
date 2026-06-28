import React, { useState, useEffect, FormEvent } from 'react';
import { Post, Comment } from '../types';
import { Heart, Flame, MessageSquare, Share2, MoreVertical, Search, MessageCircle, X, Send, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchPosts,
  createPost,
  likePost,
  unlikePost,
  firePost,
  unfirePost,
  addComment,
  searchPostsAndUsers,
  UserSearchResult,
} from '../lib/posts';
import ImageUploader from './ImageUploader';

interface HomeTabProps {
  userId: string;
  currentUsername: string;
  currentAvatar: string;
}

export default function HomeTab({ userId, currentUsername, currentAvatar }: HomeTabProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('Όλα');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [searchUsers, setSearchUsers] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const categories = ['Όλα', 'Αυτοκίνητα', 'Αεροπλάνα', 'Μοτοσυκλέτες', 'Πλοία', 'Μαχητικά'];

  useEffect(() => {
    loadPosts();
  }, []);

  // Πραγματική αναζήτηση στη βάση δεδομένων, με μικρή καθυστέρηση (debounce)
  // ώστε να μη στέλνουμε ένα query σε κάθε πληκτρολόγηση.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setSearchUsers([]);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const { posts: foundPosts, users: foundUsers } = await searchPostsAndUsers(trimmed, userId);
        setSearchResults(foundPosts);
        setSearchUsers(foundUsers);
      } catch {
        setSearchResults([]);
        setSearchUsers([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, userId]);

  async function loadPosts() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchPosts(userId);
      setPosts(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const wasLiked = !!post.hasLiked;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: !wasLiked, likes: wasLiked ? p.likes - 1 : p.likes + 1 } : p
      )
    );

    try {
      if (wasLiked) await unlikePost(postId, userId);
      else await likePost(postId, userId);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, hasLiked: wasLiked, likes: wasLiked ? p.likes + 1 : p.likes - 1 } : p
        )
      );
    }
  };

  const handleFire = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const wasFired = !!post.hasFired;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, hasFired: !wasFired, fireCount: wasFired ? p.fireCount - 1 : p.fireCount + 1 }
          : p
      )
    );

    try {
      if (wasFired) await unfirePost(postId, userId);
      else await firePost(postId, userId);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, hasFired: wasFired, fireCount: wasFired ? p.fireCount + 1 : p.fireCount - 1 }
            : p
        )
      );
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text || !activeCommentPost) return;

    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      username: currentUsername,
      avatar: currentAvatar,
      timeAgo: 'Τώρα',
      text,
    };

    const postId = activeCommentPost.id;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentsCount: p.commentsCount + 1, commentsList: [...p.commentsList, tempComment] }
          : p
      )
    );
    setActiveCommentPost((prev) =>
      prev ? { ...prev, commentsCount: prev.commentsCount + 1, commentsList: [...prev.commentsList, tempComment] } : null
    );
    setNewCommentText('');

    try {
      await addComment(postId, userId, text);
      loadPosts();
    } catch {
      // Σε περίπτωση αποτυχίας, αφήνουμε το optimistic comment ορατό προσωρινά
    }
  };

  const handleCreatePost = async (category: string, text: string, imageUrl: string, isVideo: boolean) => {
    await createPost({
      userId,
      category,
      contentText: text,
      contentImageUrl: imageUrl,
      isVideo,
    });
    setShowNewPostForm(false);
    loadPosts();
  };

  // Όταν υπάρχει ενεργή αναζήτηση, δείχνουμε τα πραγματικά αποτελέσματα από τη βάση.
  // Διαφορετικά, δείχνουμε το κανονικό feed φιλτραρισμένο κατά κατηγορία.
  const isSearching = searchQuery.trim().length > 0;
  const filteredPosts = isSearching
    ? searchResults ?? []
    : posts.filter((post) => selectedCategory === 'Όλα' || post.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              type="text"
              placeholder="Αναζήτηση στην ροή ή αναζήτηση χρηστών..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-3 pl-12 pr-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 rounded-xl font-medium text-sm shrink-0 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Νέα ανάρτηση</span>
          </button>
        </div>

        {!isSearching && (
          <div className="overflow-x-auto scrollbar-hide py-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isSearching && searching && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Αναζήτηση...
          </div>
        )}
      </div>

      {/* Αποτελέσματα αναζήτησης: χρήστες */}
      {isSearching && searchUsers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Χρήστες</h4>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {searchUsers.map((u) => (
              <div
                key={u.id}
                className="flex flex-col items-center gap-1.5 shrink-0 bg-surface-container/40 border border-outline-variant/20 rounded-xl px-4 py-3 min-w-[88px]"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-primary-container/30">
                  {u.avatarUrl && <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
                <span className="text-xs text-on-surface text-center truncate w-full">{u.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary-container animate-spin" />
        </div>
      )}

      {!loading && loadError && (
        <div className="text-center py-12 bg-red-950/20 border border-red-900/30 rounded-xl">
          <p className="text-red-400 text-sm mb-3">{loadError}</p>
          <button onClick={loadPosts} className="text-sm text-primary-container underline">
            Δοκίμασε ξανά
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#12141C] border border-outline-variant/20 rounded-xl overflow-hidden shadow-lg hover:shadow-[0_4px_20px_rgba(0,240,255,0.05)] transition-all duration-300"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-primary-container/30 bg-surface-container-high">
                      {post.avatar && (
                        <img src={post.avatar} alt={post.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-on-surface hover:text-primary-container transition-colors cursor-pointer">{post.username}</h4>
                      <span className="text-xs text-on-surface-variant">{post.timeAgo}</span>
                    </div>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary-fixed transition-colors p-1.5 rounded-full hover:bg-white/5">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {post.contentImage && (
                  <div className="relative w-full aspect-[4/5] sm:aspect-video md:aspect-[4/5] bg-surface-container-lowest overflow-hidden">
                    {post.isVideo ? (
                      <video
                        src={post.contentImage}
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    ) : (
                      <img
                        src={post.contentImage}
                        alt="Post content"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {post.engineTag && (
                      <div className="absolute bottom-4 right-4 bg-surface-container/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        <span className="text-xs font-semibold text-primary-fixed-dim tracking-wider font-mono uppercase">
                          {post.engineTag}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                          post.hasLiked ? 'text-secondary-container' : 'text-on-surface-variant hover:text-secondary-container'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current text-secondary-container' : ''}`} />
                        <span className="font-mono">{post.likes.toLocaleString()}</span>
                      </button>

                      <button
                        onClick={() => handleFire(post.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                          post.hasFired ? 'text-orange-500' : 'text-on-surface-variant hover:text-orange-500'
                        }`}
                      >
                        <Flame className={`w-5 h-5 ${post.hasFired ? 'fill-current text-orange-500' : ''}`} />
                        <span className="font-mono">{post.fireCount}</span>
                      </button>

                      <button
                        onClick={() => setActiveCommentPost(post)}
                        className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-mono">{post.commentsList.length}</span>
                      </button>
                    </div>

                    <button className="text-on-surface-variant hover:text-primary-container transition-colors p-1 rounded-full hover:bg-white/5">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {post.contentText && (
                    <p className="text-sm leading-relaxed text-on-surface">
                      <span className="font-semibold mr-2 text-on-surface">{post.username}</span>
                      {post.contentText}
                    </p>
                  )}
                </div>
              </motion.article>
            ))
          ) : (
            <div className="text-center py-12 bg-surface-container/30 rounded-xl border border-outline-variant/10">
              <MessageCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
              <p className="text-on-surface-variant">
                {isSearching
                  ? 'Δεν βρέθηκαν αναρτήσεις ή χρήστες που να ταιριάζουν με την αναζήτηση.'
                  : 'Δεν βρέθηκαν αναρτήσεις για αυτή την κατηγορία.'}
              </p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showNewPostForm && (
          <NewPostModal
            categories={categories.filter((c) => c !== 'Όλα')}
            onClose={() => setShowNewPostForm(false)}
            onSubmit={handleCreatePost}
            userId={userId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-55 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#12141C] border border-outline-variant/30 rounded-t-2xl w-full max-w-xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-primary-fixed-dim">Σχόλια</h3>
                  <span className="text-xs text-on-surface-variant">Σχετικά με την ανάρτηση του/της {activeCommentPost.username}</span>
                </div>
                <button
                  onClick={() => setActiveCommentPost(null)}
                  className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeCommentPost.commentsList.length > 0 ? (
                  activeCommentPost.commentsList.map((comm) => (
                    <div key={comm.id} className="flex gap-3 items-start border-b border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                        {comm.avatar && (
                          <img src={comm.avatar} alt={comm.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-primary-fixed-dim">{comm.username}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono">{comm.timeAgo}</span>
                        </div>
                        <p className="text-sm text-on-surface">{comm.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-on-surface-variant">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-outline/40" />
                    <p className="text-sm">Δεν υπάρχουν ακόμη σχόλια. Γίνετε ο πρώτος που θα σχολιάσει!</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Γράψτε ένα σχόλιο..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-surface-container text-on-surface py-2.5 px-4 rounded-xl border border-outline-variant/20 focus:outline-none focus:border-primary-container text-sm"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-primary-container text-on-primary-container p-2.5 rounded-xl disabled:opacity-40 transition-opacity hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NewPostModalProps {
  categories: string[];
  userId: string;
  onClose: () => void;
  onSubmit: (category: string, text: string, imageUrl: string, isVideo: boolean) => Promise<void>;
}

function NewPostModal({ categories, userId, onClose, onSubmit }: NewPostModalProps) {
  const [category, setCategory] = useState(categories[0] ?? '');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setErrorMsg('Ανέβασε πρώτα μια εικόνα ή βίντεο για την ανάρτηση.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(category, text.trim(), imageUrl, isVideo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Κάτι πήγε στραβά.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Νέα ανάρτηση</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Κατηγορία</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Εικόνα ή βίντεο</label>
            <ImageUploader userId={userId} onUploaded={(url, video) => { setImageUrl(url); setIsVideo(video); }} />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Περιγραφή</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Τι θέλεις να μοιραστείς;"
              rows={3}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !imageUrl}
            className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Δημοσίευση
          </button>
        </form>
      </motion.div>
    </div>
  );
}
