import { useState, useEffect } from 'react';
import { Home, Compass, GraduationCap, Calendar, User, Bell, Search, Menu, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';

// Data and Types
import { supabase } from './lib/supabase';

// Tab Components
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import LearningTab from './components/LearningTab';
import MeetsTab from './components/MeetsTab';
import ProfileTab from './components/ProfileTab';
import ChatsTab from './components/ChatsTab';
import NotificationCenter from './components/NotificationCenter';
import AuthScreen from './components/AuthScreen';

type TabType = 'home' | 'explore' | 'chats' | 'learning' | 'meets' | 'profile';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);

  useEffect(() => {
    // Ελέγχουμε αν υπάρχει ήδη ενεργή σύνδεση (π.χ. ο χρήστης είχε συνδεθεί παλιότερα)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // "Ακούμε" για αλλαγές στο auth state (login, logout, κ.λπ.) ώστε το UI να ανανεώνεται αυτόματα
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Profile Avatar Sync State — φορτώνεται από τη βάση δεδομένων μόλις υπάρχει session
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [currentUsername, setCurrentUsername] = useState<string>('');

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCurrentUsername(data.username);
          setCurrentAvatar(data.avatar_url ?? '');
        }
      });
  }, [session]);

  // Main shared states

  // Δυναμικός μετρητής μη αναγνωσμένων ειδοποιήσεων — ενημερώνεται από το NotificationCenter
  const [notificationCount, setNotificationCount] = useState(0);

  const tabsInfo = [
    { id: 'home' as TabType, label: 'Αρχική', icon: Home },
    { id: 'explore' as TabType, label: 'Εξερεύνηση', icon: Compass },
    { id: 'chats' as TabType, label: 'Συνομιλίες', icon: MessageSquare },
    { id: 'learning' as TabType, label: 'Μάθηση', icon: GraduationCap },
    { id: 'meets' as TabType, label: 'Meets', icon: Calendar },
    { id: 'profile' as TabType, label: 'Προφίλ', icon: User }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userId={session!.user.id} currentUsername={currentUsername} currentAvatar={currentAvatar} />;
      case 'explore':
        return <ExploreTab userId={session!.user.id} />;
      case 'chats':
        return <ChatsTab userId={session!.user.id} />;
      case 'learning':
        return <LearningTab userId={session!.user.id} currentUsername={currentUsername} />;
      case 'meets':
        return <MeetsTab userId={session!.user.id} />;
      case 'profile':
        return (
          <ProfileTab
            userId={session!.user.id}
            onProfileUpdated={(username, avatarUrl) => {
              setCurrentUsername(username);
              setCurrentAvatar(avatarUrl);
            }}
          />
        );
      default:
        return <HomeTab userId={session!.user.id} currentUsername={currentUsername} currentAvatar={currentAvatar} />;
    }
  };

  // Όσο ελέγχουμε αν υπάρχει ήδη συνδεδεμένος χρήστης, δείχνουμε ένα απλό loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
      </div>
    );
  }

  // Αν δεν υπάρχει ενεργή σύνδεση, δείχνουμε την οθόνη login/εγγραφής αντί για την εφαρμογή
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#dfe2ee] font-sans antialiased pb-24 md:pb-6 md:pl-80 pt-20 md:pt-6">
      {/* TopAppBar (Mobile only / sticky header for fast notifications) */}
      <header className="fixed top-0 left-0 w-full z-40 bg-[#0f131c]/90 backdrop-blur-md border-b border-outline-variant/30 h-16 flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-primary-container/40 bg-surface-container-high">
            {currentAvatar && <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
          </div>
          <h1 className="font-display font-extrabold text-xl text-primary-container tracking-tighter">StudON</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Notifications Bell with count indicator */}
          <button
            onClick={() => setNotifCenterOpen(true)}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface relative cursor-pointer active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary-container text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* NavigationDrawer (Desktop Sidebar) */}
      <aside className="hidden md:flex flex-col h-full p-6 bg-[#12141C] border-r border-outline-variant/20 shadow-xl fixed top-0 left-0 h-screen w-80 rounded-r-2xl z-35">
        <div className="mb-8 pt-4 flex items-center gap-3">
          <div className="p-1.5 bg-primary-container/10 rounded-xl border border-primary-container/30">
            <GraduationCap className="w-6 h-6 text-primary-container" />
          </div>
          <span className="font-display font-extrabold text-2xl text-primary-fixed tracking-tighter">StudON</span>
        </div>

        {/* User Stats Quick-Summary Area */}
        <div className="mb-6 bg-surface-container/40 backdrop-blur border border-outline-variant/20 p-4 rounded-xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-full border-2 border-primary-container overflow-hidden shrink-0 bg-surface-container-high">
            {currentAvatar && <img src={currentAvatar} alt="User profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-on-surface truncate">{currentUsername || 'Φόρτωση...'}</h3>
            <p className="text-xs text-on-surface-variant">Μέλος της κοινότητας</p>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 space-y-1.5">
          {tabsInfo.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Area - Notifications Hub Bell Desktop */}
        <div className="mt-auto border-t border-outline-variant/20 pt-4">
          <button
            onClick={() => setNotifCenterOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 transition-all cursor-pointer relative"
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5" />
              <span className="font-medium text-sm">Ειδοποιήσεις</span>
            </div>
            {notificationCount > 0 ? (
              <span className="bg-secondary-container text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                {notificationCount}
              </span>
            ) : (
              <span className="text-[10px] text-on-surface-variant">0</span>
            )}
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-full text-on-surface-variant hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer mt-1"
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">Αποσύνδεση</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[#0f131c]/95 backdrop-blur-md border-t border-outline-variant/20 flex justify-around items-center h-20 pb-safe px-2">
        {tabsInfo.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-primary-container/10 text-primary-fixed-dim rounded-full px-5 py-1.5 shadow-[inset_0_1px_rgba(255,255,255,0.05)]'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Coordinated Notification Drawer */}
      <NotificationCenter
        userId={session!.user.id}
        isOpen={notifCenterOpen}
        setIsOpen={setNotifCenterOpen}
        onUnreadCountChange={setNotificationCount}
      />
    </div>
  );
}

