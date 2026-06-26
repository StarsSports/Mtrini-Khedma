import React, { useState, useEffect } from 'react';
import { ServiceProvider, Booking } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { X, Calendar, Clock, MapPin, Phone, User, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface BookingModalProps {
  provider: ServiceProvider;
  onClose: () => void;
  onSubmit: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  lang: Language;
  currency?: 'MAD' | 'USD' | 'EUR';
  currentUser?: any;
}

export default function BookingModal({ provider, onClose, onSubmit, lang, currency = 'MAD', currentUser }: BookingModalProps) {
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [clientAddress, setClientAddress] = useState(currentUser?.address || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [durationHours, setDurationHours] = useState('2'); // Default to 2 hours estimate
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = TRANSLATIONS[lang];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientName.trim()) newErrors.clientName = t.nameRequired;
    
    // Moroccan phone format check: starts with 06, 07, or +2126, +2127
    const cleanPhone = clientPhone.replace(/\s+/g, '');
    const phoneRegex = /^(0|\+212)[67]\d{8}$/;
    if (!clientPhone.trim()) {
      newErrors.clientPhone = t.phoneRequired;
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.clientPhone = t.phoneInvalid;
    }

    if (!clientAddress.trim()) newErrors.clientAddress = t.addressRequired;
    if (!bookingDate) newErrors.bookingDate = t.dateRequired;
    if (!bookingTime) newErrors.bookingTime = t.timeRequired;
    if (!jobDescription.trim()) newErrors.jobDescription = t.descriptionRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const hours = parseInt(durationHours, 10);
    const estimatedPrice = provider.rate * hours;

    onSubmit({
      providerId: provider.id,
      providerName: provider.name,
      providerCategory: provider.category,
      providerCity: provider.city,
      clientName,
      clientPhone,
      clientAddress,
      bookingDate,
      bookingTime,
      jobDescription,
      totalPriceEstimate: estimatedPrice,
    });
  };

  const formatLocalPrice = (amount: number) => {
    if (currency === 'USD') {
      return `${Math.round(amount * 0.10)} USD`;
    }
    if (currency === 'EUR') {
      return `${Math.round(amount * 0.091)} EUR`;
    }
    return lang === 'ar' ? `${amount} درهم` : `${amount} MAD`;
  };

  // Calculate quick estimate preview
  const currentEstimate = provider.rate * parseInt(durationHours, 10);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 p-6 md:p-8 w-full max-w-xl rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-800 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
            {t.bookingRequest}
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 mt-3">
            {t.bookProvider.replace('{name}', provider.name)}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Category: {provider.category.toUpperCase()} • Location: {provider.city}, Morocco
          </p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
                {t.yourFullName}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                  <User className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Yassine El Fassi"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.clientName ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
                />
              </div>
              {errors.clientName && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.clientName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
                {t.phoneLabel}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                  <Phone className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. 0661223344"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.clientPhone ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
                />
              </div>
              {errors.clientPhone && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.clientPhone}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.addressLabel} ({provider.city})
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <MapPin className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="e.g. 45 Rue de Bourgogne, Maârif"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.clientAddress ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
              />
            </div>
            {errors.clientAddress && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.clientAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
                {t.dateLabel}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.bookingDate ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
                />
              </div>
              {errors.bookingDate && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.bookingDate}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
                {t.timeLabel}
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                  <Clock className="w-4 h-4 text-slate-400" />
                </span>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.bookingTime ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm bg-white cursor-pointer appearance-none`}
                >
                  <option value="">{t.selectTimePlaceholder}</option>
                  <option value="08:00 - 10:00">{t.morningSlot1}</option>
                  <option value="10:00 - 12:00">{t.morningSlot2}</option>
                  <option value="12:00 - 14:00">{t.middaySlot}</option>
                  <option value="14:00 - 16:00">{t.afternoonSlot}</option>
                  <option value="16:00 - 18:00">{t.eveningSlot}</option>
                  <option value="18:00 - 20:00">{t.lateEveningSlot}</option>
                </select>
                <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400 font-bold text-xs`}>
                  ▼
                </span>
              </div>
              {errors.bookingTime && (
                <p className="text-[11px] font-mono text-red-600 mt-1">{errors.bookingTime}</p>
              )}
            </div>
          </div>

          {/* Duration estimate */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.durationLabel}
            </label>
            <div className="relative">
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 focus:ring-slate-900 focus:border-slate-900 focus:outline-none font-sans text-sm bg-white cursor-pointer appearance-none"
              >
                <option value="1">{t.hourQuick}</option>
                <option value="2">{t.hourStandard}</option>
                <option value="4">{t.halfDay}</option>
                <option value="8">{t.fullDay}</option>
              </select>
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400 font-bold text-xs`}>
                ▼
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.descriptionLabel}
            </label>
            <textarea
              rows={3}
              placeholder={t.descriptionLabel}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.jobDescription ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
            />
            {errors.jobDescription && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.jobDescription}</p>
            )}
          </div>

          {/* Estimate Card */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-700 block uppercase tracking-wider">{t.priceEstimate}</span>
                <span className="text-[10px] text-slate-400 font-mono leading-tight block mt-0.5">{t.payNotice}</span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2 pr-2">
              <span className="text-xl font-display font-black text-slate-900 block">{formatLocalPrice(currentEstimate)}</span>
              <span className="text-[9px] text-slate-400 font-mono block">({formatLocalPrice(provider.rate)}/{provider.rateUnit === 'hour' ? t.hourLabel : t.jobLabel} × {durationHours}h)</span>
            </div>
          </div>

          {/* Pay after Service Notice */}
          <p className="text-[10px] font-mono text-slate-400 leading-relaxed text-center py-1">
            {t.payNotice}
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold tracking-wide uppercase rounded-lg border border-slate-950 shadow-sm transition-colors text-sm cursor-pointer"
          >
            {t.confirmBooking}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
