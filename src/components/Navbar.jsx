import React from 'react';
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
  AlertTriangle 
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/codeKnowledgeBase';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  lang, 
  setLang, 
  selectedProject, 
  sampleProjects, 
  onSelectProject,
  onOpenSplash
}) {
  const isAr = lang === 'ar';

  const navItems = [
    { id: 'dashboard', labelAr: 'لوحة القيادة', labelEn: 'Dashboard', icon: Building2 },
    { id: 'assessment', labelAr: 'تقييم المشاريع', labelEn: 'Project Assessment', icon: FileCheck2 },
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
            <div className="brand-logo-shield">
              <ShieldAlert size={22} />
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

      {/* Disclaimer Notice Strip */}
      <div className="disclaimer-strip">
        <AlertTriangle size={18} />
        <div>
          <strong>{isAr ? 'تنبيه مهني هام: ' : 'Professional Legal Notice: '}</strong>
          <span>{isAr ? OFFICIAL_METADATA.disclaimerAr : OFFICIAL_METADATA.disclaimerEn}</span>
        </div>
      </div>
    </>
  );
}
