import React, { useState } from 'react';
import { Booking } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { Calendar, MapPin, Phone, CheckCircle, XCircle, Clock, Star, MessageSquare } from 'lucide-react';

interface BookingsListProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  onCompleteBooking: (id: string) => void;
  onAddReview: (providerId: string, rating: number, text: string, authorName: string) => void;
  lang: Language;
}

export default function BookingsList({
  bookings,
  onCancelBooking,
  onCompleteBooking,
  onAddReview,
  lang,
}: BookingsListProps) {
  const t = TRANSLATIONS[lang];

  // Keep track of active review forms
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleReviewSubmit = (booking: Booking) => {
    if (!authorName.trim()) {
      setReviewError(lang === 'en' ? 'Please enter your name.' : lang === 'fr' ? 'Veuillez entrer votre nom.' : 'عافاك اكتب سميتك.');
      return;
    }
    if (!reviewText.trim() || reviewText.length < 10) {
      setReviewError(lang === 'en' ? 'Please write a review (at least 10 characters).' : lang === 'fr' ? 'Écrivez un avis (au moins 10 caractères).' : 'عافاك اكتب وصف من 10 حروف على الأقل.');
      return;
    }

    onAddReview(booking.providerId, rating, reviewText, authorName);
    setReviewingBookingId(null);
    setReviewText('');
    setAuthorName('');
    setReviewError(null);
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase">
            <Clock className="w-3.5 h-3.5" />
            {t.statusPending}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {t.statusCompleted}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full uppercase">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            {t.statusCancelled}
          </span>
        );
      default:
        return null;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-10 md:p-14 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] max-w-xl mx-auto my-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{t.noBookingsTitle}</h3>
        <p className="text-sm font-sans text-slate-500 leading-relaxed">
          {t.noBookingsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="border-b border-slate-100 pb-3">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
          {t.myBookings} ({bookings.length})
        </h2>
        <p className="text-xs text-slate-400 mt-1">{t.bookingListSub}</p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.05)] transition-all duration-300 relative overflow-hidden"
          >
            {/* Status & ID Header */}
            <div className="flex justify-between items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                ID: {booking.id.toUpperCase()}
              </span>
              {getStatusBadge(booking.status)}
            </div>

            {/* Provider and Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">{t.professional}</span>
                <h4 className="font-display text-lg font-black text-slate-900 mt-0.5">{booking.providerName}</h4>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">{booking.providerCategory}</p>
              </div>

              <div className="text-left md:text-right" dir="ltr">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">{t.priceEstimate}</span>
                <span className="text-xl font-display font-black text-slate-900 mt-0.5 inline-block">{booking.totalPriceEstimate} MAD</span>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase">({t.payNotice})</span>
              </div>
            </div>

            {/* Client Scheduling & Address */}
            <div className="bg-slate-50/70 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans text-slate-600 mb-4 border border-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-mono uppercase text-slate-400 tracking-wider">Date & Time</span>
                  <span className="font-semibold text-slate-800">{booking.bookingDate} @ {booking.bookingTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-mono uppercase text-slate-400 tracking-wider">Address ({booking.providerCity})</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{booking.clientAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[9px] font-mono uppercase text-slate-400 tracking-wider">Your Phone</span>
                  <span className="font-semibold text-slate-800">{booking.clientPhone}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">{t.jobDescription}</span>
              <p className="text-xs font-sans text-slate-600 mt-1 bg-slate-50/30 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                "{booking.jobDescription}"
              </p>
            </div>

            {/* Client Controls */}
            {booking.status === 'pending' && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 justify-end">
                <button
                  onClick={() => onCancelBooking(booking.id)}
                  className="px-4 py-2 text-xs font-sans font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={() => onCompleteBooking(booking.id)}
                  className="px-4 py-2 text-xs font-sans font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  {t.completeBtn}
                </button>
              </div>
            )}

            {/* Completed state with review trigger */}
            {booking.status === 'completed' && !booking.hasReviewed && reviewingBookingId !== booking.id && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setReviewingBookingId(booking.id);
                    setRating(5);
                    setReviewText('');
                    setReviewError(null);
                  }}
                  className="px-4 py-2 text-xs font-sans font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.leaveReviewBtn}
                </button>
              </div>
            )}

            {/* Already Reviewed state */}
            {booking.status === 'completed' && booking.hasReviewed && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {lang === 'en' ? 'Review Submitted ✓' : lang === 'fr' ? 'Avis Soumis ✓' : 'تم إرسال التقييم ✓'}
                </span>
              </div>
            )}

            {/* Interactive Review Form */}
            {reviewingBookingId === booking.id && (
              <div className="mt-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-display text-sm font-black text-slate-800">{t.reviewFormTitle}</h5>
                  <button
                    onClick={() => setReviewingBookingId(null)}
                    className="text-xs font-mono font-bold text-slate-400 hover:text-slate-600"
                  >
                    {t.closeBtn}
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Rating selection */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      {t.reviewRating}
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className="focus:outline-none transition-transform active:scale-125 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              num <= rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      {t.yourFullName}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Youssef"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-xs font-sans"
                    />
                  </div>

                  {/* Review text field */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      {t.reviewComment}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={t.reviewCommentPlaceholder}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-xs font-sans"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-[10px] font-mono text-red-500 font-semibold">{reviewError}</p>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setReviewingBookingId(null)}
                      className="px-3.5 py-1.5 text-xs font-sans font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {t.closeBtn}
                    </button>
                    <button
                      onClick={() => handleReviewSubmit(booking)}
                      className="px-4 py-1.5 text-xs font-sans font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {t.submitReviewBtn}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
