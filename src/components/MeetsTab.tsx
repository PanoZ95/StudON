import React, { useState, useEffect, FormEvent } from 'react';
import { MapPin, Calendar, ArrowUpRight, Plus, X, Globe, Compass, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMeets, createMeet, joinMeet, leaveMeet, getUserLocation, MeetItem } from '../lib/meets';
import { geocodeLocation, GeocodingResult } from '../lib/geocoding';
import ImageUploader from './ImageUploader';

interface MeetsTabProps {
  userId: string;
}

const CATEGORIES = ['Αυτοκίνητα', 'Αεροπλάνα', 'Μοτοσυκλέτες', 'Πλοία', 'Μαθηματικά'];

export default function MeetsTab({ userId }: MeetsTabProps) {
  const [scope, setScope] = useState<'nearby' | 'global'>('global');
  const [meets, setMeets] = useState<MeetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [organizeModalOpen, setOrganizeModalOpen] = useState(false);

  useEffect(() => {
    loadMeets(null);
  }, []);

  async function loadMeets(loc: { lat: number; lng: number } | null) {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMeets(userId, loc?.lat ?? null, loc?.lng ?? null);
      setMeets(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleScopeChange = async (newScope: 'nearby' | 'global') => {
    setScope(newScope);
    if (newScope === 'nearby' && !userLocation) {
      const loc = await getUserLocation();
      if (!loc) {
        setLocationDenied(true);
        setScope('global');
        return;
      }
      setUserLocation(loc);
      loadMeets(loc);
    } else if (newScope === 'global') {
      loadMeets(null);
    } else {
      loadMeets(userLocation);
    }
  };

  const handleJoin = async (meetId: string) => {
    const meet = meets.find((m) => m.id === meetId);
    if (!meet) return;
    const wasJoined = meet.hasJoined;

    setMeets((prev) =>
      prev.map((m) => (m.id === meetId ? { ...m, hasJoined: !wasJoined, attendeesCount: wasJoined ? m.attendeesCount - 1 : m.attendeesCount + 1 } : m))
    );

    try {
      if (wasJoined) await leaveMeet(meetId, userId);
      else await joinMeet(meetId, userId);
    } catch {
      setMeets((prev) =>
        prev.map((m) => (m.id === meetId ? { ...m, hasJoined: wasJoined, attendeesCount: wasJoined ? m.attendeesCount + 1 : m.attendeesCount - 1 } : m))
      );
    }
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/10 pb-6">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-primary-fixed tracking-tight">Συναντήσεις (Meets)</h2>
          <p className="text-sm text-on-surface-variant mt-1.5">Συνδεθείτε, ανταλλάξτε απόψεις και δημιουργήστε με άλλους μηχανικούς.</p>
        </div>

        <div className="glass-panel rounded-full p-1 flex items-center shrink-0">
          <button
            onClick={() => handleScopeChange('nearby')}
            className={`px-5 py-2 rounded-full font-semibold text-xs transition-all duration-300 cursor-pointer ${
              scope === 'nearby'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Compass className="w-3.5 h-3.5 inline mr-1.5" />
            Κοντά μου
          </button>
          <button
            onClick={() => handleScopeChange('global')}
            className={`px-5 py-2 rounded-full font-semibold text-xs transition-all duration-300 cursor-pointer ${
              scope === 'global'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />
            Όλα
          </button>
        </div>
      </div>

      {locationDenied && (
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 text-xs text-amber-400">
          Δεν δόθηκε πρόσβαση στην τοποθεσία σου. Ενεργοποίησε την τοποθεσία στον browser για να δεις τις πιο κοντινές συναντήσεις.
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
          <button onClick={() => loadMeets(userLocation)} className="text-sm text-primary-container underline">Δοκίμασε ξανά</button>
        </div>
      )}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meets.length === 0 ? (
            <p className="text-on-surface-variant text-sm py-6 text-center bg-surface-container/30 rounded-xl border border-outline-variant/10 md:col-span-2">
              Δεν υπάρχουν ακόμα συναντήσεις. Διοργάνωσε την πρώτη!
            </p>
          ) : (
            meets.map((meet) => (
              <div
                key={meet.id}
                className="glass-panel rounded-xl overflow-hidden group hover:border-primary-container/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300 flex flex-col border-t border-white/10"
              >
                <div className="h-44 relative bg-surface-container-lowest shrink-0 overflow-hidden">
                  {meet.imageUrl && (
                    <img src={meet.imageUrl} alt={meet.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] to-transparent"></div>
                  <span className="absolute top-4 left-4 bg-secondary-container/90 text-on-secondary-container font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-secondary-container/20">
                    {meet.category}
                  </span>
                  {meet.distanceKm !== null && (
                    <span className="absolute top-4 right-4 bg-black/60 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {meet.distanceKm < 1 ? '<1 χλμ' : `${meet.distanceKm.toFixed(0)} χλμ`}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col bg-[#12141C] justify-between">
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-lg text-primary-fixed-dim leading-snug group-hover:text-primary-fixed transition-colors">
                      {meet.title}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                        <Calendar className="w-4 h-4 text-primary-container" />
                        <span>{meet.date} • {meet.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant min-w-0">
                        <MapPin className="w-4 h-4 text-primary-container shrink-0" />
                        <span className="truncate">{meet.locationName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between items-center pt-4 border-t border-outline-variant/20">
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {meet.attendeesCount} συμμετέχουν
                    </span>
                    <button
                      onClick={() => handleJoin(meet.id)}
                      className={`px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                        meet.hasJoined
                          ? 'bg-primary-container text-on-primary-container border-primary-container'
                          : 'bg-primary-container/10 hover:bg-primary-container text-primary-fixed-dim hover:text-on-primary-container border-primary-container/30'
                      }`}
                    >
                      {meet.hasJoined ? 'Συμμετέχεις' : 'Συμμετοχή'} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={() => setOrganizeModalOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-40 bg-gradient-to-br from-primary-container to-blue-600 text-on-primary-container p-4 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group cursor-pointer"
      >
        <Plus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-semibold text-xs uppercase tracking-wider group-hover:ml-2">
          Διοργανωση Meet
        </span>
      </button>

      <AnimatePresence>
        {organizeModalOpen && (
          <OrganizeMeetModal
            userId={userId}
            onClose={() => setOrganizeModalOpen(false)}
            onCreated={() => {
              setOrganizeModalOpen(false);
              loadMeets(userLocation);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface OrganizeMeetModalProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

function OrganizeMeetModal({ userId, onClose, onCreated }: OrganizeMeetModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearchingLocation(true);
    setSelectedLocation(null);
    try {
      const results = await geocodeLocation(locationQuery);
      setLocationResults(results);
    } catch {
      setLocationResults([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !selectedLocation) {
      setErrorMsg('Συμπλήρωσε όλα τα πεδία και επίλεξε τοποθεσία από τα αποτελέσματα αναζήτησης.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createMeet({
        organizerId: userId,
        title,
        category,
        date,
        time,
        locationName: selectedLocation.displayName,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        imageUrl: imageUrl ?? undefined,
      });
      onCreated();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Κάτι πήγε στραβά.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/65 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container shrink-0">
          <h3 className="font-display font-bold text-lg text-primary-fixed-dim flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary-container" />
            Διοργάνωση Νέας Συνάντησης
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Τίτλος Συνάντησης</label>
            <input
              type="text"
              required
              placeholder="π.χ. Car meet Μαρούσι"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Κατηγορία</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Ημερομηνία</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Ώρα</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Τοποθεσία</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="π.χ. Μαρούσι, Αθήνα"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchLocation();
                  }
                }}
                className="flex-1 bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={searchingLocation}
                className="px-3 bg-surface-container-high border border-outline-variant/30 rounded-xl hover:bg-surface-variant/40"
              >
                {searchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {locationResults.length > 0 && (
              <div className="space-y-1 mt-2">
                {locationResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(r);
                      setLocationResults([]);
                      setLocationQuery(r.displayName);
                    }}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {r.displayName}
                  </button>
                ))}
              </div>
            )}

            {selectedLocation && (
              <p className="text-xs text-primary-container flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5" /> Επιλεγμένη τοποθεσία: {selectedLocation.displayName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Εικόνα (προαιρετικό)</label>
            <ImageUploader userId={userId} onUploaded={(url) => setImageUrl(url)} />
          </div>

          {errorMsg && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>}

          <div className="flex gap-2 justify-end pt-4 border-t border-outline-variant/10">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-transparent text-on-surface-variant hover:text-on-surface font-semibold text-xs rounded-full transition-colors cursor-pointer">
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#fe6b00] to-orange-500 text-white font-semibold text-xs rounded-full hover:shadow-[0_0_12px_rgba(254,107,0,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Δημιουργία
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
