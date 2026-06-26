import React from 'react';
import { TRANSLATIONS, Language } from '../translations';
import { X, Globe, RefreshCw, Check, ShieldAlert, Coins, Palette, EyeOff, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onResetData: () => void;
  currency: 'MAD' | 'USD' | 'EUR';
  onCurrencyChange: (currency: 'MAD' | 'USD' | 'EUR') => void;
  accentColor: 'slate' | 'emerald' | 'blue' | 'amber' | 'rose';
  onAccentColorChange: (color: 'slate' | 'emerald' | 'blue' | 'amber' | 'rose') => void;
  hideDefaultWorkers: boolean;
  onHideDefaultWorkersChange: (hide: boolean) => void;
  onDeleteDefaultWorkers: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  onLanguageChange,
  onResetData,
  currency,
  onCurrencyChange,
  accentColor,
  onAccentColorChange,
  hideDefaultWorkers,
  onHideDefaultWorkersChange,
  onDeleteDefaultWorkers,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  // Helper translations for the new settings fields
  const lSettings: Record<Language, Record<string, string>> = {
    en: {
      currencyTitle: "Display Currency",
      currencyDesc: "Convert rates in real-time",
      accentTitle: "Accent Theme Color",
      accentDesc: "Customize the app aesthetic",
      hideDefaultTitle: "Hide Default/AI Workers",
      hideDefaultDesc: "Show only custom registered workers",
      deleteDefaultTitle: "Permanently Delete Default Workers",
      deleteDefaultDesc: "Instantly wipes all initial pre-populated workers",
      deleteDefaultBtn: "Wipe Default Directory",
      accentSlate: "Charcoal Slate",
      accentEmerald: "Moroccan Emerald",
      accentBlue: "Majorelle Blue",
      accentAmber: "Desert Amber",
      accentRose: "Riad Rose",
    },
    fr: {
      currencyTitle: "Devise d'affichage",
      currencyDesc: "Convertir les tarifs en temps réel",
      accentTitle: "Couleur de l'accent",
      accentDesc: "Personnaliser l'esthétique de l'application",
      hideDefaultTitle: "Masquer les prestataires par défaut",
      hideDefaultDesc: "Afficher uniquement les travailleurs personnalisés",
      deleteDefaultTitle: "Supprimer définitivement les prestataires par défaut",
      deleteDefaultDesc: "Efface instantanément tous les profils pré-remplis",
      deleteDefaultBtn: "Effacer l'annuaire par défaut",
      accentSlate: "Charcoal Slate",
      accentEmerald: "Émeraude Marocaine",
      accentBlue: "Bleu Majorelle",
      accentAmber: "Ambre du Désert",
      accentRose: "Rose Riad",
    },
    ar: {
      currencyTitle: "عملة العرض",
      currencyDesc: "تحويل الأسعار في الوقت الفعلي",
      accentTitle: "لون المظهر الأساسي",
      accentDesc: "تخصيص جمالية التطبيق",
      hideDefaultTitle: "إخفاء العمال الافتراضيين",
      hideDefaultDesc: "عرض العمال الذين قمت بإضافتهم فقط",
      deleteDefaultTitle: "حذف العمال الافتراضيين نهائياً",
      deleteDefaultDesc: "يمسح تماماً جميع العمال والملفات المحملة مسبقاً",
      deleteDefaultBtn: "مسح الدليل الافتراضي",
      accentSlate: "رمادي داكن",
      accentEmerald: "زمردي مغربي",
      accentBlue: "أزرق ماجوريل",
      accentAmber: "عنبر صحراوي",
      accentRose: "وردي الرياض",
    }
  };

  const ls = lSettings[lang];

  const accentColors = [
    { key: 'slate' as const, bg: 'bg-slate-900', border: 'border-slate-950', name: ls.accentSlate },
    { key: 'emerald' as const, bg: 'bg-emerald-600', border: 'border-emerald-700', name: ls.accentEmerald },
    { key: 'blue' as const, bg: 'bg-blue-600', border: 'border-blue-700', name: ls.accentBlue },
    { key: 'amber' as const, bg: 'bg-amber-500', border: 'border-amber-600', name: ls.accentAmber },
    { key: 'rose' as const, bg: 'bg-rose-500', border: 'border-rose-600', name: ls.accentRose },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 p-6 md:p-8 w-full max-w-lg rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-800 shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6 flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-slate-600" />
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
            {t.settingsTitle}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Language selection */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              {t.selectLanguage}
            </label>
            <div className="grid grid-cols-3 gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {/* English */}
              <button
                onClick={() => onLanguageChange('en')}
                className={`p-2.5 border font-display font-bold text-xs flex flex-col items-center gap-1.5 transition-colors rounded-lg cursor-pointer shadow-xs ${
                  lang === 'en'
                    ? 'bg-slate-900 border-slate-950 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </button>

              {/* French */}
              <button
                onClick={() => onLanguageChange('fr')}
                className={`p-2.5 border font-display font-bold text-xs flex flex-col items-center gap-1.5 transition-colors rounded-lg cursor-pointer shadow-xs ${
                  lang === 'fr'
                    ? 'bg-slate-900 border-slate-950 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🇫🇷</span>
                <span>Français</span>
              </button>

              {/* Darija */}
              <button
                onClick={() => onLanguageChange('ar')}
                className={`p-2.5 border font-display font-bold text-xs flex flex-col items-center gap-1.5 transition-colors rounded-lg cursor-pointer shadow-xs ${
                  lang === 'ar'
                    ? 'bg-slate-900 border-slate-950 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🇲🇦</span>
                <span className="font-sans">Darija</span>
              </button>
            </div>
          </div>

          {/* Currency selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-slate-500" />
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  {ls.currencyTitle}
                </label>
                <p className="text-[10px] text-slate-400 font-sans">{ls.currencyDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['MAD', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={`py-2 border font-display font-bold text-xs transition-colors rounded-lg cursor-pointer shadow-xs ${
                    currency === curr
                      ? 'bg-slate-900 border-slate-950 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color selection */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-500" />
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  {ls.accentTitle}
                </label>
                <p className="text-[10px] text-slate-400 font-sans">{ls.accentDesc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {accentColors.map((color) => (
                <button
                  key={color.key}
                  onClick={() => onAccentColorChange(color.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full transition-all cursor-pointer shadow-xs text-xs font-bold ${
                    accentColor === color.key
                      ? 'bg-slate-900 border-slate-950 text-white font-black'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${color.bg} ${color.border} border shadow-xs inline-block`} />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hide/Show Predefined Workers */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                    {ls.hideDefaultTitle}
                  </label>
                  <p className="text-[10px] text-slate-400 font-sans">{ls.hideDefaultDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onHideDefaultWorkersChange(!hideDefaultWorkers)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hideDefaultWorkers ? 'bg-slate-900' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    hideDefaultWorkers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Permanent Wipe Default Workers */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2.5">
              <Trash2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  {ls.deleteDefaultTitle}
                </label>
                <p className="text-[10px] font-sans text-slate-400 mt-0.5 leading-relaxed">
                  {ls.deleteDefaultDesc}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (confirm(lang === 'en' ? 'Are you sure you want to permanently delete all default workers from this device?' : lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer définitivement tous les prestataires par défaut ?' : 'واش تيقنتِ بلي بغيتِ تمسح كاع العمال الافتراضيين نهائياً؟')) {
                  onDeleteDefaultWorkers();
                }
              }}
              className="w-full py-2.5 border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors rounded-lg cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {ls.deleteDefaultBtn}
            </button>
          </div>

          {/* Reset App Data */}
          <div className="border-t border-slate-100 pt-4 space-y-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  {t.resetData}
                </label>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5 leading-relaxed">
                  {t.resetDataDesc}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data? This will restore everything to initial defaults.')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors rounded-lg cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.resetBtn}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold border border-slate-950 shadow-sm transition-colors cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
