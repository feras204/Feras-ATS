import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Home, Briefcase, Users, LayoutGrid, BarChart3, Settings,
  Search, Plus, Trash2, Edit2, X, Check, Upload, Download,
  Menu, LogOut, Building2, MapPin, DollarSign, Calendar,
  Mail, Phone, User, FileText, Star, Clock, AlertCircle,
  ChevronLeft, ChevronRight, ExternalLink, Filter, Sparkles,
  UserPlus, MessageSquare, TrendingUp, Award, Eye
} from 'lucide-react';

// ============================================================
// إعداد Supabase
// ⚠️ استبدل هذه القيم بمفاتيح مشروعك
// ============================================================
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// مساعدات
// ============================================================
const fmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmtC = (n) => `${fmt(n)} ر.س`;
const fmtDate = (d) => new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const STAGES = [
  { id: 'new', label: 'جديد', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { id: 'screening', label: 'فحص أولي', color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { id: 'interview', label: 'مقابلة', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'offer', label: 'عرض', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'hired', label: 'تم التوظيف', color: 'bg-green-600', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  { id: 'rejected', label: 'مرفوض', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
];

const getStage = (id) => STAGES.find(s => s.id === id) || STAGES[0];

// ============================================================
// التطبيق الرئيسي
// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [publicView, setPublicView] = useState(true); // البداية بالعرض العام
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // تحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setPublicView(false);
      setLoading(false);
    });

    // استمع للتغييرات
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setPublicView(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // التحقق من الرابط للانتقال بين الوضعين
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) setPublicView(false);
  }, []);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-600">جارٍ التحميل...</div>
      </div>
    );
  }

  // إذا كان العرض العام (للمتقدمين)
  if (publicView && !session) {
    return <PublicSite onAdminClick={() => setPublicView(false)} />;
  }

  // إذا لم يكن مسجل دخول - عرض شاشة الدخول
  if (!session) {
    return <LoginPage onPublicClick={() => setPublicView(true)} />;
  }

  // لوحة التحكم للفريق
  return <AdminDashboard session={session} onPublicClick={() => setPublicView(true)} />;
}

// ============================================================
// الموقع العام - للمتقدمين
// ============================================================
function PublicSite({ onAdminClick }) {
  const [view, setView] = useState('jobs'); // jobs, apply
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    if (!error) setJobs(data || []);
    setLoading(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold">فرص العمل</h1>
              <p className="text-xs text-stone-400">انضم إلى فريقنا</p>
            </div>
          </div>
          <button onClick={onAdminClick} className="text-sm text-stone-400 hover:text-white flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>دخول الفريق</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'jobs' && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">الوظائف المتاحة</h2>
              <p className="text-stone-600">اكتشف الفرص الوظيفية المفتوحة وانضم لفريقنا</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-stone-400" />
                <p className="text-stone-600">لا توجد وظائف مفتوحة حالياً</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { setSelectedJob(job); setView('apply'); }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-stone-600 mb-3">
                          {job.department && <div className="flex items-center gap-1"><Building2 className="w-4 h-4" />{job.department}</div>}
                          {job.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</div>}
                          {job.employment_type && <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.employment_type}</div>}
                        </div>
                        <p className="text-sm text-stone-700 line-clamp-2">{job.description}</p>
                        {job.salary_min > 0 && (
                          <div className="mt-3 flex items-center gap-1 text-sm text-emerald-700 font-medium">
                            <DollarSign className="w-4 h-4" />
                            {fmtC(job.salary_min)} - {fmtC(job.salary_max)}
                          </div>
                        )}
                      </div>
                      <button className="flex-shrink-0 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm">
                        تقديم
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'apply' && selectedJob && (
          <ApplyForm job={selectedJob} onBack={() => setView('jobs')} onSuccess={() => setView('success')} />
        )}

        {view === 'success' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-emerald-500 mx-auto flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">تم استلام طلبك بنجاح!</h2>
            <p className="text-stone-600 mb-6">سنراجع طلبك ونتواصل معك قريباً</p>
            <button onClick={() => { setView('jobs'); setSelectedJob(null); }} className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-semibold">
              العودة للوظائف
            </button>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 text-center text-sm text-stone-500 border-t border-stone-200">
        <p>نظام إدارة التوظيف © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// ============================================================
// نموذج التقديم للوظيفة
// ============================================================
function ApplyForm({ job, onBack, onSuccess }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    nationality: 'سعودي',
    experience_years: 0,
    current_position: '',
    current_company: '',
    education: '',
    cover_letter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      setError('الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      let cv_url = null;
      let cv_filename = null;

      // رفع السيرة الذاتية إذا وجدت
      if (cvFile) {
        const fileName = `${Date.now()}_${cvFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, cvFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
        cv_url = urlData.publicUrl;
        cv_filename = cvFile.name;
      }

      // إنشاء المتقدم
      const { error: insertError } = await supabase.from('applicants').insert({
        ...form,
        job_id: job.id,
        cv_url,
        cv_filename,
      });

      if (insertError) throw insertError;
      onSuccess();
    } catch (err) {
      setError('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-stone-600 mb-4 hover:text-slate-900">
        <ChevronRight className="w-4 h-4" />
        <span>العودة للوظائف</span>
      </button>

      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-4">
        <h2 className="text-xl font-bold mb-2">{job.title}</h2>
        <div className="flex flex-wrap gap-3 text-sm text-stone-600 mb-4">
          {job.department && <span>{job.department}</span>}
          {job.location && <span>• {job.location}</span>}
          {job.employment_type && <span>• {job.employment_type}</span>}
        </div>
        {job.description && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-1">الوصف</h4>
            <p className="text-sm text-stone-700 whitespace-pre-line">{job.description}</p>
          </div>
        )}
        {job.requirements && (
          <div>
            <h4 className="font-semibold text-sm mb-1">المتطلبات</h4>
            <p className="text-sm text-stone-700 whitespace-pre-line">{job.requirements}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <h3 className="font-bold mb-2">بيانات التقديم</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <FormField label="الاسم الكامل *" value={form.full_name} onChange={v => setForm({ ...form, full_name: v })} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="البريد الإلكتروني *" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} required />
          <FormField label="رقم الجوال" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect label="الجنسية" value={form.nationality} onChange={v => setForm({ ...form, nationality: v })}
            options={['سعودي', 'مصري', 'هندي', 'باكستاني', 'فلبيني', 'سوداني', 'أردني', 'سوري', 'يمني', 'أخرى']} />
          <FormField label="سنوات الخبرة" type="number" value={form.experience_years} onChange={v => setForm({ ...form, experience_years: parseInt(v) || 0 })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="المسمى الحالي" value={form.current_position} onChange={v => setForm({ ...form, current_position: v })} />
          <FormField label="الشركة الحالية" value={form.current_company} onChange={v => setForm({ ...form, current_company: v })} />
        </div>
        <FormField label="المؤهل العلمي" value={form.education} onChange={v => setForm({ ...form, education: v })} />

        <div>
          <label className="block text-sm font-medium mb-1.5">السيرة الذاتية (PDF أو Word)</label>
          <label className="flex items-center justify-center gap-2 w-full px-4 py-6 rounded-lg border-2 border-dashed border-stone-300 cursor-pointer hover:border-amber-500">
            <Upload className="w-5 h-5 text-stone-500" />
            <span className="text-sm text-stone-600">{cvFile ? cvFile.name : 'اضغط لرفع الملف'}</span>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => setCvFile(e.target.files[0])} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">رسالة تعريفية (اختياري)</label>
          <textarea value={form.cover_letter} onChange={e => setForm({ ...form, cover_letter: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-amber-500 min-h-[100px]"
            placeholder="اكتب بعض الكلمات عن نفسك ولماذا أنت مناسب لهذه الوظيفة..." />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3 rounded-lg bg-amber-500 text-slate-900 font-semibold disabled:opacity-50">
          {submitting ? 'جارٍ الإرسال...' : 'تقديم الطلب'}
        </button>
      </form>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-amber-500" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-amber-500">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ============================================================
// شاشة تسجيل الدخول
// ============================================================
function LoginPage({ onPublicClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 mx-auto flex items-center justify-center mb-3">
            <Briefcase className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold">نظام إدارة التوظيف</h1>
          <p className="text-sm text-stone-500 mt-1">دخول فريق الموارد البشرية</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
          <FormField label="كلمة السر" type="password" value={password} onChange={setPassword} required />
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-slate-900 text-white font-semibold disabled:opacity-50">
            {loading ? 'جارٍ...' : (isSignup ? 'إنشاء حساب' : 'دخول')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button onClick={() => setIsSignup(!isSignup)} className="text-amber-600 hover:underline">
            {isSignup ? 'لديك حساب؟ سجل الدخول' : 'مستخدم جديد؟ أنشئ حساباً'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-stone-200 text-center">
          <button onClick={onPublicClick} className="text-sm text-stone-500 hover:text-slate-900 flex items-center gap-1 mx-auto">
            <ExternalLink className="w-4 h-4" />
            <span>العودة لصفحة الوظائف العامة</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// لوحة تحكم الفريق (Admin Dashboard)
// ============================================================
function AdminDashboard({ session, onPublicClick }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const pages = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
    { id: 'jobs', label: 'الوظائف', icon: Briefcase },
    { id: 'applicants', label: 'المتقدمون', icon: Users },
    { id: 'kanban', label: 'مسار التوظيف', icon: LayoutGrid },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
  ];

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardView setPage={setPage} />;
      case 'jobs': return <JobsView />;
      case 'applicants': return <ApplicantsView />;
      case 'kanban': return <KanbanView />;
      case 'reports': return <ReportsView />;
      default: return <DashboardView setPage={setPage} />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-stone-50 flex" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 right-0 h-screen w-64 z-50 bg-gradient-to-b from-slate-900 to-slate-800 text-stone-100 transition-transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold">ATS</h1>
              <p className="text-xs text-stone-400">نظام التوظيف</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-stone-400">مسجل الدخول</p>
            <p className="text-sm font-medium truncate">{session.user.email}</p>
          </div>
        </div>

        <nav className="p-3">
          {pages.map(p => {
            const Icon = p.icon;
            const active = page === p.id;
            return (
              <button key={p.id} onClick={() => { setPage(p.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-right transition-all ${
                  active ? 'bg-amber-500 text-slate-900 font-semibold' : 'text-stone-300 hover:bg-slate-700/50'
                }`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm">{p.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-1 mt-4">
          <button onClick={onPublicClick} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-stone-300 hover:bg-slate-700 text-sm">
            <ExternalLink className="w-4 h-4" />
            <span>الصفحة العامة</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-stone-400 hover:bg-red-900/30 hover:text-red-300 text-sm">
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-stone-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg lg:text-xl font-bold">{pages.find(p => p.id === page)?.label}</h2>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// صفحة لوحة التحكم
// ============================================================
function DashboardView({ setPage }) {
  const [stats, setStats] = useState({ jobs: 0, applicants: 0, newApplicants: 0, hired: 0 });
  const [recentApplicants, setRecentApplicants] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [jobsRes, applicantsRes, newRes, hiredRes, recentRes] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('applicants').select('id', { count: 'exact', head: true }),
      supabase.from('applicants').select('id', { count: 'exact', head: true }).eq('stage', 'new'),
      supabase.from('applicants').select('id', { count: 'exact', head: true }).eq('stage', 'hired'),
      supabase.from('applicants').select('*, jobs(title)').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      jobs: jobsRes.count || 0,
      applicants: applicantsRes.count || 0,
      newApplicants: newRes.count || 0,
      hired: hiredRes.count || 0,
    });
    setRecentApplicants(recentRes.data || []);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-slate-900 to-slate-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span className="text-amber-400 text-sm">نظرة عامة</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">مرحباً بك</h1>
        <p className="text-stone-300">إدارة التوظيف والمتقدمين في مكان واحد</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="الوظائف المفتوحة" value={stats.jobs} icon={Briefcase} color="amber" onClick={() => setPage('jobs')} />
        <StatCard label="إجمالي المتقدمين" value={stats.applicants} icon={Users} color="sky" onClick={() => setPage('applicants')} />
        <StatCard label="طلبات جديدة" value={stats.newApplicants} icon={UserPlus} color="purple" onClick={() => setPage('applicants')} />
        <StatCard label="تم التوظيف" value={stats.hired} icon={Award} color="emerald" onClick={() => setPage('applicants')} />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold">آخر المتقدمين</h3>
          <button onClick={() => setPage('applicants')} className="text-sm text-amber-600 hover:underline">عرض الكل</button>
        </div>
        {recentApplicants.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-sm">لا يوجد متقدمون بعد</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentApplicants.map(app => {
              const stage = getStage(app.stage);
              return (
                <div key={app.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    {app.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{app.full_name}</p>
                    <p className="text-xs text-stone-500 truncate">{app.jobs?.title || 'غير محدد'} • {fmtDate(app.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${stage.bg} ${stage.text}`}>{stage.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, onClick }) {
  const colors = {
    amber: 'from-amber-500 to-orange-500',
    sky: 'from-sky-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-teal-500',
  };
  return (
    <button onClick={onClick} className="text-right bg-white rounded-xl p-4 border border-stone-200 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </button>
  );
}

// ============================================================
// صفحة الوظائف
// ============================================================
function JobsView() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  const deleteJob = async (id) => {
    if (!window.confirm('حذف الوظيفة؟')) return;
    await supabase.from('jobs').delete().eq('id', id);
    loadJobs();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-stone-500">{jobs.length} وظيفة</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm">
          <Plus className="w-4 h-4" /> وظيفة جديدة
        </button>
      </div>

      {showForm && <JobForm job={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadJobs(); }} />}

      {loading ? (
        <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>
      ) : (
        <div className="grid gap-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-stone-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      job.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                      job.status === 'closed' ? 'bg-stone-100 text-stone-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {job.status === 'open' ? 'مفتوحة' : job.status === 'closed' ? 'مغلقة' : 'مسودة'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                    {job.department && <span>{job.department}</span>}
                    {job.location && <span>• {job.location}</span>}
                    <span>• {job.applications_count || 0} متقدم</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(job); setShowForm(true); }} className="p-2 rounded hover:bg-stone-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="p-2 rounded hover:bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobForm({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: job?.title || '',
    department: job?.department || '',
    location: job?.location || 'الرياض',
    employment_type: job?.employment_type || 'دوام كامل',
    description: job?.description || '',
    requirements: job?.requirements || '',
    salary_min: job?.salary_min || 0,
    salary_max: job?.salary_max || 0,
    status: job?.status || 'open',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (job) {
      await supabase.from('jobs').update(form).eq('id', job.id);
    } else {
      await supabase.from('jobs').insert(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{job ? 'تعديل' : 'وظيفة جديدة'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <FormField label="المسمى الوظيفي *" value={form.title} onChange={v => setForm({ ...form, title: v })} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="الإدارة" value={form.department} onChange={v => setForm({ ...form, department: v })} />
            <FormField label="الموقع" value={form.location} onChange={v => setForm({ ...form, location: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect label="نوع الوظيفة" value={form.employment_type} onChange={v => setForm({ ...form, employment_type: v })}
              options={['دوام كامل', 'دوام جزئي', 'عقد', 'تدريب', 'عن بُعد']} />
            <FormSelect label="الحالة" value={form.status} onChange={v => setForm({ ...form, status: v })}
              options={[{v:'open',l:'مفتوحة'}, {v:'draft',l:'مسودة'}, {v:'closed',l:'مغلقة'}].map(o => o.v)}
              />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">الوصف</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-amber-500 min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">المتطلبات</label>
            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-amber-500 min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="أدنى راتب" type="number" value={form.salary_min} onChange={v => setForm({ ...form, salary_min: parseFloat(v) || 0 })} />
            <FormField label="أعلى راتب" type="number" value={form.salary_max} onChange={v => setForm({ ...form, salary_max: parseFloat(v) || 0 })} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-amber-500 text-slate-900 font-semibold disabled:opacity-50">
            {saving ? 'جارٍ الحفظ...' : (job ? 'حفظ' : 'إنشاء')}
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-stone-300">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// صفحة المتقدمين
// ============================================================
function ApplicantsView() {
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadApplicants(); }, []);

  const loadApplicants = async () => {
    setLoading(true);
    const { data } = await supabase.from('applicants').select('*, jobs(title)').order('created_at', { ascending: false });
    setApplicants(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const s = !search || a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase());
      const g = stageFilter === 'all' || a.stage === stageFilter;
      return s && g;
    });
  }, [applicants, search, stageFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 bg-white">
          <Search className="w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث..." className="flex-1 outline-none text-sm bg-transparent" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm">
          <option value="all">كل المراحل</option>
          {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-stone-400" />
          <p className="text-lg font-medium">لا يوجد متقدمون</p>
          <p className="text-sm text-stone-500 mt-1">ستظهر الطلبات هنا عند تقديمها</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-3 py-3 text-right">الاسم</th>
                  <th className="px-3 py-3 text-right">الوظيفة</th>
                  <th className="px-3 py-3">التاريخ</th>
                  <th className="px-3 py-3">المرحلة</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const stage = getStage(app.stage);
                  return (
                    <tr key={app.id} className="border-b border-stone-100 hover:bg-stone-50 cursor-pointer" onClick={() => setSelectedApplicant(app)}>
                      <td className="px-3 py-3">
                        <div className="font-medium">{app.full_name}</div>
                        <div className="text-xs text-stone-500">{app.email}</div>
                      </td>
                      <td className="px-3 py-3">{app.jobs?.title || '-'}</td>
                      <td className="px-3 py-3 text-center text-xs">{fmtDate(app.created_at)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${stage.bg} ${stage.text}`}>{stage.label}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Eye className="w-4 h-4 mx-auto text-stone-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedApplicant && (
        <ApplicantDetails applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} onUpdate={loadApplicants} />
      )}
    </div>
  );
}

// ============================================================
// تفاصيل المتقدم
// ============================================================
function ApplicantDetails({ applicant, onClose, onUpdate }) {
  const [stage, setStage] = useState(applicant.stage);
  const [rating, setRating] = useState(applicant.rating || 0);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadNotes();
  }, [applicant.id]);

  const loadNotes = async () => {
    const { data } = await supabase.from('applicant_notes').select('*').eq('applicant_id', applicant.id).order('created_at', { ascending: false });
    setNotes(data || []);
  };

  const updateStage = async (newStage) => {
    setStage(newStage);
    await supabase.from('applicants').update({ stage: newStage }).eq('id', applicant.id);
    onUpdate();
  };

  const updateRating = async (newRating) => {
    setRating(newRating);
    await supabase.from('applicants').update({ rating: newRating }).eq('id', applicant.id);
    onUpdate();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from('applicant_notes').insert({
      applicant_id: applicant.id,
      note: newNote,
      author_name: 'الفريق',
    });
    setNewNote('');
    loadNotes();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
              {applicant.full_name?.[0] || '?'}
            </div>
            <div>
              <h3 className="text-xl font-bold">{applicant.full_name}</h3>
              <p className="text-sm text-stone-500">{applicant.jobs?.title || 'غير محدد'}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        {/* المرحلة */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">المرحلة</label>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => (
              <button key={s.id} onClick={() => updateStage(s.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium ${
                  stage === s.id ? `${s.bg} ${s.text} ${s.border} border-2` : 'bg-stone-100 text-stone-500 border-2 border-transparent'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* التقييم */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">التقييم</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => updateRating(n)}>
                <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* المعلومات */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <InfoRow icon={Mail} label="البريد" value={applicant.email} />
          <InfoRow icon={Phone} label="الجوال" value={applicant.phone} />
          <InfoRow icon={User} label="الجنسية" value={applicant.nationality} />
          <InfoRow icon={Award} label="الخبرة" value={`${applicant.experience_years} سنة`} />
          <InfoRow icon={Building2} label="الشركة الحالية" value={applicant.current_company} />
          <InfoRow icon={Briefcase} label="المسمى الحالي" value={applicant.current_position} />
        </div>

        {applicant.cover_letter && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-1">الرسالة التعريفية</h4>
            <p className="text-sm text-stone-700 bg-stone-50 rounded-lg p-3 whitespace-pre-line">{applicant.cover_letter}</p>
          </div>
        )}

        {applicant.cv_url && (
          <a href={applicant.cv_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium mb-4 w-fit">
            <Download className="w-4 h-4" /> تحميل السيرة الذاتية
          </a>
        )}

        {/* الملاحظات */}
        <div className="border-t border-stone-200 pt-4">
          <h4 className="font-semibold text-sm mb-3">ملاحظات الفريق</h4>
          <div className="flex gap-2 mb-3">
            <input value={newNote} onChange={e => setNewNote(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addNote()}
              placeholder="أضف ملاحظة..."
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 outline-none focus:border-amber-500 text-sm" />
            <button onClick={addNote} className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm">
              إضافة
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">لا توجد ملاحظات</p>
            ) : notes.map(n => (
              <div key={n.id} className="bg-stone-50 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-stone-500">{n.author_name} • {fmtDateTime(n.created_at)}</span>
                </div>
                <p>{n.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-stone-500">{label}</p>
        <p className="font-medium truncate">{value || '-'}</p>
      </div>
    </div>
  );
}

// ============================================================
// Kanban View
// ============================================================
function KanbanView() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => { loadApplicants(); }, []);

  const loadApplicants = async () => {
    setLoading(true);
    const { data } = await supabase.from('applicants').select('*, jobs(title)').order('created_at', { ascending: false });
    setApplicants(data || []);
    setLoading(false);
  };

  const moveStage = async (applicantId, newStage) => {
    await supabase.from('applicants').update({ stage: newStage }).eq('id', applicantId);
    loadApplicants();
  };

  const stagesWithApplicants = STAGES.filter(s => s.id !== 'rejected').map(s => ({
    ...s,
    applicants: applicants.filter(a => a.stage === s.id),
  }));

  if (loading) return <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {stagesWithApplicants.map(stage => (
          <div key={stage.id} className={`w-72 flex-shrink-0 rounded-xl ${stage.bg} border ${stage.border}`}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (draggedId) { moveStage(draggedId, stage.id); setDraggedId(null); } }}>
            <div className={`p-3 border-b ${stage.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                <span className={`font-semibold text-sm ${stage.text}`}>{stage.label}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-white ${stage.text}`}>{stage.applicants.length}</span>
            </div>
            <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {stage.applicants.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">لا يوجد</p>
              ) : stage.applicants.map(app => (
                <div key={app.id} draggable onDragStart={() => setDraggedId(app.id)}
                  className="bg-white rounded-lg p-3 cursor-move hover:shadow-md transition-shadow">
                  <p className="font-medium text-sm mb-1">{app.full_name}</p>
                  <p className="text-xs text-stone-500 mb-2">{app.jobs?.title}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">{fmtDate(app.created_at)}</span>
                    {app.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{app.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-stone-500 mt-2">💡 اسحب البطاقات بين الأعمدة لتغيير المرحلة</p>
    </div>
  );
}

// ============================================================
// التقارير
// ============================================================
function ReportsView() {
  const [stats, setStats] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const { data: applicants } = await supabase.from('applicants').select('*, jobs(title)');
    const { data: jobs } = await supabase.from('jobs').select('*');

    if (!applicants || !jobs) return;

    const byStage = {};
    STAGES.forEach(s => { byStage[s.id] = applicants.filter(a => a.stage === s.id).length; });

    const byNationality = {};
    applicants.forEach(a => {
      const n = a.nationality || 'غير محدد';
      byNationality[n] = (byNationality[n] || 0) + 1;
    });

    const byJob = {};
    applicants.forEach(a => {
      const j = a.jobs?.title || 'غير محدد';
      byJob[j] = (byJob[j] || 0) + 1;
    });

    setStats({
      total: applicants.length,
      openJobs: jobs.filter(j => j.status === 'open').length,
      byStage,
      byNationality,
      byJob,
      hired: applicants.filter(a => a.stage === 'hired').length,
      conversionRate: applicants.length > 0 ? (applicants.filter(a => a.stage === 'hired').length / applicants.length * 100).toFixed(1) : 0,
    });
  };

  if (!stats) return <div className="text-center py-12 text-stone-500">جارٍ التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="إجمالي المتقدمين" value={stats.total} />
        <StatBox label="الوظائف المفتوحة" value={stats.openJobs} />
        <StatBox label="تم التوظيف" value={stats.hired} />
        <StatBox label="معدل النجاح" value={`${stats.conversionRate}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ReportCard title="التوزيع حسب المرحلة">
          <div className="space-y-2">
            {STAGES.map(s => {
              const count = stats.byStage[s.id] || 0;
              const pct = stats.total > 0 ? (count / stats.total * 100) : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportCard>

        <ReportCard title="التوزيع حسب الجنسية">
          <div className="space-y-2">
            {Object.entries(stats.byNationality).sort((a,b) => b[1] - a[1]).slice(0, 6).map(([nat, count]) => {
              const pct = stats.total > 0 ? (count / stats.total * 100) : 0;
              return (
                <div key={nat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{nat}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </ReportCard>
      </div>

      <ReportCard title="التوزيع حسب الوظيفة">
        <div className="space-y-2">
          {Object.entries(stats.byJob).sort((a,b) => b[1] - a[1]).map(([job, count]) => {
            const pct = stats.total > 0 ? (count / stats.total * 100) : 0;
            return (
              <div key={job}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate ml-2">{job}</span>
                  <span className="font-medium flex-shrink-0">{count} متقدم</span>
                </div>
                <div className="h-2 bg-stone-100 rounded overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </ReportCard>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-stone-200">
      <p className="text-xs text-stone-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ReportCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}
