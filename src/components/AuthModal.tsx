import React, { useState } from 'react';
import { MoroccoCity, ServiceCategory, ServiceProvider } from '../types';
import { Language } from '../translations';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Plus
} from 'lucide-react';

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  role: 'client' | 'pro';
  name: string;
  phone: string;
  city: MoroccoCity;
  address?: string; // client only
  providerId?: string; // pro only
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: UserAccount, newProvider?: ServiceProvider) => void;
  providers: ServiceProvider[];
}

const AUTH_T = {
  en: {
    titleLogIn: "Log In to Your Account",
    titleSignUp: "Create a Free Account",
    subtitle: "Connect with trusted service providers in Morocco",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name",
    phone: "Moroccan Phone Number",
    city: "City",
    address: "Home Address (Optional)",
    roleClient: "Client (I need services)",
    rolePro: "Professional (I want to offer services)",
    btnLogIn: "Log In",
    btnSignUp: "Register Account",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    switchSignUp: "Sign Up Now",
    switchLogIn: "Log In Now",
    invalidCredentials: "Invalid email or password.",
    emailExists: "This email is already registered.",
    requiredFields: "Please fill in all required fields.",
    phoneInvalid: "Please enter a valid Moroccan number (starting with 06 or 07).",
    // Pro details
    category: "Service Category",
    rate: "Hourly Rate (MAD)",
    experience: "Years of Experience",
    skills: "Specialized Skills (Comma separated)",
    bio: "About your experience (Minimum 30 characters)",
    plumber: "Plumber",
    electrician: "Electrician",
    painter: "Painter",
    cleaner: "Cleaner",
    verificationDeclaration: "I declare that all information is accurate and I am ready to offer quality work.",
    successClient: "Registered successfully! You can now book services faster.",
    successPro: "Registered and listed! Your profile is now live on the platform.",
    successLogin: "Logged in successfully!",
  },
  fr: {
    titleLogIn: "Connexion à votre compte",
    titleSignUp: "Créer un compte gratuit",
    subtitle: "Connectez-vous avec des professionnels de confiance au Maroc",
    email: "Adresse Email",
    password: "Mot de passe",
    fullName: "Nom Complet",
    phone: "Numéro de Téléphone Marocain",
    city: "Ville",
    address: "Adresse de Domicile (Optionnel)",
    roleClient: "Client (J'ai besoin de services)",
    rolePro: "Professionnel (Je propose des services)",
    btnLogIn: "Se Connecter",
    btnSignUp: "S'inscrire",
    noAccount: "Vous n'avez pas de compte ?",
    hasAccount: "Vous avez déjà un compte ?",
    switchSignUp: "S'inscrire maintenant",
    switchLogIn: "Se connecter",
    invalidCredentials: "Email ou mot de passe incorrect.",
    emailExists: "Cet email est déjà enregistré.",
    requiredFields: "Veuillez remplir tous les champs obligatoires.",
    phoneInvalid: "Numéro marocain invalide (doit commencer par 06 ou 07).",
    category: "Catégorie de Service",
    rate: "Tarif horaire (MAD)",
    experience: "Années d'expérience",
    skills: "Compétences clés (séparées par des virgules)",
    bio: "À propos de votre expérience (Minimum 30 caractères)",
    plumber: "Plombier",
    electrician: "Électricien",
    painter: "Peintre",
    cleaner: "Nettoyeur",
    verificationDeclaration: "Je déclare que ces informations sont exactes et je m'engage à fournir un service de qualité.",
    successClient: "Inscription réussie ! Vous pouvez désormais réserver plus rapidement.",
    successPro: "Inscription et publication réussies ! Votre profil est en ligne.",
    successLogin: "Connexion réussie !",
  },
  ar: {
    titleLogIn: "تسجيل الدخول إلى حسابك",
    titleSignUp: "إنشاء حساب مجاني جديد",
    subtitle: "تواصل مع أحسن الحرفيين الموثوقين فالمغرب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف المغربي",
    city: "المدينة",
    address: "عنوان المنزل (اختياري)",
    roleClient: "كليان (محتاج خدمات)",
    rolePro: "حرفي (بغيت نخدم ونقدم خدمات)",
    btnLogIn: "تسجيل الدخول",
    btnSignUp: "تسجيل الحساب",
    noAccount: "ما عندكش حساب؟",
    hasAccount: "عندك حساب ديجا؟",
    switchSignUp: "سجل حساب دابا",
    switchLogIn: "سجل الدخول دابا",
    invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    emailExists: "هاد البريد الإلكتروني مسجل ديجا.",
    requiredFields: "عافاك عمر كاع الخانات الضرورية.",
    phoneInvalid: "عافاك دخل رقم هاتف مغربي صحيح (كيبدا بـ 06 أو 07).",
    category: "نوع الخدمة",
    rate: "ثمن الساعة (درهم)",
    experience: "سنين الخبرة",
    skills: "المهارات الخاصة بك (فرق بيناتهم بفاصلة)",
    bio: "نبذة تعريفية على الخبرة ديالك (30 حرف على الأقل)",
    plumber: "رصاص (بلومبيي)",
    electrician: "كهربائي (تريسيان)",
    painter: "صباغ",
    cleaner: "منظف",
    verificationDeclaration: "أصرح أن كاع المعلومات صحيحة وأنا مستعد لتقديم خدمة بجودة عالية.",
    successClient: "تم التسجيل بنجاح! دابا تقدر تحجز بطريقة أسرع.",
    successPro: "تم التسجيل بنجاح والملف ديالك دابا مباشر وكايشوفوه الكليان.",
    successLogin: "تم تسجيل الدخول بنجاح!",
  }
};

export default function AuthModal({ isOpen, onClose, lang, onAuthSuccess, providers }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'client' | 'pro'>('client');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<MoroccoCity>('Casablanca');
  const [address, setAddress] = useState('');

  // Pro Fields
  const [category, setCategory] = useState<ServiceCategory>('plumber');
  const [rate, setRate] = useState<number>(100);
  const [experience, setExperience] = useState<number>(3);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = AUTH_T[lang];

  if (!isOpen) return null;

  const validatePhone = (p: string) => {
    const clean = p.replace(/\s+/g, '');
    const phoneRegex = /^(0|\+212)[67]\d{8}$/;
    return phoneRegex.test(clean);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Read stored users
    const savedUsersStr = localStorage.getItem('mtrini_users');
    const savedUsers: UserAccount[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    if (isLogin) {
      // LOGIN FLOW
      if (!email || !password) {
        setError(t.requiredFields);
        return;
      }

      const foundUser = savedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      );

      if (!foundUser) {
        setError(t.invalidCredentials);
        return;
      }

      setSuccess(t.successLogin);
      setTimeout(() => {
        onAuthSuccess(foundUser);
        onClose();
        setSuccess(null);
        setPassword('');
      }, 1000);
    } else {
      // SIGN UP FLOW
      if (!email || !password || !name || !phone) {
        setError(t.requiredFields);
        return;
      }

      if (!validatePhone(phone)) {
        setError(t.phoneInvalid);
        return;
      }

      const emailExists = savedUsers.some(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (emailExists) {
        setError(t.emailExists);
        return;
      }

      if (role === 'pro') {
        if (!bio.trim() || bio.length < 30) {
          setError(lang === 'en' ? 'About bio must be at least 30 characters.' : lang === 'fr' ? 'La biographie doit faire au moins 30 caractères.' : 'الوصف التعريفي خاص يكون فيه 30 حرف على الأقل.');
          return;
        }
        if (!declarationAccepted) {
          setError(lang === 'en' ? 'Please accept the declaration.' : lang === 'fr' ? 'Veuillez accepter la déclaration.' : 'عافاك وافق على التصريح أولاً.');
          return;
        }
      }

      const newUserId = `usr-${Date.now()}`;
      let linkedProviderId: string | undefined;
      let newProvider: ServiceProvider | undefined;

      if (role === 'pro') {
        linkedProviderId = `pro-${Date.now()}`;
        const skillsArray = skills
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        newProvider = {
          id: linkedProviderId,
          name: name,
          city: city,
          category: category,
          rate: rate,
          rateUnit: 'hour',
          phone: phone,
          experienceYears: experience,
          bio: bio,
          skills: skillsArray.length > 0 ? skillsArray : ['General Service'],
          rating: 5.0,
          reviewsCount: 0,
          reviews: [],
          isVerified: false,
          completedJobs: 0,
          isWorkProgramParticipant: true
        };
      }

      const newUser: UserAccount = {
        id: newUserId,
        email: email.toLowerCase().trim(),
        password: password,
        role: role,
        name: name,
        phone: phone,
        city: city,
        address: role === 'client' ? address : undefined,
        providerId: linkedProviderId,
      };

      // Persist to users array
      const updatedUsers = [...savedUsers, newUser];
      localStorage.setItem('mtrini_users', JSON.stringify(updatedUsers));

      setSuccess(role === 'client' ? t.successClient : t.successPro);
      setTimeout(() => {
        onAuthSuccess(newUser, newProvider);
        onClose();
        setSuccess(null);
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setAddress('');
        setBio('');
        setSkills('');
        setDeclarationAccepted(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -15 }}
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 text-white rounded-lg">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 uppercase text-sm md:text-base">
                {isLogin ? t.titleLogIn : t.titleSignUp}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Mtrini Khedma Identity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-grow space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans font-semibold rounded-xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans font-semibold rounded-xl flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {/* LOGIN / SIGN UP SWITCHER */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`py-2 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                    role === 'client'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.roleClient}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('pro')}
                  className={`py-2 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                    role === 'pro'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.rolePro}
                </button>
              </div>
            )}

            <div className="space-y-3.5">
              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.fullName} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amina Alami"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.email} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. amina@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.password} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone & Location fields (Sign Up only) */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t.phone} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-slate-400" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 0612345678"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t.city} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-slate-400" />
                        </span>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value as MoroccoCity)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <option value="Casablanca">Casablanca</option>
                          <option value="Rabat">Rabat</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address (Client only) */}
                  {role === 'client' && (
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t.address}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 45 Rue de Bourgogne, Maarif"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      />
                    </div>
                  )}

                  {/* PRO ONLY MORE FIELDS */}
                  {role === 'pro' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-3 border-t border-slate-100 overflow-hidden"
                    >
                      <span className="font-mono text-[9px] uppercase font-bold text-slate-400 tracking-widest bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-max mb-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        Professional Profile details
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Category */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {t.category}
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans bg-slate-50/50 cursor-pointer"
                          >
                            <option value="plumber">{t.plumber}</option>
                            <option value="electrician">{t.electrician}</option>
                            <option value="painter">{t.painter}</option>
                            <option value="cleaner">{t.cleaner}</option>
                          </select>
                        </div>

                        {/* Rate */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {t.rate}
                          </label>
                          <input
                            type="number"
                            min="20"
                            value={rate}
                            onChange={(e) => setRate(parseInt(e.target.value) || 100)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Experience */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {t.experience}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={experience}
                            onChange={(e) => setExperience(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-sans bg-slate-50/50"
                          />
                        </div>

                        {/* Skills */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {t.skills}
                          </label>
                          <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. Copper pipes, Clogs, Repairs"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-sans bg-slate-50/50 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t.bio}
                        </label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell potential clients about your experience, training, and the standard of work you provide..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-xs font-sans bg-slate-50/50 placeholder-slate-400 resize-none leading-relaxed"
                        />
                      </div>

                      {/* Declaration */}
                      <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={declarationAccepted}
                          onChange={(e) => setDeclarationAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 focus:ring-slate-900 text-slate-900 h-4 w-4"
                        />
                        <span className="text-[10px] font-sans text-slate-500 leading-normal">
                          {t.verificationDeclaration}
                        </span>
                      </label>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* BUTTON SUBMIT */}
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold rounded-xl border border-slate-950 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 mt-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLogin ? <UserCheck className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
              <span>{isLogin ? t.btnLogIn : t.btnSignUp}</span>
            </button>
          </form>

          {/* Alternate switch */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs font-sans font-medium text-slate-500">
            <span>{isLogin ? t.noAccount : t.hasAccount} </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-slate-900 font-bold hover:underline cursor-pointer"
            >
              {isLogin ? t.switchSignUp : t.switchLogIn}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
