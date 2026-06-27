import React, { useState, useEffect, FormEvent } from 'react';
import { Search, Heart, X, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchDiscoveries, createDiscovery, likeDiscovery, unlikeDiscovery } from '../lib/discoveries';
import ImageUploader from './ImageUploader';

interface ExploreTabProps {
  userId: string;
}

type DiscoveryItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  likesCount: number;
  tag?: string;
  hasLiked: boolean;
  authorUsername: string;
};

const CATEGORIES = ['Αυτοκίνητα', 'Αεροπλάνα', 'Μοτοσυκλέτες', 'Πλοία', 'Μαχητικά', 'Μηχανολογία', 'Φυσική της Κίνησης'];

export default function ExploreTab({ userId }: ExploreTabProps) {
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscovery, setSelectedDiscovery] = useState<DiscoveryItem | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchDiscoveries(userId);
      setDiscoveries(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (id: string) => {
    const disc = discoveries.find((d) => d.id === id);
    if (!disc) return;
    const wasLiked = disc.hasLiked;

    const updater = (prev: DiscoveryItem[]) =>
      prev.map((d) => (d.id === id ? { ...d, hasLiked: !wasLiked, likesCount: wasLiked ? d.likesCount - 1 : d.likesCount + 1 } : d));

    setDiscoveries(updater);
    setSelectedDiscovery((prev) => (prev && prev.id === id ? { ...prev, hasLiked: !wasLiked, likesCount: wasLiked ? prev.likesCount - 1 : prev.likesCount + 1 } : prev));

    try {
      if (wasLiked) await unlikeDiscovery(id, userId);
      else await likeDiscovery(id, userId);
    } catch {
      setDiscoveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, hasLiked: wasLiked, likesCount: wasLiked ? d.likesCount + 1 : d.likesCount - 1 } : d))
      );
    }
  };

  const handleCreate = async (category: string, title: string, description: string, imageUrl: string, tag: string) => {
    await createDiscovery({ userId, category, title, description, imageUrl, tag: tag || undefined });
    setShowNewForm(false);
    load();
  };

  const filtered = discoveries.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Αναζήτηση θεμάτων, τεχνολογιών..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container text-on-surface py-3 pl-12 pr-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 rounded-xl font-medium text-sm shrink-0 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Νέα ανακάλυψη</span>
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
          <button onClick={load} className="text-sm text-primary-container underline">Δοκίμασε ξανά</button>
        </div>
      )}

      {!loading && !loadError && (
        <section className="space-y-4">
          <h3 className="font-display font-bold text-xl text-on-surface">Ανακαλύψεις της κοινότητας</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {filtered.map((d, index) => {
              const isHero = index === 0;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDiscovery(d)}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer border border-outline-variant/20 shadow-xl ${
                    isHero ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                >
                  <img
                    alt={d.title}
                    src={d.image}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e16] via-[#0a0e16]/40 to-transparent"></div>
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <span className="bg-primary-container text-on-primary-container font-semibold text-[10px] px-3 py-1 rounded-full w-max mb-2 uppercase tracking-wider font-mono">
                      {d.category}
                    </span>
                    <h4 className="font-display font-bold text-lg text-on-surface mb-1 leading-tight group-hover:text-primary-fixed-dim transition-colors line-clamp-2">
                      {d.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-3">{d.authorUsername}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(d.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs w-max bg-black/40 backdrop-blur-sm py-1.5 px-3 rounded-full border border-white/10 ${
                        d.hasLiked ? 'text-secondary-container' : 'text-on-surface-variant hover:text-secondary-container'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${d.hasLiked ? 'fill-current' : ''}`} />
                      <span className="font-mono">{d.likesCount}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 bg-surface-container/30 rounded-xl border border-outline-variant/10">
              <AlertCircle className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
              <p className="text-on-surface-variant">Δεν βρέθηκε περιεχόμενο που να ταιριάζει.</p>
            </div>
          )}
        </section>
      )}

      <AnimatePresence>
        {showNewForm && <NewDiscoveryModal userId={userId} onClose={() => setShowNewForm(false)} onSubmit={handleCreate} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDiscovery && (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="h-64 relative shrink-0">
                <img src={selectedDiscovery.image} alt={selectedDiscovery.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] to-transparent"></div>
                <button
                  onClick={() => setSelectedDiscovery(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/95 text-white p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-primary-container text-on-primary-container font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    {selectedDiscovery.category}
                  </span>
                </div>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <h3 className="font-display font-bold text-2xl text-primary-fixed-dim leading-snug">{selectedDiscovery.title}</h3>
                <p className="text-xs text-on-surface-variant">από {selectedDiscovery.authorUsername}</p>
                <div className="text-on-surface leading-relaxed text-sm">
                  <p>{selectedDiscovery.description}</p>
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 flex gap-2 justify-end">
                <button
                  onClick={() => handleLike(selectedDiscovery.id)}
                  className="px-5 py-2 bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-on-surface font-semibold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Heart className={`w-4 h-4 text-secondary-container ${selectedDiscovery.hasLiked ? 'fill-current' : ''}`} />
                  Like ({selectedDiscovery.likesCount})
                </button>
                <button
                  onClick={() => setSelectedDiscovery(null)}
                  className="px-6 py-2 bg-primary-container text-on-primary-container font-semibold text-xs rounded-full hover:shadow-[0_0_10px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  Κλείσιμο
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NewDiscoveryModalProps {
  userId: string;
  onClose: () => void;
  onSubmit: (category: string, title: string, description: string, imageUrl: string, tag: string) => Promise<void>;
}

function NewDiscoveryModal({ userId, onClose, onSubmit }: NewDiscoveryModalProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setErrorMsg('Ανέβασε πρώτα μια εικόνα εξωφύλλου.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Συμπλήρωσε τίτλο και περιγραφή.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmit(category, title.trim(), description.trim(), imageUrl, tag.trim());
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
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Νέα ανακάλυψη</h3>
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Εικόνα εξωφύλλου</label>
            <ImageUploader userId={userId} onUploaded={setImageUrl} />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Τίτλος</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="π.χ. Πώς λειτουργούν τα turbofan κινητήρες"
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Περιγραφή / Ανάλυση</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Εξήγησε τη φυσική, τη μηχανική, ή τη λεπτομέρεια πίσω από αυτό..."
              rows={4}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Tag (προαιρετικό)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="π.χ. #Aerodynamics"
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>}

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
