import React, { useState } from 'react';
import { ServiceCategory, MoroccoCity, ServiceProvider } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { Briefcase, MapPin, Phone, User, Check, Sparkles } from 'lucide-react';

interface ApplicationFormProps {
  onSuccess: (newProvider: Omit<ServiceProvider, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'isVerified' | 'completedJobs'>) => void;
  lang: Language;
}

export default function ApplicationForm({ onSuccess, lang }: ApplicationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<MoroccoCity>('Casablanca');
  const [category, setCategory] = useState<ServiceCategory>('plumber');
  const [rate, setRate] = useState<number>(100);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = TRANSLATIONS[lang];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t.nameRequired;
    
    const cleanPhone = phone.replace(/\s+/g, '');
    const phoneRegex = /^(0|\+212)[67]\d{8}$/;
    if (!phone.trim()) {
      newErrors.phone = t.phoneRequired;
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = t.phoneInvalid;
    }

    if (!bio.trim() || bio.length < 30) {
      newErrors.bio = lang === 'en' ? 'Please write a bio of at least 30 characters.' : lang === 'fr' ? 'Veuillez écrire au moins 30 caractères.' : 'عافاك اكتب وصف من 30 حرف على الأقل.';
    }

    if (!skills.trim()) {
      newErrors.skills = lang === 'en' ? 'Please enter at least 1 or 2 skills.' : lang === 'fr' ? 'Entrez au moins 1 ou 2 compétences.' : 'عافاك اكتب مهارة وحدة على الأقل.';
    }

    if (rate <= 0) {
      newErrors.rate = t.hourlyRate;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse skills list
    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSuccess({
      name,
      category,
      city,
      rate,
      rateUnit: 'hour',
      phone,
      experienceYears,
      bio,
      skills: skillsArray.length > 0 ? skillsArray : ['General Service'],
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setCity('Casablanca');
    setCategory('plumber');
    setRate(100);
    setExperienceYears(3);
    setBio('');
    setSkills('');
    setSubmitted(false);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="bg-white border border-slate-100 p-8 text-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] max-w-2xl mx-auto my-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 animate-bounce text-emerald-600" />
        </div>
        <h3 className="font-display text-2xl font-extrabold text-slate-900 mb-3">
          {t.formSuccessTitle}
        </h3>
        <p className="text-sm font-sans text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          {t.formSuccessDesc}
        </p>
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 max-w-sm mx-auto mb-6 text-left">
          <p className="text-xs font-mono font-bold uppercase text-slate-400 mb-2 tracking-wider">{t.formSuccessSummary}</p>
          <div className="space-y-1.5 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-400 font-mono text-xs uppercase inline-block w-20">Name:</span> {name}</p>
            <p><span className="font-semibold text-slate-400 font-mono text-xs uppercase inline-block w-20">Category:</span> {category.toUpperCase()}</p>
            <p><span className="font-semibold text-slate-400 font-mono text-xs uppercase inline-block w-20">City:</span> {city}</p>
            <p><span className="font-semibold text-slate-400 font-mono text-xs uppercase inline-block w-20">Rate:</span> {rate} MAD/hour</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold uppercase rounded-xl shadow-md hover:shadow-lg transition-all text-xs cursor-pointer active:scale-[0.98]"
        >
          {t.formSuccessReset}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] max-w-3xl mx-auto my-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-6 border-b border-slate-100 pb-5">
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          {t.formOnboardTitle}
        </span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 mt-3 flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          {t.formMainTitle}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.formSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formProfName}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <User className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="e.g. Rachid El Ghandour"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formPhone}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <Phone className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="tel"
                placeholder="e.g. 0661223344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm transition-all bg-slate-50/50 hover:bg-slate-50`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formCity}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <MapPin className="w-4 h-4 text-slate-400" />
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as MoroccoCity)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-sm appearance-none bg-white cursor-pointer`}
              >
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
              </select>
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400 font-bold text-xs`}>
                ▼
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formCategory}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <Briefcase className="w-4 h-4 text-slate-400" />
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className={`w-full ${lang === 'ar' ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-sm appearance-none bg-white cursor-pointer`}
              >
                <option value="plumber">{t.plumbers}</option>
                <option value="electrician">{t.electricians}</option>
                <option value="painter">{t.painters}</option>
                <option value="cleaner">{t.cleaners}</option>
              </select>
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400 font-bold text-xs`}>
                ▼
              </span>
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formRate}
            </label>
            <div className="relative">
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none font-mono text-xs text-slate-400 font-bold`}>
                <span>MAD</span>
              </span>
              <input
                type="number"
                min={20}
                max={1000}
                value={rate}
                onChange={(e) => setRate(parseInt(e.target.value, 10) || 0)}
                className={`w-full ${lang === 'ar' ? 'pr-12 pl-3.5' : 'pl-12 pr-3.5'} py-2.5 rounded-xl border ${errors.rate ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm bg-slate-50/50 hover:bg-slate-50`}
              />
            </div>
            {errors.rate && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.rate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Experience Years */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formExp}
            </label>
            <div className="relative">
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-sans text-sm appearance-none bg-white cursor-pointer"
              >
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={4}>4 Years</option>
                <option value={5}>5 Years</option>
                <option value={8}>8+ Years</option>
                <option value={12}>12+ Years</option>
                <option value={15}>15+ Years</option>
              </select>
              <span className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-slate-400 font-bold text-xs`}>
                ▼
              </span>
            </div>
          </div>

          {/* Skills Tags */}
          <div>
            <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
              {t.formSkills}
            </label>
            <input
              type="text"
              placeholder="e.g. Copper pipes, Emergency leak, Faucet repair"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.skills ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm bg-slate-50/50 hover:bg-slate-50`}
            />
            {errors.skills && (
              <p className="text-[11px] font-mono text-red-600 mt-1">{errors.skills}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            {t.formBio}
          </label>
          <textarea
            rows={4}
            placeholder="Tell future clients about your background..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.bio ? 'border-red-300 bg-red-50/50 text-red-900' : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'} focus:outline-none focus:ring-1 font-sans text-sm bg-slate-50/50 hover:bg-slate-50`}
          />
          {errors.bio && (
            <p className="text-[11px] font-mono text-red-600 mt-1">{errors.bio}</p>
          )}
        </div>

        {/* Certification declaration */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 flex items-start gap-2.5 text-xs">
          <input
            type="checkbox"
            id="agreement"
            required
            className="mt-0.5 rounded border-slate-300 h-4 w-4 accent-slate-900 cursor-pointer shrink-0"
          />
          <label htmlFor="agreement" className="font-sans text-slate-600 select-none cursor-pointer leading-relaxed">
            {t.formDeclaration}
          </label>
        </div>

        {/* Submit Application button */}
        <button
          type="submit"
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold tracking-wide uppercase rounded-lg border border-slate-950 shadow-sm transition-colors text-sm cursor-pointer"
        >
          {t.formSubmit}
        </button>
      </form>
    </div>
  );
}
