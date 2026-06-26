import React, { useState } from 'react';
import { ServiceProvider, Booking } from '../types';
import { motion } from 'motion/react';
import { TRANSLATIONS, Language } from '../translations';
import {
  Star,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  LogOut,
  Clock,
  UserX,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ProStudioProps {
  providers: ServiceProvider[];
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onRemoveProvider: (providerId: string) => void;
  lang: Language;
  onSwitchTab: (tab: 'browse' | 'bookings' | 'apply' | 'pro') => void;
  currentUser: any;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function ProStudio({
  providers,
  bookings,
  onUpdateBookingStatus,
  onRemoveProvider,
  lang,
  onSwitchTab,
  currentUser,
  onOpenAuth,
  onLogout,
}: ProStudioProps) {
  const t = TRANSLATIONS[lang];
  
  // Use logged in professional's provider ID
  const selectedProId = currentUser?.role === 'pro' ? currentUser.providerId : '';

  // ONLY show providers who are part of the Mtrini Work Program
  const registeredPros = providers.filter((p) => p.isWorkProgramParticipant === true);

  // Find active profile among registered ones
  const currentPro = registeredPros.find((p) => p.id === selectedProId);

  // If a worker removes their profile, we handle it
  const handleLeaveProgram = () => {
    if (!currentPro) return;
    const confirmed = window.confirm(t.leaveProgramConfirm);
    if (confirmed) {
      onRemoveProvider(currentPro.id);
      onLogout();
      alert(t.proLeaveSuccess);
    }
  };

  // Filter bookings for this professional
  const proBookings = bookings.filter((b) => b.providerId === selectedProId);

  // Stats calculation
  const completedBookings = proBookings.filter((b) => b.status === 'completed');
  const pendingBookings = proBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  
  // Estimated earnings: Sum of completed jobs' estimates
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalPriceEstimate, 0);

  // If not logged in as a Professional, show a beautiful promo login gate
  if (!currentUser || currentUser.role !== 'pro' || !currentPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-xl mx-auto my-6 space-y-6 animate-in fade-in slide-in-from-bottom-5"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center border border-slate-800 mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="font-display text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {lang === 'en' ? 'Professional Space' : lang === 'fr' ? 'Espace Professionnel' : 'فضاء الحرفيين'}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono font-bold tracking-wider">
            {lang === 'en' ? 'Verified Work Program' : lang === 'fr' ? 'Programme de travail vérifié' : 'برنامج العمل الموثوق'}
          </p>
          
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl my-6 text-center">
            <p className="text-xs md:text-sm text-slate-600 font-sans leading-relaxed">
              {lang === 'en' 
                ? 'Welcome! Please log in to your Professional account to access your personal dashboard, manage client bookings, track earnings, and update your profile.' 
                : lang === 'fr'
                ? 'Bienvenue ! Veuillez vous connecter à votre compte Professionnel pour accéder à votre tableau de bord personnel, gérer vos réservations, suivre vos gains et modifier votre profil.'
                : 'مرحباً بك! عافاك سجل الدخول لحسابك المهني باش تدخل للوحة التحكم الخاصة بك، تسير طلبات الكليان، تتبع الأرباح، وتعدل الملف الشخصي ديالك.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenAuth}
              className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-sans font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer text-center border border-slate-950 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{lang === 'en' ? 'Log In to Professional Account' : lang === 'fr' ? 'Se connecter au compte Pro' : 'تسجيل الدخول لحساب الحرفيين'}</span>
            </button>
            <button
              onClick={() => onSwitchTab('apply')}
              className="w-full py-3 px-4 bg-white text-slate-800 rounded-xl font-sans font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer text-center border border-slate-300 shadow-sm"
            >
              {lang === 'en' ? "Don't have a profile? List Your Service" : lang === 'fr' ? "Pas de profil ? Enregistrez votre activité" : 'ما عندكش حساب؟ سجل الخدمة ديالك دابا'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto space-y-6"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header Dashboard Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.statusOnline}
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            {currentPro.name}
            {currentPro.isVerified && (
              <ShieldCheck className="w-5 h-5 text-emerald-500 fill-emerald-100 shrink-0" />
            )}
          </h2>
          <p className="text-xs text-slate-400 font-mono uppercase mt-0.5 tracking-wider">
            {currentPro.category} • {currentPro.city}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 text-xs font-sans font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Log Out' : lang === 'fr' ? 'Déconnexion' : 'خروج'}
        </button>
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.activeDemands}</span>
          <span className="text-xl md:text-2xl font-display font-black text-slate-900 mt-2">{pendingBookings.length}</span>
        </div>
        
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.jobsDone}</span>
          <span className="text-xl md:text-2xl font-display font-black text-slate-900 mt-2">{completedBookings.length}</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{t.totalEarnings}</span>
          <span className="text-base md:text-xl font-display font-black text-slate-900 mt-2">{totalEarnings} MAD</span>
        </div>
      </div>

      {/* List of demands / client reservations */}
      <div className="space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-display text-lg font-extrabold text-slate-800 uppercase">
            {lang === 'en' ? 'Client Service Demands' : lang === 'fr' ? 'Demandes de Services Clients' : 'طلبات حجز الخدمات'}
          </h3>
        </div>

        {proBookings.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 border-dashed rounded-3xl p-8 text-center text-slate-500 text-xs">
            {t.noActiveDemands}
          </div>
        ) : (
          <div className="space-y-4">
            {proBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden"
              >
                {/* Header status badge & date */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3">
                  <span className="font-mono text-[9px] text-slate-400">ID: {booking.id.toUpperCase()}</span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    booking.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : booking.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Client contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">{lang === 'en' ? 'Client Name' : 'Nom Client'}</span>
                    <h4 className="font-display text-base font-extrabold text-slate-900">{booking.clientName}</h4>
                    <p className="text-xs font-sans text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <a href={`tel:${booking.clientPhone}`} className="hover:underline font-semibold text-emerald-600">
                        {booking.clientPhone}
                      </a>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">{t.addressLabel}</span>
                    <p className="text-xs text-slate-700 font-medium flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{booking.clientAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Job Description */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-50 text-xs text-slate-600 mb-4">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">{lang === 'en' ? 'Work description' : 'Description du travail'}</span>
                  <p className="italic">"{booking.jobDescription}"</p>
                  <div className="flex gap-4 mt-3 pt-2 border-t border-slate-200/50 font-mono text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {booking.bookingDate} @ {booking.bookingTime}
                    </span>
                    <span>•</span>
                    <span>{booking.totalPriceEstimate} MAD ({t.priceEstimate})</span>
                  </div>
                </div>

                {/* Accept / Complete Controls */}
                {booking.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                      className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-xs font-sans font-bold cursor-pointer shadow-xs transition-colors"
                    >
                      {lang === 'en' ? 'Decline' : 'Décliner'}
                    </button>
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'completed')}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-sans font-bold cursor-pointer border border-slate-950 shadow-sm transition-colors"
                    >
                      {lang === 'en' ? 'Complete Job' : 'Marquer comme fait'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List of client reviews */}
      {currentPro.reviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-slate-500" />
            {lang === 'en' ? 'Client Reviews' : 'Avis des Clients'} ({currentPro.reviews.length})
          </h3>
          <div className="space-y-3">
            {currentPro.reviews.map((rev) => (
              <div key={rev.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs font-bold text-slate-800">{rev.authorName}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 italic font-sans">"{rev.text}"</p>
                <span className="text-[9px] font-mono text-slate-400 mt-1 block">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dangerous/Exit program settings */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-display text-sm font-black text-slate-900">{t.leaveProgramBtn}</h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
            {lang === 'en'
              ? 'Permanently delete your service profile listing from Casablanca & Rabat and exit the program.'
              : 'Supprimez définitivement votre profil professionnel de Casablanca & Rabat.'}
          </p>
        </div>

        <button
          onClick={handleLeaveProgram}
          className="px-4 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <UserX className="w-4 h-4 inline-block mr-1.5 ml-1.5 -mt-0.5" />
          {t.leaveProgramBtn}
        </button>
      </div>
    </motion.div>
  );
}
