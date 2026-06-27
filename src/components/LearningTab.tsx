import React, { useState, useEffect, FormEvent } from 'react';
import { Search, GraduationCap, Clock, User, Calendar, BookOpen, X, PhoneCall, Plus, Loader2, ExternalLink, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchCourses,
  createCourse,
  fetchMyBookings,
  createBooking,
  cancelBooking,
  fetchWorkshops,
  createWorkshop,
  CourseItem,
  BookingItem,
  WorkshopItem,
} from '../lib/learning';
import ImageUploader from './ImageUploader';

interface LearningTabProps {
  userId: string;
  currentUsername: string;
}

const CATEGORIES = ['Φυσική της Κίνησης', 'Μηχανολογία', 'Μαθηματικά', 'Αεροδυναμική', 'Ηλεκτροκίνηση'];

const TIME_SLOTS = ['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30', '16:00 - 17:30', '18:00 - 19:30'];

export default function LearningTab({ userId, currentUsername }: LearningTabProps) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingCourseId, setBookingCourseId] = useState('');
  const [newCourseModalOpen, setNewCourseModalOpen] = useState(false);
  const [newWorkshopModalOpen, setNewWorkshopModalOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [c, b, w] = await Promise.all([fetchCourses(), fetchMyBookings(userId), fetchWorkshops()]);
      setCourses(c);
      setBookings(b);
      setWorkshops(w);
      if (c.length > 0) setBookingCourseId(c[0].id);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά κατά τη φόρτωση.');
    } finally {
      setLoading(false);
    }
  }

  const handleCancelBooking = async (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    try {
      await cancelBooking(id);
    } catch {
      loadAll();
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary-container animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-12 bg-red-950/20 border border-red-900/30 rounded-xl">
        <p className="text-red-400 text-sm mb-3">{loadError}</p>
        <button onClick={loadAll} className="text-sm text-primary-container underline">Δοκίμασε ξανά</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-primary-fixed">Κέντρο Μάθησης</h2>
          <button
            onClick={() => setNewCourseModalOpen(true)}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-xl font-medium text-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            Νέο μάθημα
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            placeholder="Αναζήτηση εκπαιδευτικού υλικού, μαθημάτων ή καθηγητών..."
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
      </div>

      <section className="space-y-4">
        <h3 className="font-display font-semibold text-lg text-on-surface">Κατηγορίες</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Όλα', ...CATEGORIES].map((cat) => {
            const isFilterActive = selectedCategory === cat || (cat === 'Όλα' && !selectedCategory);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'Όλα' ? null : cat)}
                className={`px-5 py-2 rounded-full font-medium text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isFilterActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {bookings.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-display font-semibold text-lg text-primary-fixed-dim">Οι Κρατήσεις Μου</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-surface-container/60 border border-primary-container/20 rounded-xl p-4 flex gap-3 items-start relative overflow-hidden shadow">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-container/5 blur-xl rounded-full"></div>
                <div className="p-2 bg-primary-container/10 text-primary-container rounded-lg shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-on-surface truncate">{booking.courseTitle}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <User className="w-3.5 h-3.5 shrink-0" /> {booking.instructorName}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono font-medium text-primary-fixed-dim">
                    <span className="bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1 border border-outline-variant/10">
                      <Calendar className="w-3 h-3" /> {booking.date}
                    </span>
                    <span className="bg-surface-container-high px-2 py-0.5 rounded flex items-center gap-1 border border-outline-variant/10">
                      <Clock className="w-3 h-3" /> {booking.timeSlot}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="p-1 rounded-full text-on-surface-variant hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="font-display font-semibold text-lg text-on-surface">Προτεινόμενα Μαθήματα</h3>
        {filteredCourses.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-6 text-center bg-surface-container/30 rounded-xl border border-outline-variant/10">
            Δεν υπάρχουν ακόμα μαθήματα. Γίνε ο πρώτος που θα δημοσιεύσει!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <article key={c.id} className="bg-[#12141C] border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col group shadow-lg relative">
                <div className="absolute top-3 right-3 z-10">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono ${
                    c.isVIP ? 'bg-amber-500/90 text-amber-950' : 'bg-surface-container/90 border border-outline-variant/30 text-on-surface'
                  }`}>
                    {c.isVIP ? `VIP${c.priceCents ? ` · ${(c.priceCents / 100).toFixed(2)}€` : ''}` : 'FREE'}
                  </span>
                </div>
                <div className="h-44 overflow-hidden relative bg-surface-container-lowest shrink-0">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-primary-fixed-dim font-bold uppercase tracking-wider block font-mono">{c.category}</span>
                    <h4 className="font-display font-bold text-base text-on-surface leading-snug group-hover:text-primary-fixed-dim transition-colors">{c.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium pt-2 border-t border-outline-variant/10">
                    <User className="w-4 h-4 text-primary-container" />
                    <span>{c.instructor}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg text-on-surface">Workshops & Εκδηλώσεις</h3>
          <button
            onClick={() => setNewWorkshopModalOpen(true)}
            className="flex items-center gap-2 bg-surface-container-high border border-outline-variant/20 text-on-surface px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-variant/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Ανακοίνωση workshop
          </button>
        </div>
        {workshops.length === 0 ? (
          <p className="text-on-surface-variant text-sm py-6 text-center bg-surface-container/30 rounded-xl border border-outline-variant/10">
            Δεν υπάρχουν ανακοινωμένα workshops αυτή τη στιγμή.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshops.map((w) => (
              <a
                key={w.id}
                href={w.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 bg-surface-container/50 border border-outline-variant/20 rounded-xl p-3 hover:border-primary-container/40 transition-all group"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
                  <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-primary-fixed-dim font-bold uppercase tracking-wider font-mono">{w.category}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary-container shrink-0" />
                  </div>
                  <h4 className="font-semibold text-sm text-on-surface leading-snug truncate group-hover:text-primary-fixed-dim transition-colors">{w.title}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{w.organizerName}</p>
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-mono">
                    {w.eventDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{w.eventDate}</span>}
                    {w.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{w.location}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-container-high rounded-xl p-6 md:p-8 border-t border-secondary-container/30 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, #fe6b00 0%, transparent 60%)' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-display font-bold text-xl md:text-2xl text-on-surface">Χρειάζεστε καθοδήγηση;</h3>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              Κλείστε ένα ιδιωτικό μάθημα με τους ειδικούς μας για εξατομικευμένη βοήθεια.
            </p>
          </div>
          <button
            onClick={() => {
              if (courses.length === 0) return;
              setBookingCourseId(courses[0].id);
              setBookingModalOpen(true);
            }}
            disabled={courses.length === 0}
            className="bg-gradient-to-r from-[#fe6b00] to-[#ffb693] text-[#351000] font-semibold text-sm px-8 py-4 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer font-sans disabled:opacity-40 disabled:hover:scale-100"
          >
            <PhoneCall className="w-4 h-4" />
            Κράτηση Μαθήματος
          </button>
        </div>
      </section>

      <AnimatePresence>
        {bookingModalOpen && (
          <BookingModal
            courses={courses}
            initialCourseId={bookingCourseId}
            userId={userId}
            onClose={() => setBookingModalOpen(false)}
            onBooked={(b) => {
              setBookings((prev) => [...prev, b]);
              setBookingModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newCourseModalOpen && (
          <NewCourseModal
            userId={userId}
            onClose={() => setNewCourseModalOpen(false)}
            onCreated={() => {
              setNewCourseModalOpen(false);
              loadAll();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newWorkshopModalOpen && (
          <NewWorkshopModal
            userId={userId}
            organizerName={currentUsername}
            onClose={() => setNewWorkshopModalOpen(false)}
            onCreated={() => {
              setNewWorkshopModalOpen(false);
              loadAll();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface BookingModalProps {
  courses: CourseItem[];
  initialCourseId: string;
  userId: string;
  onClose: () => void;
  onBooked: (booking: BookingItem) => void;
}

function BookingModal({ courses, initialCourseId, userId, onClose, onBooked }: BookingModalProps) {
  const [courseId, setCourseId] = useState(initialCourseId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createBooking({ courseId, studentId: userId, date, timeSlot });
      onBooked({ id: `temp-${Date.now()}`, courseTitle: course.title, instructorName: course.instructor, date, timeSlot });
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
        className="bg-[#12141C] border border-outline-variant/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
          <h3 className="font-display font-bold text-lg text-primary-fixed-dim flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-container" />
            Κράτηση Ιδιωτικού Μαθήματος
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Επιλογή Θεματικής / Καθηγητή</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title} ({course.instructor})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Ημερομηνία Μαθήματος</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:border-primary-container text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Διαθέσιμη Ώρα</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer font-mono text-center border ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary-container text-primary-container shadow-[inset_0_1px_rgba(255,255,255,0.1)]'
                        : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>}

          <div className="flex gap-2 justify-end pt-4 border-t border-outline-variant/10">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-transparent text-on-surface-variant hover:text-on-surface font-semibold text-xs rounded-full transition-colors cursor-pointer">
              Ακύρωση
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-primary-container to-blue-500 text-on-primary-container font-semibold text-xs rounded-full hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Επιβεβαίωση Κράτησης
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface NewCourseModalProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

function NewCourseModal({ userId, onClose, onCreated }: NewCourseModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVIP, setIsVIP] = useState(false);
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !title.trim()) {
      setErrorMsg('Συμπλήρωσε τίτλο και εικόνα.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createCourse({
        instructorId: userId,
        title: title.trim(),
        category,
        imageUrl,
        isVIP,
        priceCents: isVIP && price ? Math.round(parseFloat(price) * 100) : undefined,
      });
      onCreated();
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
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Νέο μάθημα</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Τίτλος</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="π.χ. Εισαγωγή στη ρευστοδυναμική"
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Κατηγορία</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Εικόνα εξωφύλλου</label>
            <ImageUploader userId={userId} onUploaded={setImageUrl} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isVIP} onChange={(e) => setIsVIP(e.target.checked)} className="w-auto" />
            Αυτό είναι πληρωμένο (VIP) μάθημα
          </label>

          {isVIP && (
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Τιμή (€) — η πληρωμή θα ενεργοποιηθεί σύντομα</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14.99"
                className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
              />
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{errorMsg}</p>}

          <button
            type="submit"
            disabled={submitting || !imageUrl}
            className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Δημοσίευση μαθήματος
          </button>
        </form>
      </motion.div>
    </div>
  );
}

interface NewWorkshopModalProps {
  userId: string;
  organizerName: string;
  onClose: () => void;
  onCreated: () => void;
}

function NewWorkshopModal({ userId, organizerName, onClose, onCreated }: NewWorkshopModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !title.trim() || !description.trim() || !externalUrl.trim()) {
      setErrorMsg('Συμπλήρωσε τίτλο, περιγραφή, εικόνα και link.');
      return;
    }
    let normalizedUrl = externalUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createWorkshop({
        organizerId: userId,
        organizerName,
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl,
        eventDate: eventDate || undefined,
        location: location.trim() || undefined,
        externalUrl: normalizedUrl,
      });
      onCreated();
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
          <h3 className="font-semibold text-lg text-primary-fixed-dim">Ανακοίνωση workshop</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <p className="text-xs text-on-surface-variant bg-surface-container/40 rounded-lg p-2.5">
            Αυτή η ανακοίνωση θα οδηγεί τους χρήστες στο εξωτερικό site σου για κράτηση/αγορά εισιτηρίου. Δεν γίνεται καμία πληρωμή μέσα στο StudON.
          </p>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Τίτλος εκδήλωσης</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="π.χ. Workshop CNC Μηχανουργίας"
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Κατηγορία</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Εικόνα</label>
            <ImageUploader userId={userId} onUploaded={setImageUrl} />
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Περιγραφή</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Τι θα γίνει στο workshop..."
              className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Ημερομηνία</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Τοποθεσία</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="π.χ. Αθήνα"
                className="w-full bg-surface-container text-on-surface py-2.5 px-3 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:border-primary-container"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Link κράτησης/εισιτηρίων</label>
            <input
              type="text"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
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
            Δημοσίευση ανακοίνωσης
          </button>
        </form>
      </motion.div>
    </div>
  );
}
