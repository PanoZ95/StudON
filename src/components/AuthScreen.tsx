import React, { useState, FormEvent } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(translateError(err.message));
      } else {
        setErrorMsg('Κάτι πήγε στραβά. Δοκίμασε ξανά.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Μεταφράζει τα πιο συχνά error messages του Supabase στα Ελληνικά
  const translateError = (msg: string): string => {
    if (msg.includes('Invalid login credentials')) return 'Λάθος email ή κωδικός.';
    if (msg.includes('User already registered')) return 'Υπάρχει ήδη λογαριασμός με αυτό το email.';
    if (msg.includes('Password should be at least')) return 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.';
    if (msg.includes('Unable to validate email')) return 'Μη έγκυρη μορφή email.';
    return msg;
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#dfe2ee] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="p-2 bg-primary-container/10 rounded-xl border border-primary-container/30">
            <GraduationCap className="w-7 h-7 text-primary-container" />
          </div>
          <span className="font-display font-extrabold text-3xl tracking-tighter">StudON</span>
        </div>

        <div className="bg-[#12141C] border border-outline-variant/20 rounded-2xl p-6 shadow-xl">
          <div className="flex mb-6 bg-[#0A0C10] rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
              }`}
            >
              Σύνδεση
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
              }`}
            >
              Εγγραφή
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-on-surface-variant mb-1 block">Όνομα χρήστη</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="π.χ. Alex_Mech"
                  className="w-full bg-[#0A0C10] border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-container"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#0A0C10] border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div>
              <label className="text-xs text-on-surface-variant mb-1 block">Κωδικός</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0C10] border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
            </button>
          </form>
        </div>

        {mode === 'signup' && (
          <p className="text-xs text-on-surface-variant text-center mt-4">
            Κάνοντας εγγραφή αποδέχεσαι τους όρους χρήσης της πλατφόρμας.
          </p>
        )}
      </div>
    </div>
  );
}
