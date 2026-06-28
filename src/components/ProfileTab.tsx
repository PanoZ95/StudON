import React, { useState, useEffect, FormEvent } from 'react';
import { Settings, Edit3, X, Loader2, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchProfile, updateProfile, fetchUserPostThumbnails, ProfileData, UserPostThumbnail } from '../lib/profile';
import { supabase } from '../lib/supabase';
import ImageUploader from './ImageUploader';

interface ProfileTabProps {
  userId: string;
  onProfileUpdated?: (username: string, avatarUrl: string) => void;
}

export default function ProfileTab({ userId, onProfileUpdated }: ProfileTabProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [thumbnails, setThumbnails] = useState<UserPostThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const [profileData, thumbs] = await Promise.all([fetchProfile(userId), fetchUserPostThumbnails(userId)]);
      setProfile(profileData);
      setThumbnails(thumbs);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleProfileSaved = (updated: ProfileData) => {
    setProfile(updated);
    setEditModalOpen(false);
    onProfileUpdated?.(updated.username, updated.avatarUrl ?? '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-container animate-spin" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="text-center py-12 bg-red-950/20 border border-red-900/30 rounded-xl">
        <p className="text-red-400 text-sm mb-3">{loadError ?? 'Κάτι πήγε στραβά.'}</p>
        <button onClick={load} className="text-sm text-primary-container underline">Δοκίμασε ξανά</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-surface-container border-t border-outline-variant/30 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-md group-hover:bg-primary-container/40 transition-all duration-300"></div>
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)] relative z-10 bg-surface-container-high">
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <button
              onClick={() => setEditModalOpen(true)}
              className="absolute bottom-1 right-1 bg-secondary-container text-on-secondary-container p-2 rounded-full shadow-lg border border-surface-container z-20 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-2">
            <h2 className="font-display font-extrabold text-2xl text-primary-fixed-dim">{profile.username}</h2>
            <p className="text-sm text-on-surface-variant max-w-lg leading-relaxed">
              {profile.bio || 'Δεν έχει προστεθεί βιογραφικό ακόμα.'}
            </p>

            <div className="grid grid-cols-1 gap-4 mt-4 w-full max-w-xs border-t border-outline-variant/20 pt-4 font-sans">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-xl text-on-surface font-mono">{profile.postsCount}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Δημοσιεύσεις</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSettingsModalOpen(true)}
            className="absolute top-0 right-0 p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-display font-bold text-lg text-on-surface">Οι αναρτήσεις μου</h3>
        {thumbnails.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {thumbnails.map((t) => (
              <div key={t.id} className="aspect-square rounded-md overflow-hidden bg-surface-container-high border border-outline-variant/10">
                <img src={t.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-container/30 rounded-xl border border-outline-variant/10">
            <ImageIcon className="w-10 h-10 text-on-surface-variant mx-auto mb-2" />
            <p className="text-on-surface-variant text-sm">Δεν έχεις δημοσιεύσει ακόμα κάτι στο feed.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {editModalOpen && (
          <EditProfileModal
            userId={userId}
            profile={profile}
            onClose={() => setEditModalOpen(false)}
            onSaved={handleProfileSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
                <h3 className="font-display font-bold text-base text-primary-fixed-dim">Ρυθμίσεις StudON</h3>
                <button onClick={() => setSettingsModalOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <button
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                  className="w-full bg-red-950/30 border border-red-900/40 text-red-400 font-semibold text-xs py-2.5 rounded-full hover:bg-red-950/50 cursor-pointer"
                >
                  Αποσύνδεση
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface EditProfileModalProps {
  userId: string;
  profile: ProfileData;
  onClose: () => void;
  onSaved: (updated: ProfileData) => void;
}

function EditProfileModal({ userId, profile, onClose, onSaved }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Το όνομα χρήστη δεν μπορεί να είναι κενό.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await updateProfile({ userId, username: username.trim(), bio: bio.trim(), avatarUrl });
      onSaved({ ...profile, username: username.trim(), bio: bio.trim(), avatarUrl });
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
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Επεξεργασία προφίλ</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Φωτογραφία προφίλ</label>
            {avatarUrl && (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border border-outline-variant/30">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <ImageUploader userId={userId} onUploaded={(url) => setAvatarUrl(url)} />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Όνομα χρήστη</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Βιογραφικό</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Πες λίγα λόγια για σένα..."
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Αποθήκευση
          </button>
        </form>
      </motion.div>
    </div>
  );
}
