import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { AIConciergeDrawer } from './components/ai/AIConciergeDrawer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { HomePage } from './pages/HomePage';
import { HotelsPage } from './pages/HotelsPage';
import { HotelDetailPage } from './pages/HotelDetailPage';
import { BookingPage } from './pages/BookingPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Hotel, HotelDetail, Room } from './types';
import { api } from './services/api';
import { Bot, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'hotels' | 'hotel_detail' | 'booking' | 'dashboard' | 'admin'>('home');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelDetail, setSelectedHotelDetail] = useState<HotelDetail | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [initialHotelFilters, setInitialHotelFilters] = useState<any>(null);

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  useEffect(() => {
    loadHotels();
    loadUnreadNotifs();
  }, [user]);

  const loadHotels = async () => {
    try {
      const data = await api.getHotels();
      setHotels(data);
    } catch (e) {
      console.error('Failed to load hotels', e);
    }
  };

  const loadUnreadNotifs = async () => {
    if (!user) {
      setUnreadNotifsCount(0);
      return;
    }
    try {
      const notifs = await api.getNotifications();
      const unread = notifs.filter((n) => !n.is_read).length;
      setUnreadNotifsCount(unread);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'hotels' && data) {
      setInitialHotelFilters(data);
    }
    setCurrentPage(page as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHotel = async (hotel: Hotel) => {
    try {
      const fullDetail = await api.getHotelById(hotel.id);
      setSelectedHotelDetail(fullDetail);
      setCurrentPage('hotel_detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectRoomToBook = (hotel: HotelDetail, room: Room) => {
    if (!user) {
      setAuthModalMode('signup');
      setAuthModalOpen(true);
      return;
    }
    setSelectedHotelDetail(hotel);
    setSelectedRoom(room);
    setCurrentPage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Page Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            hotels={hotels}
            onSelectHotel={handleSelectHotel}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'hotels' && (
          <HotelsPage
            initialFilters={initialHotelFilters}
            onSelectHotel={handleSelectHotel}
          />
        )}

        {currentPage === 'hotel_detail' && selectedHotelDetail && (
          <HotelDetailPage
            hotelId={selectedHotelDetail.id}
            onBack={() => setCurrentPage('hotels')}
            onSelectRoomToBook={handleSelectRoomToBook}
          />
        )}

        {currentPage === 'booking' && selectedHotelDetail && selectedRoom && (
          <BookingPage
            hotel={selectedHotelDetail}
            room={selectedRoom}
            onBack={() => setCurrentPage('hotel_detail')}
            onNavigateToDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'dashboard' && (
          <UserDashboardPage
            onExploreHotels={() => setCurrentPage('hotels')}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* Floating AI Concierge Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="relative p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/60 hover:scale-105 transition-all flex items-center gap-2 group"
          title="Ask StayBot AI Assistant"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950 text-teal-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline">Ask StayBot AI</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </button>
      </div>

      {/* AI Assistant Drawer */}
      <AIConciergeDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        onNavigateToHotel={async (hotelId) => {
          setAiDrawerOpen(false);
          const h = hotels.find((x) => x.id === hotelId);
          if (h) handleSelectHotel(h);
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onRefreshCount={loadUnreadNotifs}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
