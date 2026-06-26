import React, { useState } from 'react';
import { ServiceProvider } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { Star, MapPin, ShieldCheck, Briefcase, ChevronDown, ChevronUp, Clock, Trash2, Plus, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ProviderCardProps {
  key?: string;
  provider: ServiceProvider;
  onBook: (provider: ServiceProvider) => void;
  lang: Language;
  onDelete?: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onAddReview?: (providerId: string, rating: number, text: string, authorName: string) => void;
  currency?: 'MAD' | 'USD' | 'EUR';
}

export default function ProviderCard({
  provider,
  onBook,
  lang,
  onDelete,
  isFavorite,
  onToggleFavorite,
  onAddReview,
  currency = 'MAD'
}: ProviderCardProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  const formatLocalPrice = (amount: number) => {
    if (currency === 'USD') {
      return `${Math.round(amount * 0.10)} USD`;
    }
    if (currency === 'EUR') {
      return `${Math.round(amount * 0.091)} EUR`;
    }
    return lang === 'ar' ? `${amount} درهم` : `${amount} MAD`;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim()) {
      setFormError(lang === 'en' ? 'Your name is required.' : lang === 'fr' ? 'Votre nom est requis.' : 'الإسم الكامل ضروري.');
      return;
    }
    if (!newReviewText.trim() || newReviewText.length < 5) {
      setFormError(lang === 'en' ? 'Please write a comment (at least 5 characters).' : lang === 'fr' ? 'Veuillez écrire un commentaire (au moins 5 caractères).' : 'عافاك اكتب تعليق كتر من 5 حروف.');
      return;
    }

    if (onAddReview) {
      onAddReview(provider.id, newRating, newReviewText, newAuthorName);
    }
    setNewAuthorName('');
    setNewReviewText('');
    setNewRating(5);
    setFormError(null);
    setShowAddReviewForm(false);
  };

  // Map category to localized key
  const categoryKeys: Record<string, string> = {
    plumber: 'plumbers',
    electrician: 'electricians',
    painter: 'painters',
    cleaner: 'cleaners'
  };

  const localizedCategory = t[categoryKeys[provider.category]] || provider.category;

  const totalReviewsCount = provider.reviews.length;
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = provider.reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden group"
    >
      {/* Inline Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 text-white animate-in fade-in duration-200">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <h4 className="font-display text-base font-black uppercase tracking-tight mb-2">
            {lang === 'en' ? 'Delete Profile?' : lang === 'fr' ? 'Supprimer le profil ?' : 'حذف هاد الحساب؟'}
          </h4>
          <p className="text-xs text-slate-300 max-w-xs mb-6 leading-relaxed">
            {lang === 'en'
              ? `Are you sure you want to permanently remove ${provider.name} from the active directory?`
              : lang === 'fr'
              ? `Êtes-vous sûr de vouloir supprimer définitivement ${provider.name} de l'annuaire ?`
              : `واش تيقنتِ بلي بغيتِ تمسح حساب ${provider.name} بصفة نهائية من الدليل؟`}
          </p>
          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-sans font-bold cursor-pointer transition-colors shadow-sm"
            >
              {lang === 'en' ? 'Cancel' : lang === 'fr' ? 'Annuler' : 'إلغاء'}
            </button>
            <button
              onClick={() => {
                if (onDelete) onDelete(provider.id);
                setShowDeleteConfirm(false);
              }}
              className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-sans font-bold cursor-pointer transition-colors shadow-sm border border-rose-700"
            >
              {lang === 'en' ? 'Delete' : lang === 'fr' ? 'Supprimer' : 'مسح'}
            </button>
          </div>
        </div>
      )}

      {/* Top Section: Category and Verification */}
      <div>
        <div className="flex justify-between items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {localizedCategory}
            </span>
            {provider.isVerified && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-100 bg-emerald-50 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                {t.verified}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Favorite heart toggle button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(provider.id);
                }}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isFavorite
                    ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                }`}
                title={lang === 'en' ? 'Favorite' : lang === 'fr' ? 'Favori' : 'مفضلة'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            {/* Trash Delete profile button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                title={lang === 'en' ? 'Delete Profile' : lang === 'fr' ? 'Supprimer le profil' : 'حذف الحساب'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Name and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-slate-950 transition-colors">
            {provider.name}
          </h3>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 font-mono text-xs font-bold text-amber-700">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {provider.rating.toFixed(1)}
          </div>
        </div>

        {/* Location & Experience */}
        <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-xs font-mono text-slate-500 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{provider.city}, Morocco</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>{provider.experienceYears} {t.experienceYears}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{provider.completedJobs}+ {t.jobsDone}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-slate-600 leading-relaxed mb-5 font-sans">
          {provider.bio}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {provider.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs font-sans px-3 py-1 rounded-lg border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing, Action Buttons */}
      <div className="mt-auto pt-5 border-t border-dashed border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">{t.hourlyRate}</span>
            <span className="text-2xl font-display font-black text-slate-900">
              {formatLocalPrice(provider.rate)} <span className="text-xs font-sans font-semibold text-slate-500">/ {provider.rateUnit === 'hour' ? t.hourLabel : t.jobLabel}</span>
            </span>
          </div>
          <button
            onClick={() => onBook(provider)}
            className="px-5 py-2.5 rounded-lg font-display font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-950 shadow-sm"
          >
            {t.bookNowBtn}
          </button>
        </div>

        {/* Review toggle */}
        <button
          onClick={() => setShowReviews(!showReviews)}
          className="w-full py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-mono text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          {showReviews ? (
            <>
              {t.hideReviews} ({provider.reviewsCount})
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </>
          ) : (
            <>
              {t.showReviews} ({provider.reviewsCount})
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </>
          )}
        </button>

        {/* Collapsible Reviews list */}
        {showReviews && (
          <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                {lang === 'en' ? 'Client feedback' : lang === 'fr' ? 'Avis clients' : 'تقييمات الكليان'}
              </span>
              
              {onAddReview && (
                !showAddReviewForm ? (
                  <button
                    onClick={() => {
                      setShowAddReviewForm(true);
                      setFormError(null);
                    }}
                    className="text-[10px] font-sans font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-slate-700" />
                    {lang === 'en' ? 'Add Review' : lang === 'fr' ? 'Ajouter un avis' : 'إضافة تقييم'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddReviewForm(false)}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {t.closeBtn}
                  </button>
                )
              )}
            </div>

            {/* Visual Rating Breakdown */}
            {provider.reviews.length > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-display font-black text-slate-900 leading-none">{provider.rating.toFixed(1)}</div>
                  <div className="flex justify-center sm:justify-start gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3 h-3 ${
                          starIdx <= Math.round(provider.rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
                    {provider.reviews.length} {provider.reviews.length === 1 ? 'Review' : 'Reviews'}
                  </div>
                </div>

                <div className="flex-1 w-full max-w-xs space-y-1">
                  {starCounts.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="w-2 text-right">{stars}</span>
                      <Star className="w-2 h-2 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-slate-400 font-bold">({count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DIRECT ADD REVIEW FORM */}
            {showAddReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {lang === 'en' ? 'Your Rating' : lang === 'fr' ? 'Votre note' : 'التقييم ديالك'}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <button
                        key={starNum}
                        type="button"
                        onClick={() => setNewRating(starNum)}
                        className="transition-transform active:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starNum <= newRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Your Name' : lang === 'fr' ? 'Votre Nom' : 'سميتك الكاملة'}
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-xs font-sans shadow-xs"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder={lang === 'en' ? 'Describe your experience...' : lang === 'fr' ? 'Décrivez votre expérience...' : 'اكتب كيف كانت تجربتك...'}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-xs font-sans shadow-xs resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-[9px] font-mono text-rose-500 font-bold">{formError}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReviewForm(false);
                      setFormError(null);
                    }}
                    className="px-2.5 py-1 text-[10px] font-sans font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    {t.closeBtn}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[10px] font-sans font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md border border-slate-950 shadow-sm transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? 'Submit' : lang === 'fr' ? 'Soumettre' : 'إرسال'}
                  </button>
                </div>
              </form>
            )}

            {/* REVIEWS LIST */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {provider.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-mono text-center py-4">{t.noReviewsYet}</p>
              ) : (
                provider.reviews.map((review) => (
                  <div key={review.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="font-bold text-xs block text-slate-800">{review.authorName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{review.authorCity} • {review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-mono font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{review.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
