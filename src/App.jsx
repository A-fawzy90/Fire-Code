import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProjectAssessment from './components/ProjectAssessment';
import CodeLibrary from './components/CodeLibrary';
import DrawingReview from './components/DrawingReview';
import IssueWorkspace from './components/IssueWorkspace';
import ReportsView from './components/ReportsView';
import AdminView from './components/AdminView';
import FloatingAssistant from './components/FloatingAssistant';
import SplashScreen from './components/SplashScreen';

// Resilient Error Boundary to ensure tabs never freeze
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tab Error caught by TabErrorBoundary:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentTab !== this.props.currentTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      const isAr = this.props.lang === 'ar';
      return (
        <div style={{
          padding: '40px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fecaca',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '40px auto'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.6rem' }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
            {isAr ? 'تنبيه في عرض بيانات هذا التبويب' : 'Tab Rendering Notice'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '16px', lineHeight: 1.6 }}>
            {isAr 
              ? 'حدث استثناء غير متوقع أثناء معالجة مكونات هذا التبويب. يمكنك الانتقال بحرية إلى أي تبويب آخر أو إعادة المحاولة.'
              : 'An unexpected exception occurred while rendering this tab. You can navigate freely to other tabs or retry.'}
          </p>
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#b91c1c', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'left', direction: 'ltr', wordBreak: 'break-all' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {isAr ? 'إعادة المحاولة' : 'Retry Tab'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [lang, setLang] = useState('ar');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [initialAssessmentQuery, setInitialAssessmentQuery] = useState('');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');
  const [isSplashOpen, setIsSplashOpen] = useState(() => {
    try {
      return localStorage.getItem('hideFireCodeSplash') !== 'true';
    } catch {
      return true;
    }
  });

  const handleOpenAssistantWithQuery = (queryText) => {
    setAssistantInitialQuery(queryText);
    setIsAiDrawerOpen(true);
  };

  // Default benchmark Egyptian projects
  const DEFAULT_PROJECTS = [
    {
      id: 'proj-1',
      titleAr: 'مجمع تجاري وبدروم مواقف سيارات - التجمع الخامس',
      titleEn: 'Commercial Mall & Basement Parking - New Cairo',
      typeAr: 'تجاري وإداري + انتظار سيارات',
      typeEn: 'Mercantile & Business + Parking',
      status: 'pending_review',
      statusLabelAr: 'قيد المراجعة وإعداد الملف',
      statusLabelEn: 'Under Review & Preparation',
      date: '2026-10-12',
      descriptionAr: 'مبنى تجاري مكون من بدروم وأرضي وخمسة أدوار متكررة، مساحة الدور ١٢٠٠ م²، ارتفاع المبنى ٢٤ م، والبدروم مخصص لانتظار السيارات.',
      descriptionEn: 'Commercial building consisting of basement, ground floor, and five typical floors. Floor area 1,200 m², building height 24m, basement dedicated to parking.',
      facts: {
        occupancyType: 'commercial',
        subgroupCode: 'هـ-١',
        subgroupNameAr: 'إشغالات تجارية كبيرة (المجموعة هـ-١)',
        aboveGroundFloors: 6,
        basementFloors: 1,
        totalFloors: 7,
        floorArea: 1200,
        totalArea: 8400,
        buildingHeight: 24,
        basementUse: 'parking',
        occupantLoadEstimated: 1400,
        location: 'التجمع الخامس، القاهرة الجديدة',
        consultant: 'مكتب الدار للاستشارات الهندسية'
      }
    },
    {
      id: 'proj-2',
      titleAr: 'برج إداري وسكني (٩٢ متراً) - العاصمة الإدارية الجديدة',
      titleEn: 'Mixed-Use High-Rise Tower (92m) - New Administrative Capital',
      typeAr: 'مبنى مرتفع (سكني وإداري)',
      typeEn: 'High-Rise (Residential & Business)',
      status: 'review_required',
      statusLabelAr: 'يتطلب مصاعد حريق ومسار هروب مضغوط',
      statusLabelEn: 'Fire Lift & Pressurized Stairs Required',
      date: '2026-10-10',
      descriptionAr: 'برج متعدد الاستخدامات بارتفاع ٩٢ متراً (٢٨ طابقاً) وثلاثة طوابق تحت الأرض، يتطلب تطبيق اشتراطات المباني المرتفعة وفق الجزء الأول والجزء الثالث.',
      descriptionEn: 'Mixed-use high-rise tower with a height of 92 meters (28 stories) and 3 basements, requiring high-rise provisions per Part 1 and Part 3.',
      facts: {
        occupancyType: 'mixed',
        subgroupCode: 'د / ب',
        subgroupNameAr: 'مبنى مرتفع متعدد الإشغال (إداري / سكني)',
        aboveGroundFloors: 28,
        basementFloors: 3,
        totalFloors: 31,
        floorArea: 950,
        totalArea: 29450,
        buildingHeight: 92,
        basementUse: 'parking_and_services',
        occupantLoadEstimated: 3200,
        location: 'منطقة الأعمال المركزية (CBD)، العاصمة الإدارية',
        consultant: 'تحالف النيل للاستشارات المتخصصة'
      }
    },
    {
      id: 'proj-3',
      titleAr: 'مستودع ومصنع مواد ورقية وتعبئة - العاشر من رمضان',
      titleEn: 'Packaging Materials Factory & Warehouse - 10th of Ramadan',
      typeAr: 'صناعي ومخازن (خطورة متوسطة)',
      typeEn: 'Industrial & Storage (Moderate Hazard)',
      status: 'potential_issue',
      statusLabelAr: 'فحص مسافات صهاريج الإطفاء وخزانات الرغوة',
      statusLabelEn: 'Hydrant Distances & Foam Tank Check',
      date: '2026-10-08',
      descriptionAr: 'منشأة صناعية بمساحة ٤,٥٠٠ م² مخصصة لتصنيع وتخزين الكرتون والورق، ارتفاع الجمالون ١١ متراً، تتطلب شبكة رشاشات مائية ومخارج هروب مباشرة.',
      descriptionEn: 'Industrial facility spanning 4,500 m² for cardboard manufacturing and storage. Clear height 11m, requires sprinkler system and direct exits.',
      facts: {
        occupancyType: 'industrial',
        subgroupCode: 'ص-٢',
        subgroupNameAr: 'إشغالات صناعية ذات خطورة متوسطة (المجموعة ص-٢)',
        aboveGroundFloors: 1,
        basementFloors: 0,
        totalFloors: 1,
        floorArea: 4500,
        totalArea: 4500,
        buildingHeight: 11,
        basementUse: 'none',
        occupantLoadEstimated: 350,
        location: 'المنطقة الصناعية الثالثة، العاشر من رمضان',
        consultant: 'المكتب الاستشاري لمكافحة الحريق والسلامة'
      }
    }
  ];

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('agy_egyptian_fire_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return DEFAULT_PROJECTS;
  });

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return projects.length > 0 ? projects[0].id : null;
  });
  const selectedProject = projects.find(p => p.id === selectedProjectId) || (projects.length > 0 ? projects[0] : null);

  // Sync projects with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agy_egyptian_fire_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  }, [projects]);

  // Update HTML direction and language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Handle Project Deletion
  const handleDeleteProject = (projectId) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      return updated;
    });
    if (selectedProjectId === projectId) {
      const remaining = projects.filter(p => p.id !== projectId);
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Handle Restoring Default Sample Projects
  const handleRestoreDefaultProjects = () => {
    setProjects(DEFAULT_PROJECTS);
    setSelectedProjectId(DEFAULT_PROJECTS[0].id);
  };

  // Handle Adding a New Custom Project
  const handleAddNewProject = (newProj) => {
    const id = `proj-${Date.now()}`;
    const projectWithId = {
      ...newProj,
      id,
      date: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [projectWithId, ...prev]);
    setSelectedProjectId(id);
    setCurrentTab('assessment');
  };

  // Handle Quick Assessment trigger from Dashboard
  const handleQuickAssess = (queryText) => {
    setInitialAssessmentQuery(queryText);
    setCurrentTab('assessment');
  };

  // Handle selecting a project
  const handleSelectProject = (projId) => {
    setSelectedProjectId(projId);
  };

  // Handle saving assessment results to active project
  const handleSaveAssessment = (result) => {
    console.log('Assessment saved for project:', selectedProjectId, result);
  };

  // Handle facts applied from Drawing Review
  const handleApplyExtractedFacts = (extractedFacts) => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          facts: {
            ...p.facts,
            ...extractedFacts
          }
        };
      }
      return p;
    }));
    // Navigate to assessment tab to review with newly applied facts
    setCurrentTab('assessment');
  };

  return (
    <div className="app-container">
      {/* Top Navigation & Authority Banner */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        selectedProject={selectedProject}
        sampleProjects={projects}
        onSelectProject={handleSelectProject}
        onOpenSplash={() => setIsSplashOpen(true)}
      />

      {/* Main Content View Switcher wrapped in TabErrorBoundary */}
      <main className="main-content">
        <TabErrorBoundary currentTab={currentTab} lang={lang}>
          {currentTab === 'dashboard' && (
            <Dashboard 
              lang={lang}
              setCurrentTab={setCurrentTab}
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleSelectProject}
              onQuickAssess={handleQuickAssess}
              onDeleteProject={handleDeleteProject}
              onRestoreDefaultProjects={handleRestoreDefaultProjects}
              onAddNewProject={handleAddNewProject}
            />
          )}

          {currentTab === 'assessment' && (
            <ProjectAssessment 
              lang={lang}
              selectedProject={selectedProject}
              onSaveAssessment={handleSaveAssessment}
              initialQuery={initialAssessmentQuery}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentTab === 'library' && (
            <CodeLibrary 
              lang={lang}
              onOpenAssistant={handleOpenAssistantWithQuery}
            />
          )}

          {currentTab === 'drawing' && (
            <DrawingReview 
              lang={lang}
              selectedProject={selectedProject}
              onApplyExtractedFacts={handleApplyExtractedFacts}
            />
          )}

          {currentTab === 'issues' && (
            <IssueWorkspace 
              lang={lang}
              selectedProject={selectedProject}
              onGenerateReport={() => setCurrentTab('reports')}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView 
              lang={lang}
              selectedProject={selectedProject}
            />
          )}

          {currentTab === 'admin' && (
            <AdminView 
              lang={lang}
            />
          )}
        </TabErrorBoundary>
      </main>

      {/* Persistent Floating AI Assistant */}
      <FloatingAssistant 
        lang={lang}
        selectedProject={selectedProject}
        isOpen={isAiDrawerOpen}
        setIsOpen={setIsAiDrawerOpen}
        initialQuery={assistantInitialQuery}
      />

      {/* Enhanced Footer with Eng. Ahmed Fawzy Credentials & Fire Triangle */}
      <footer style={{
        marginTop: 'auto',
        background: '#090d16',
        color: '#94a3b8',
        borderTop: '1px solid rgba(245, 158, 11, 0.25)',
        padding: '28px 24px',
        fontSize: '0.82rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Main Engineer Attribution Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 20px',
            borderRadius: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)'
              }}>
                🔥
              </div>
              <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
                <div style={{ color: '#fed7aa', fontWeight: 800, fontSize: '0.9rem' }}>
                  {lang === 'ar' ? 'تصميم وتطوير: المهندس / أحمد فوزي' : 'Designed & Engineered by Eng. Ahmed Fawzy'}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                  {lang === 'ar' 
                    ? 'استشاري هندسة السلامة ومكافحة الحريق والأنظمة الكودية' 
                    : 'Fire Protection & Life Safety Engineering Consultant'}
                </div>
              </div>
            </div>

            {/* Button to open Intro / Fire Triangle Splash */}
            <button
              type="button"
              onClick={() => setIsSplashOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
                border: '1px solid #f59e0b',
                color: '#fef08a',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={lang === 'ar' ? 'استعراض شعار مثلث الحريق وبطاقة المهندس المصمم' : 'View Fire Triangle & Designer Card'}
            >
              <span>🔥</span>
              <span>{lang === 'ar' ? 'شعار مثلث الحريق وبطاقة الاعتماد' : 'Fire Triangle & Credentials'}</span>
            </button>

            {/* Copyright badge */}
            <div style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ color: '#22c55e' }}>✔</span>
              <span>{lang === 'ar' ? 'جميع الحقوق محفوظة © ٢٠٢٦ المهندس أحمد فوزي' : 'All Rights Reserved © 2026 Eng. Ahmed Fawzy'}</span>
            </div>
          </div>

          {/* Reference standards */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.78rem' }}>
            <span style={{ color: '#f8fafc', fontWeight: '700' }}>
              {lang === 'ar' ? 'الكود المصري لحماية المنشآت من أخطار الحريق (كود ٣٠٥)' : 'Egyptian Fire Code 305'}
            </span>
            <span>•</span>
            <span>
              {lang === 'ar' ? 'قرار وزير الإسكان والمرافق رقم ٢٥٥ لسنة ٢٠٢٦' : 'Ministerial Decree No. 255/2026'}
            </span>
            <span>•</span>
            <span>
              {lang === 'ar' ? 'المركز القومي لبحوث الإسكان والبناء (HBRC)' : 'Housing and Building National Research Center'}
            </span>
            <span>•</span>
            <span>
              {lang === 'ar' ? 'الإدارة العامة للحماية المدنية' : 'General Administration of Civil Protection'}
            </span>
          </div>

          <p style={{ color: '#64748b', fontSize: '0.74rem', maxWidth: '960px', margin: '0 auto', lineHeight: 1.5 }}>
            {lang === 'ar' 
              ? 'تنبيه قانوني ومهني: المنظومة مخصصة لتمكين الاستشاريين والمهندسين من فحص وتدقيق المعايير الهندسية والحسابية. القرارات والاعتمادات النهائية تظل اختصاصاً حصرياً للإدارة العامة للحماية المدنية بوزارة الداخلية واللجان الفنية المختصة.'
              : 'Legal Notice: This system assists consultants and engineers in verifying code requirements. Final approval remains under the sole authority of the General Administration of Civil Protection and competent statutory committees.'}
          </p>
        </div>
      </footer>

      {/* Cinematic Splash Screen with Fire Triangle & Eng. Ahmed Fawzy Credentials */}
      <SplashScreen 
        isOpen={isSplashOpen} 
        onClose={() => setIsSplashOpen(false)} 
        lang={lang} 
      />
    </div>
  );
}
