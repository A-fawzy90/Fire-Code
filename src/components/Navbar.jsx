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
  WifiOff,
  MoreHorizontal,
  X,
  Layers,
  Sparkles,
  Cloud
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
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

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
    { id: 'drawing', labelAr: 'فحص المخططات', labelEn: 'Drawing Review', icon: ClipboardList },
    { id: 'library', labelAr: 'تصفح الكود الكامل', labelEn: 'Full Code Browser', icon: BookOpen },
    { id: 'rejections', labelAr: 'أخطاء الحماية والتفسيرات', labelEn: 'Rejections & Interpretations', icon: AlertTriangle },
    { id: 'issues', labelAr: 'دراسة الحالات', labelEn: 'Issue Workspace', icon: ShieldAlert },
    { id: 'reports', labelAr: 'التقارير والمذكرات', labelEn: 'Official Reports', icon: FileText },
    { id: 'admin', labelAr: 'المصادر والتحكم', labelEn: 'Admin & Sources', icon: Settings },
  ];

  // Mobile Bottom Bar Primary Tabs
  const primaryMobileTabs = [
    { id: 'dashboard', labelAr: 'الرئيسية', labelEn: 'Home', icon: Building2 },
    { id: 'assessment', labelAr: 'التقييم', labelEn: 'Assessment', icon: FileCheck2 },
    { id: 'calculators', labelAr: 'الحاسبات', labelEn: 'Calculators', icon: Calculator },
    { id: 'drawing', labelAr: 'المخططات', labelEn: 'Drawings', icon: ClipboardList }
  ];

  // Secondary Tools for Mobile More Sheet
  const secondaryMobileTools = [
    { id: 'library', labelAr: 'تصفح الكود الكامل', labelEn: 'Full Code Browser', descAr: 'الأجزاء الثلاثة والقرارات الوزارية ٢٠٢٦', icon: BookOpen, color: '#dc2626' },
    { id: 'rejections', labelAr: 'أسباب الرفض والتفسيرات', labelEn: 'Rejections & Interpretations', descAr: 'بنود التناقض ومخالفات الحماية المدنية', icon: AlertTriangle, color: '#f59e0b' },
    { id: 'issues', labelAr: 'دراسة الحالات الميدانية', labelEn: 'Field Cases & Issues', descAr: 'فحص المشاكل الحرجة للمشروع', icon: ShieldAlert, color: '#0284c7' },
    { id: 'reports', labelAr: 'التقارير والمذكرات الرسمية', labelEn: 'Official Reports & Memos', descAr: 'تصدير Word وطباعة المذكرات المعتمدة', icon: FileText, color: '#16a34a' },
    { id: 'admin', labelAr: 'المصادر والتحكم', labelEn: 'Admin & Code Sources', descAr: 'بيانات الاعتماد وإحصائيات الكود', icon: Settings, color: '#64748b' }
  ];

  const isCurrentInSecondary = secondaryMobileTools.some(tool => tool.id === currentTab);

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    setIsMoreSheetOpen(false);
  };

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
        <div className="authority-controls">
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

          {/* Navigation Tabs (Desktop / Tablet) */}
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

      {/* Native Mobile Bottom Navigation Bar (Screens <= 768px) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {primaryMobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectTab(tab.id)}
              aria-label={isAr ? tab.labelAr : tab.labelEn}
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={18} />
              </div>
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}

        {/* More Tools Tab Button */}
        <button
          type="button"
          className={`mobile-nav-item ${isMoreSheetOpen || isCurrentInSecondary ? 'active' : ''}`}
          onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
          aria-label={isAr ? 'المزيد من الأدوات' : 'More Tools'}
        >
          {isCurrentInSecondary && <div className="mobile-nav-badge" />}
          <div className="mobile-nav-icon-wrap">
            <MoreHorizontal size={18} />
          </div>
          <span>{isAr ? 'المزيد...' : 'More...'}</span>
        </button>
      </nav>

      {/* Mobile More Tools Slide-Up Sheet */}
      {isMoreSheetOpen && (
        <div className="mobile-more-overlay" onClick={() => setIsMoreSheetOpen(false)}>
          <div className="mobile-more-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-drag-handle" />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#f59e0b" />
                <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                  {isAr ? 'الأدوات والمصادر الهندسية الإضافية' : 'Additional Engineering Tools'}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreSheetOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#94a3b8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid of Secondary Navigation Tools */}
            <div className="mobile-more-grid">
              {secondaryMobileTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = currentTab === tool.id;
                return (
                  <div
                    key={tool.id}
                    className={`mobile-more-tool-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(tool.id)}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tool.color,
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                        {isAr ? tool.labelAr : tool.labelEn}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.2, marginTop: '2px' }}>
                        {isAr ? tool.descAr : tool.labelEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Bar inside Mobile Sheet */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                type="button"
                onClick={() => { setIsMoreSheetOpen(false); setIsOfflineModalOpen(true); }}
                style={{
                  background: isOnline ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.2)',
                  border: isOnline ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #ef4444',
                  color: isOnline ? '#86efac' : '#fca5a5',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                <span>{isAr ? 'وضع الأوفلاين بالموقع' : 'Offline Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsMoreSheetOpen(false); onOpenFirebase(); }}
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Cloud size={14} />
                <span>{isAr ? 'فايربيز السحابية' : 'Firebase Sync'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setIsMoreSheetOpen(false); onOpenSplash(); }}
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fef08a',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <span>🔥</span>
                <span>{isAr ? 'مثلث الحريق | م. فوزي' : 'Fire Triangle'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLang(isAr ? 'en' : 'ar')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '10px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Languages size={14} />
                <span>{isAr ? 'English' : 'عربي'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
