import React, { useState, useEffect } from 'react';
import { ServiceProvider, Booking, ServiceCategory, MoroccoCity } from './types';
import { INITIAL_PROVIDERS } from './data';
import ProviderCard from './components/ProviderCard';
import BookingModal from './components/BookingModal';
import ApplicationForm from './components/ApplicationForm';
import BookingsList from './components/BookingsList';
import SettingsModal from './components/SettingsModal';
import ProStudio from './components/ProStudio';
import AuthModal, { UserAccount } from './components/AuthModal';
import { TRANSLATIONS, Language } from './translations';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Wrench,
  Dumbbell,
  Search,
  Filter,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
  PlusCircle,
  Settings,
  X,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  Heart,
  Trash2,
  Award,
  Star,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function App() {
  // Load initial states from localStorage or defaults
  const [providers, setProviders] = useState<ServiceProvider[]>(() => {
    const saved = localStorage.getItem('mtrini_providers');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
    // Filter out the old default/AI workers (starting with 'prov-') forever
    return parsed.filter((p: any) => !p.id.startsWith('prov-'));
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('mtrini_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('mtrini_lang');
    return (saved as Language) || 'en';
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Filters state
  const [cityFilter, setCityFilter] = useState<'all' | MoroccoCity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 'top'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('mtrini_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // New settings states
  const [currency, setCurrency] = useState<'MAD' | 'USD' | 'EUR'>(() => {
    return (localStorage.getItem('mtrini_currency') as 'MAD' | 'USD' | 'EUR') || 'MAD';
  });

  const [accentColor, setAccentColor] = useState<'slate' | 'emerald' | 'blue' | 'amber' | 'rose'>(() => {
    return (localStorage.getItem('mtrini_accent_color') as any) || 'slate';
  });

  const [hideDefaultWorkers, setHideDefaultWorkers] = useState<boolean>(() => {
    return localStorage.getItem('mtrini_hide_default_workers') === 'true';
  });

  const [deletedDefaultWorkerIds, setDeletedDefaultWorkerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mtrini_deleted_default_worker_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('mtrini_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Real-time synchronization of Service Providers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'providers'), (snapshot) => {
      const loadedProviders: ServiceProvider[] = [];
      snapshot.forEach((doc) => {
        loadedProviders.push(doc.data() as ServiceProvider);
      });
      // Filter out any invalid items and default workers starts with prov-
      const validProviders = loadedProviders.filter((p) => p && p.id && !p.id.startsWith('prov-'));
      setProviders(validProviders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'providers');
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization of Bookings from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const loadedBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        loadedBookings.push(doc.data() as Booking);
      });
      // Sort bookings by creation date descending
      loadedBookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setBookings(loadedBookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, []);

  const handleToggleFavorite = (providerId: string) => {
    setFavorites((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]
    );
  };

  // App tabs: 'browse' | 'bookings' | 'apply' | 'pro'
  const [activeTab, setActiveTab] = useState<'browse' | 'bookings' | 'apply' | 'pro'>('browse');

  // Booking process states
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('mtrini_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthSuccess = (user: UserAccount, newProvider?: ServiceProvider) => {
    setCurrentUser(user);
    localStorage.setItem('mtrini_current_user', JSON.stringify(user));

    if (newProvider) {
      // In AuthModal, we already save the provider to Firestore!
      setSuccessNotification(
        lang === 'en' 
          ? `Welcome, ${user.name}! Your professional profile is now active and listed globally.`
          : lang === 'fr'
          ? `Bienvenue, ${user.name}! Votre profil professionnel est désormais actif et répertorié mondialement.`
          : `مرحباً بك، ${user.name}! الملف المهني ديالك دابا واجد ومنشور فالعالم كامل.`
      );
    } else {
      setSuccessNotification(
        lang === 'en' 
          ? `Welcome back, ${user.name}! (${user.role === 'pro' ? 'Professional' : 'Client'})`
          : lang === 'fr'
          ? `Bon retour, ${user.name}! (${user.role === 'pro' ? 'Professionnel' : 'Client'})`
          : `مرحباً بعودتك، ${user.name}! (${user.role === 'pro' ? 'حرفي' : 'كليان'})`
      );
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mtrini_current_user');
    localStorage.removeItem('mtrini_selected_pro_id');
    
    setSuccessNotification(
      lang === 'en' ? "Successfully logged out." : lang === 'fr' ? "Déconnecté avec succès." : "تم تسجيل الخروج بنجاح."
    );
  };

  // Sync settings (non-reactive settings) to localStorage
  useEffect(() => {
    localStorage.setItem('mtrini_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('mtrini_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('mtrini_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('mtrini_hide_default_workers', String(hideDefaultWorkers));
  }, [hideDefaultWorkers]);

  useEffect(() => {
    localStorage.setItem('mtrini_deleted_default_worker_ids', JSON.stringify(deletedDefaultWorkerIds));
  }, [deletedDefaultWorkerIds]);

  // Handle Booking Creation
  const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const bookingId = `book-${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      clientId: currentUser ? currentUser.id : undefined
    };

    try {
      await setDoc(doc(db, 'bookings', bookingId), newBooking);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingId}`);
    }

    setSelectedProvider(null);
    
    // Translated success notification
    const msg = lang === 'en' 
      ? `Your booking request with ${bookingData.providerName} has been submitted! They will call you on ${bookingData.clientPhone} to confirm details soon.`
      : lang === 'fr'
      ? `Votre demande de réservation avec ${bookingData.providerName} a été enregistrée ! Le professionnel vous appellera au ${bookingData.clientPhone} pour confirmer.`
      : `تم تسجيل طلب الحجز ديالك مع ${bookingData.providerName}! غايتاصل بيك قريب فـ ${bookingData.clientPhone} باش يتفاهم معاك.`;

    setSuccessNotification(msg);

    // Switch to bookings tab
    setActiveTab('bookings');

    // Auto-dismiss notification after 10 seconds
    setTimeout(() => {
      setSuccessNotification(null);
    }, 10000);
  };

  // Handle Booking Status: Cancel
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  // Handle Booking Status: Complete
  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: 'completed' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  // Handle Pro Dashboard status updates
  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  // Handle leaving the Pro Program / Deleting Profile
  const handleRemoveProvider = async (providerId: string) => {
    // If it's a default/AI worker, add to deletedDefaultWorkerIds list
    const isDefault = INITIAL_PROVIDERS.some((initialP) => initialP.id === providerId);
    if (isDefault) {
      setDeletedDefaultWorkerIds((prev) => {
        const updated = Array.from(new Set([...prev, providerId]));
        localStorage.setItem('mtrini_deleted_default_worker_ids', JSON.stringify(updated));
        return updated;
      });
    }
    try {
      await deleteDoc(doc(db, 'providers', providerId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `providers/${providerId}`);
    }
  };

  // Handle Adding a Provider Review
  const handleAddReview = async (
    providerId: string,
    rating: number,
    text: string,
    authorName: string
  ) => {
    // 1. Mark booking as reviewed in Firestore
    const bookingToUpdate = bookings.find(
      (b) => b.providerId === providerId && b.status === 'completed' && !b.hasReviewed
    );
    if (bookingToUpdate) {
      try {
        await updateDoc(doc(db, 'bookings', bookingToUpdate.id), { hasReviewed: true });
      } catch (err) {
        console.error("Failed to mark booking as reviewed:", err);
      }
    }

    // 2. Fetch/update reviews and average score in Firestore
    const p = providers.find((prov) => prov.id === providerId);
    if (p) {
      const newReview = {
        id: `rev-${Date.now()}`,
        authorName,
        authorCity: p.city,
        rating,
        text,
        date: new Date().toISOString().split('T')[0]
      };

      const updatedReviews = [newReview, ...p.reviews];
      const averageRating =
        updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

      try {
        await updateDoc(doc(db, 'providers', providerId), {
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating: averageRating
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `providers/${providerId}`);
      }
    }
  };

  // Onboard New Professional
  const handleProviderApplication = async (application: Omit<ServiceProvider, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'isVerified' | 'completedJobs'>) => {
    const providerId = `pro-${Date.now()}`;
    const newProvider: ServiceProvider = {
      ...application,
      id: providerId,
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      isVerified: false,
      completedJobs: 0,
      isWorkProgramParticipant: true
    };

    try {
      await setDoc(doc(db, 'providers', providerId), newProvider);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `providers/${providerId}`);
    }
  };

  // Reset function for application settings
  const handleResetData = () => {
    localStorage.removeItem('mtrini_providers');
    localStorage.removeItem('mtrini_bookings');
    localStorage.removeItem('mtrini_currency');
    localStorage.removeItem('mtrini_accent_color');
    localStorage.removeItem('mtrini_hide_default_workers');
    localStorage.removeItem('mtrini_deleted_default_worker_ids');
    
    setProviders([]);
    setBookings([]);
    setCurrency('MAD');
    setAccentColor('slate');
    setHideDefaultWorkers(false);
    setDeletedDefaultWorkerIds([]);
  };

  // Delete all default workers permanetly from active directory
  const handleDeleteDefaultWorkers = () => {
    const defaultIds = INITIAL_PROVIDERS.map((p) => p.id);
    setDeletedDefaultWorkerIds(defaultIds);
    setProviders((prev) => prev.filter((p) => !defaultIds.includes(p.id)));
  };

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const isDefault = INITIAL_PROVIDERS.some((initialP) => initialP.id === p.id);
    const matchesHideDefault = !hideDefaultWorkers || !isDefault;
    const matchesNotDeletedDefault = !deletedDefaultWorkerIds.includes(p.id);

    const matchesCity = cityFilter === 'all' || p.city === cityFilter;
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || p.rating >= 4.8;
    const matchesFavorite = !showFavoritesOnly || favorites.includes(p.id);
    
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matchesSearch =
      cleanQuery === '' ||
      p.name.toLowerCase().includes(cleanQuery) ||
      p.bio.toLowerCase().includes(cleanQuery) ||
      p.skills.some((skill) => skill.toLowerCase().includes(cleanQuery));

    return matchesCity && matchesCategory && matchesRating && matchesFavorite && matchesSearch && matchesHideDefault && matchesNotDeletedDefault;
  });

  const activeBookingsCount = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed').length;
  const verifiedCount = providers.filter((p) => p.isVerified).length;
  const totalCompletedJobs = providers.reduce((acc, p) => acc + p.completedJobs, 0);

  const t = TRANSLATIONS[lang];

  // Accent Theme Mapping
  const getThemeClasses = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          bg: 'bg-emerald-600 hover:bg-emerald-500',
          bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          text: 'text-emerald-600',
          textHover: 'hover:text-emerald-700',
          border: 'border-emerald-600',
          ring: 'focus:ring-emerald-600',
          gradient: 'from-emerald-900 via-emerald-800 to-emerald-950 border-emerald-800',
          buttonActive: 'bg-emerald-600 text-white border-emerald-700',
          badgeGradient: 'from-emerald-600 to-emerald-500',
        };
      case 'blue':
        return {
          bg: 'bg-blue-600 hover:bg-blue-500',
          bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
          text: 'text-blue-600',
          textHover: 'hover:text-blue-700',
          border: 'border-blue-600',
          ring: 'focus:ring-blue-600',
          gradient: 'from-blue-900 via-blue-800 to-blue-950 border-blue-800',
          buttonActive: 'bg-blue-600 text-white border-blue-700',
          badgeGradient: 'from-blue-600 to-blue-500',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500 hover:bg-amber-400',
          bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
          text: 'text-amber-600',
          textHover: 'hover:text-amber-700',
          border: 'border-amber-500',
          ring: 'focus:ring-amber-500',
          gradient: 'from-amber-900 via-amber-800 to-amber-950 border-amber-800',
          buttonActive: 'bg-amber-500 text-white border-amber-600',
          badgeGradient: 'from-amber-500 to-amber-400',
        };
      case 'rose':
        return {
          bg: 'bg-rose-500 hover:bg-rose-400',
          bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
          text: 'text-rose-600',
          textHover: 'hover:text-rose-700',
          border: 'border-rose-500',
          ring: 'focus:ring-rose-500',
          gradient: 'from-rose-900 via-rose-800 to-rose-950 border-rose-800',
          buttonActive: 'bg-rose-500 text-white border-rose-600',
          badgeGradient: 'from-rose-600 to-rose-500',
        };
      default: // slate
        return {
          bg: 'bg-slate-900 hover:bg-slate-800',
          bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
          text: 'text-slate-600',
          textHover: 'hover:text-slate-700',
          border: 'border-slate-900',
          ring: 'focus:ring-slate-950',
          gradient: 'from-slate-900 via-slate-800 to-slate-950 border-slate-800',
          buttonActive: 'bg-slate-900 text-white border-slate-950',
          badgeGradient: 'from-slate-900 to-slate-800',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className="min-h-screen bg-slate-50/75 flex flex-col font-sans pb-28 selection:bg-slate-900 selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* SUCCESS NOTIFICATION */}
      {successNotification && (
        <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-4 sticky top-0 z-50 animate-in slide-in-from-top duration-300 shadow-md">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3">
            <div className="flex gap-2.5 items-start text-xs md:text-sm font-sans">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-medium">{successNotification}</span>
            </div>
            <button
              onClick={() => setSuccessNotification(null)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-4">
          
          {/* Logo with Dumbbell + Work Tool icon */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 p-2 bg-gradient-to-tr ${theme.badgeGradient} text-white rounded-xl shadow-md`}>
              <Dumbbell className="w-5 h-5 shrink-0" />
              <span className="font-mono text-xs font-black text-slate-400">+</span>
              <Wrench className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
                Mtrini Khedma
              </h1>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block -mt-0.5">
                {t.logoSub}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.2 rounded-md">
                    {currentUser.role === 'pro' ? 'Professional' : 'Client'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 border border-rose-200 hover:border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans text-xs font-bold shrink-0"
                  title={lang === 'en' ? 'Log Out' : lang === 'fr' ? 'Se déconnecter' : 'خروج'}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Log Out' : lang === 'fr' ? 'Déconnexion' : 'خروج'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans text-xs font-bold shrink-0 shadow-sm"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{lang === 'en' ? 'Log In / Register' : lang === 'fr' ? 'Connexion' : 'تسجيل الدخول'}</span>
              </button>
            )}

            {/* Language/App Settings Button (Standard Style) */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-sans text-xs font-bold shrink-0 shadow-sm"
              title="Settings & Languages"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline uppercase text-slate-700">{lang}</span>
            </button>
          </div>

        </div>
      </header>

      {/* CORE CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {/* HERO SECTION - ONLY ON BROWSE */}
            {activeTab === 'browse' && (
              <div className={`bg-gradient-to-tr ${theme.gradient} border p-6 md:p-10 rounded-3xl shadow-xl text-white relative overflow-hidden mb-8`}>
                {/* Glowing artistic ambient background */}
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                  <Wrench className="w-96 h-96 text-white" />
                </div>
                
                <div className="relative z-10 max-w-3xl">
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest px-3 py-1 bg-white/10 text-white rounded-full border border-white/10 inline-flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {t.heroBadge}
                  </span>
                  <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-3 uppercase leading-tight">
                    {t.heroTitle}
                  </h2>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans mb-8">
                    {t.heroDesc}
                  </p>

                  {/* Quick Metrics Bar */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4 pt-6 border-t border-white/10 font-mono">
                    <div className="bg-white/5 p-3.5 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {t.metricPros}
                      </span>
                      <span className="text-sm md:text-lg font-black text-white">{filteredProviders.length} {t.metricListings}</span>
                    </div>
                    <div className="bg-white/5 p-3.5 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {t.metricVerified}
                      </span>
                      <span className="text-sm md:text-lg font-black text-white">{verifiedCount} {t.metricChecked}</span>
                    </div>
                    <div className="bg-white/5 p-3.5 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                        {t.metricJobs}
                      </span>
                      <span className="text-sm md:text-lg font-black text-white">{totalCompletedJobs}+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS SWITCHER CONTENT */}

            {/* BROWSE TAB */}
            {activeTab === 'browse' && (
              <div className="space-y-6">

                {/* MOROCCO HOME SERVICES INSIGHTS PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1.5 bg-slate-900 text-white rounded-lg">
                        <Award className="w-4 h-4 text-amber-400" />
                      </span>
                      <div>
                        <h3 className="font-display text-sm font-black text-slate-900 uppercase">
                          {lang === 'en' ? 'Morocco Home Service Market Insights' : lang === 'fr' ? 'Analyses du Marché des Services au Maroc' : 'تحليلات سوق الخدمات المنزلية بالمغرب'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {lang === 'en' ? 'Average hourly rates and completed job diagnostics in Casablanca & Rabat' : lang === 'fr' ? 'Tarifs moyens et diagnostics des travaux à Casablanca et Rabat' : 'معدل الأسعار للساعة وتفاصيل الخدمات فكازا والرباط'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">{t.plumbers}</span>
                        <span className="font-display font-bold text-slate-900 text-sm">110 - 140 MAD</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">{t.electricians}</span>
                        <span className="font-display font-bold text-slate-900 text-sm">130 - 160 MAD</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">{t.painters}</span>
                        <span className="font-display font-bold text-slate-900 text-sm">80 - 110 MAD</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">{t.cleaners}</span>
                        <span className="font-display font-bold text-slate-900 text-sm">60 - 90 MAD</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full uppercase w-max mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {lang === 'en' ? 'Live Network Health' : lang === 'fr' ? 'État du Réseau en Direct' : 'حالة الشبكة الحية'}
                    </span>
                    <h4 className="font-display text-base font-black text-slate-950 uppercase">
                      Synovex Verified™
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {lang === 'en' ? 'Every provider is manually vetted for Moroccan identity and qualification background.' : lang === 'fr' ? 'Chaque prestataire est vérifié manuellement pour son identité et ses qualifications marocaines.' : 'كل حرفي كايتم التحقق من الهوية ديالو والخبرة المهنية ديالو يدوياً.'}
                    </p>
                  </div>
                </div>
                
                {/* SEARCH & FILTER CONTROLS */}
                <div className="bg-white border border-slate-100 p-5 md:p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col gap-5">
                  
                  <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Search query */}
                    <div className="relative flex-grow">
                      <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                        <Search className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className={`w-full ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all`}
                      />
                    </div>

                    {/* City filter */}
                    <div className="flex items-center border border-slate-200 rounded-2xl px-4 py-2.5 bg-white shrink-0 shadow-xs">
                      <MapPin className="w-4 h-4 text-slate-400 mr-1.5 ml-1.5" />
                      <span className="font-mono text-xs font-bold mr-1 ml-1 uppercase text-slate-500">{t.cityLabel}</span>
                      <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value as 'all' | MoroccoCity)}
                        className="bg-transparent text-xs font-sans font-bold focus:outline-none cursor-pointer pr-4 pl-4 text-slate-800"
                      >
                        <option value="all">{t.allCities}</option>
                        <option value="Casablanca">Casablanca</option>
                        <option value="Rabat">Rabat</option>
                      </select>
                    </div>

                    {/* Rating filter toggle */}
                    <button
                      type="button"
                      onClick={() => setRatingFilter(prev => prev === 'all' ? 'top' : 'all')}
                      className={`flex items-center gap-1.5 border rounded-2xl px-4 py-2.5 font-sans text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                        ratingFilter === 'top'
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${ratingFilter === 'top' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span>{ratingFilter === 'top' ? (lang === 'en' ? 'Top Rated' : lang === 'fr' ? 'Mieux Notés' : 'الأعلى تقييماً') : (lang === 'en' ? 'All Ratings' : lang === 'fr' ? 'Toutes les Notes' : 'كل التقييمات')}</span>
                    </button>

                    {/* Favorites toggle */}
                    <button
                      type="button"
                      onClick={() => setShowFavoritesOnly(prev => !prev)}
                      className={`flex items-center gap-1.5 border rounded-2xl px-4 py-2.5 font-sans text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                        showFavoritesOnly
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                      <span>{lang === 'en' ? 'Favorites' : lang === 'fr' ? 'Favoris' : 'المفضلة'} ({favorites.length})</span>
                    </button>
                  </div>

                  {/* Category buttons */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                    <span className="font-mono text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      {t.filterTitle}
                    </span>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-4 py-2.5 rounded-lg font-sans text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                          categoryFilter === 'all'
                            ? theme.buttonActive
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.allServices} ({providers.length})
                      </button>
                      <button
                        onClick={() => setCategoryFilter('plumber')}
                        className={`px-4 py-2.5 rounded-lg font-sans text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                          categoryFilter === 'plumber'
                            ? theme.buttonActive
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.plumbers} ({providers.filter(p => p.category === 'plumber').length})
                      </button>
                      <button
                        onClick={() => setCategoryFilter('electrician')}
                        className={`px-4 py-2.5 rounded-lg font-sans text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                          categoryFilter === 'electrician'
                            ? theme.buttonActive
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.electricians} ({providers.filter(p => p.category === 'electrician').length})
                      </button>
                      <button
                        onClick={() => setCategoryFilter('painter')}
                        className={`px-4 py-2.5 rounded-lg font-sans text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                          categoryFilter === 'painter'
                            ? theme.buttonActive
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.painters} ({providers.filter(p => p.category === 'painter').length})
                      </button>
                      <button
                        onClick={() => setCategoryFilter('cleaner')}
                        className={`px-4 py-2.5 rounded-lg font-sans text-xs font-bold transition-all border cursor-pointer shadow-sm ${
                          categoryFilter === 'cleaner'
                            ? theme.buttonActive
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t.cleaners} ({providers.filter(p => p.category === 'cleaner').length})
                      </button>
                    </div>
                  </div>

                </div>

                {/* PROVIDERS DIRECTORY LISTINGS */}
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-display text-lg font-extrabold uppercase text-slate-900">
                      {t.availablePros} ({filteredProviders.length})
                    </h3>
                    <span className="font-sans text-xs text-slate-400 font-semibold">
                      {t.showingIn} {cityFilter === 'all' ? (lang === 'ar' ? 'الدار البيضاء والرباط' : 'Casablanca & Rabat') : cityFilter}
                    </span>
                  </div>

                  {filteredProviders.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="font-display text-xl font-bold text-slate-800 mb-1.5">{t.noProsTitle}</h4>
                      <p className="text-sm font-sans text-slate-500 max-w-md mx-auto mb-6">
                        {t.noProsDesc}
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setCityFilter('all');
                          setCategoryFilter('all');
                        }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-lg border border-slate-950 transition-colors cursor-pointer shadow-sm"
                      >
                        {t.clearFilters}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredProviders.map((provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          onBook={(p) => setSelectedProvider(p)}
                          lang={lang}
                          onDelete={handleRemoveProvider}
                          isFavorite={favorites.includes(provider.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onAddReview={handleAddReview}
                          currency={currency}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <BookingsList
                bookings={bookings.filter((b) => !currentUser || b.clientId === currentUser.id || !b.clientId)}
                onCancelBooking={handleCancelBooking}
                onCompleteBooking={handleCompleteBooking}
                onAddReview={handleAddReview}
                lang={lang}
              />
            )}

            {/* ONBOARDING/APPLY TAB */}
            {activeTab === 'apply' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-14 h-14 bg-slate-50 text-slate-800 border border-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7 text-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-slate-900 uppercase">{t.whyTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-3">{t.whySub}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs font-sans text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-700">{t.why1}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-700">{t.why2}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-700">{t.why3}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-slate-700">{t.why4}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {!currentUser && (
                  <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-3xl max-w-3xl mx-auto text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left font-sans text-xs text-amber-800 font-semibold leading-relaxed">
                      {lang === 'en' 
                        ? '💡 Tip: Register a Professional Account instead to easily log in, track bookings, and manage your active listing.'
                        : lang === 'fr'
                        ? '💡 Astuce : Créez un compte Professionnel pour vous connecter facilement, suivre vos demandes et gérer votre annonce.'
                        : '💡 نصيحة: سجل حساب مهني بدلاً من ذلك باش تدخل بسهولة وتتبع الحجوزات ديالك وتسير الملف الشخصي.'}
                    </div>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-sm transition-all"
                    >
                      {lang === 'en' ? 'Register Account' : lang === 'fr' ? "S'inscrire" : 'تسجيل حساب'}
                    </button>
                  </div>
                )}

                <ApplicationForm onSuccess={handleProviderApplication} lang={lang} />
              </div>
            )}

            {/* PRO STUDIO TAB */}
            {activeTab === 'pro' && (
              <ProStudio
                providers={providers}
                bookings={bookings}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onRemoveProvider={handleRemoveProvider}
                lang={lang}
                onSwitchTab={setActiveTab}
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-1.5 p-1.5 bg-gradient-to-tr ${theme.badgeGradient} text-white rounded-lg`}>
              <Dumbbell className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[9px] font-bold text-slate-400">+</span>
              <Wrench className="w-4 h-4 shrink-0" />
            </div>
            <span className="font-display font-black text-sm uppercase text-slate-900">
              Mtrini Khedma
            </span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs font-sans font-semibold text-slate-500">
              © {new Date().getFullYear()} Mtrini Khedma. Casablanca & Rabat, Morocco.
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
              {t.footerCredits}
            </p>
            <div className="mt-3 flex items-center justify-center md:justify-end gap-1.5 text-xs text-slate-400">
              <span>Crafted by</span>
              <span className="font-mono font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-md shadow-xs text-[10px] tracking-wide uppercase transition-colors">
                Synovex Labs
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
        onLanguageChange={(newLang) => setLang(newLang)}
        onResetData={handleResetData}
        currency={currency}
        onCurrencyChange={(newCurrency) => setCurrency(newCurrency)}
        accentColor={accentColor}
        onAccentColorChange={(newColor) => setAccentColor(newColor)}
        hideDefaultWorkers={hideDefaultWorkers}
        onHideDefaultWorkersChange={(newHide) => setHideDefaultWorkers(newHide)}
        onDeleteDefaultWorkers={handleDeleteDefaultWorkers}
      />

      {/* BOOKING DRAWER/MODAL POPUP */}
      {selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onSubmit={handleCreateBooking}
          lang={lang}
          currency={currency}
          currentUser={currentUser}
        />
      )}

      {/* REGISTRATION & LOGIN MODAL */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          lang={lang}
          providers={providers}
        />
      )}

      {/* PERSISTENT BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] py-3 px-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md mx-auto flex justify-around items-center">
          {/* Browse Tab */}
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'browse' ? `${theme.text} scale-105 font-bold` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] font-sans font-bold">{t.tabBrowse}</span>
          </button>

          {/* Bookings Tab */}
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all relative ${
              activeTab === 'bookings' ? `${theme.text} scale-105 font-bold` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-sans font-bold">{t.tabBookings}</span>
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold border-2 border-white animate-pulse">
                {activeBookingsCount}
              </span>
            )}
          </button>

          {/* Apply Tab */}
          <button
            onClick={() => setActiveTab('apply')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'apply' ? `${theme.text} scale-105 font-bold` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-[10px] font-sans font-bold">{t.tabApply}</span>
          </button>

          {/* Pro Tab */}
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'pro' ? `${theme.text} scale-105 font-bold` : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-sans font-bold">{t.tabPro}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
