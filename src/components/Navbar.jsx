import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  BookOpen, 
  FileCheck2, 
  Building2, 
  ClipboardList, 
  FileText, 
  Settings, 
  Languages, 
  AlertTriangle,
  Calculator,
  Wifi,
  WifiOff
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/codeKnowledgeBase';
import OfflineModeModal from './OfflineModeModal';
import FireBrandLogo from './FireBrandLogo';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  lang, 
  setLang, 
  selectedProject, 
  sampleProjects, 
  onSelectProject,
  onOpenSplash,
  onOpenFirebase
}) {
  const isAr = lang === 'ar';
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', labelAr: 'لوحة القيادة', labelEn: 'Dashboard', icon: Building2 },
    { id: 'assessment', labelAr: 'تقييم المشاريع', labelEn: 'Project Assessment', icon: FileCheck2 },
    { id: 'calculators', labelAr: 'الحاسبات التفاعلية', labelEn: 'Code Calculators', icon: Calculator },
    { id: 'rejections', labelAr: 'أخطاء الحماية والتفسيرات', labelEn: 'Rejections & Interpretations', icon: AlertTriangle },
    { id: 'library', labelAr: 'تصفح الكود الكامل', labelEn: 'Full Code Browser', icon: BookOpen },
    { id: 'drawing', labelAr: 'فحص المخططات', labelEn: 'Drawing Review', icon: ClipboardList },
    { id: 'issues', labelAr: 'دراسة الحالات', labelEn: 'Issue Workspace', icon: ShieldAlert },
    { id: 'reports', labelAr: 'التقارير والمذكرات', labelEn: 'Official Reports', icon: FileText },
    { id: 'admin', labelAr: 'المصادر والتحكم', labelEn: 'Admin & Sources', icon: Settings },
  ];

  return (
    <>
      {/* Top Authority & Decree Banner */}
      <div className="authority-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="authority-badge">
            <Flame size={14} color="#ef4444" />
            {isAr ? OFFICIAL_METADATA.decreeNumber : 'Ministerial Decree No. 255/2026'}
          </span>
          <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
            {isAr 
              ? 'المركز القومي لبحوث الإسكان والبناء (HBRC) بالتعاون مع الإدارة العامة للحماية المدنية'
              : 'Housing & Building National Research Center (HBRC) in coordination with Civil Protection'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {selectedProject && (
            <div style={{ fontSize: '0.82rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#94a3b8' }}>{isAr ? 'المشروع النشط:' : 'Active Project:'}</span>
              <strong>{isAr ? selectedProject.titleAr : selectedProject.titleEn}</strong>
            </div>
          )}
          <button 
            type="button"
            onClick={onOpenSplash}
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fef08a',
              borderRadius: '999px',
              padding: '3px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isAr ? 'عرض افتتاحية البرنامج ومثلث الحريق وحقوق المهندس أحمد فوزي' : 'View Fire Triangle & Eng. Ahmed Fawzy Credits'}
          >
            <span>🔥</span>
            <span>{isAr ? 'مثلث الحريق | م. أحمد فوزي' : 'Fire Triangle | Eng. Ahmed Fawzy'}</span>
          </button>

          <button 
            type="button"
            onClick={onOpenFirebase}
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#93c5fd',
              borderRadius: '999px',
              padding: '3px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isAr ? 'إدارة ومزامنة قاعدة بيانات Firebase (fire-code-9603d)' : 'Manage Firebase Database (fire-code-9603d)'}
          >
            <span>☁️</span>
            <span>{isAr ? 'فايربيز | fire-code-9603d' : 'Firebase DB'}</span>
          </button>

          <button 
            type="button"
            onClick={() => setIsOfflineModalOpen(true)}
            style={{
              background: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.25)',
              border: isOnline ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid #ef4444',
              color: isOnline ? '#86efac' : '#fca5a5',
              borderRadius: '999px',
              padding: '3px 12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: !isOnline ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
            }}
            title={isAr ? 'وضع العمل الميداني بدون إنترنت (متاح 100% في المواقع والبدرومات)' : 'Offline Field Mode'}
          >
            {isOnline ? <Wifi size={13} color="#4ade80" /> : <WifiOff size={13} color="#ef4444" />}
            <span>
              {isOnline 
                ? (isAr ? '⚡ بالموقع (أوفلاين جاهز)' : '⚡ Field Mode Ready')
                : (isAr ? '⚡ أوفلاين بالموقع (نشط)' : '⚡ Offline Active')}
            </span>
          </button>

          <button 
            className="lang-toggle-btn"
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            title="تبديل اللغة / Switch Language"
          >
            <Languages size={14} />
            {isAr ? 'English' : 'عربي'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="header-surface">
        <div className="header-inner">
          {/* Brand */}
          <div className="brand-section" onClick={() => setCurrentTab('dashboard')}>
            <div className="brand-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FireBrandLogo size={40} />
            </div>
            <div className="brand-text">
              <h1>{isAr ? 'مساعد كود الحريق المصري' : 'Egyptian Fire Code Assistant'}</h1>
              <p>{isAr ? 'منظومة دعم القرار والتحقق الهندسي المعتمدة ٢٠٢٦' : 'Decision Support & Engineering Compliance System 2026'}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs" role="tablist">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`nav-tab-${item.id}`}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentTab(item.id)}
                >
                  <Icon size={14} />
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* High-Visibility Enlarged Disclaimer Notice Strip */}
      <div className="disclaimer-strip" role="alert">
        <div className="disclaimer-strip-badge">
          <AlertTriangle size={18} color="#ffffff" />
          <span>{isAr ? 'تنبيه مهني وقانوني هام:' : 'Important Legal Notice:'}</span>
        </div>
        <div className="disclaimer-strip-text">
          {isAr ? OFFICIAL_METADATA.disclaimerAr : OFFICIAL_METADATA.disclaimerEn}
        </div>
      </div>

      {/* Offline Field Mode Modal */}
      <OfflineModeModal 
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        lang={lang}
        isOnline={isOnline}
      />
    </>
  );
}
