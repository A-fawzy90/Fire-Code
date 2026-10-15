import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Building, 
  FileCheck2, 
  BookOpen, 
  ClipboardList, 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  Layers, 
  Flame,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Calculator,
  Cloud
} from 'lucide-react';
import { OFFICIAL_METADATA, SOURCE_DOCUMENTS } from '../data/codeKnowledgeBase';

export default function Dashboard({ 
  lang, 
  setCurrentTab, 
  projects = [], 
  selectedProject, 
  onSelectProject, 
  onQuickAssess,
  onDeleteProject,
  onRestoreDefaultProjects,
  onAddNewProject,
  onOpenFirebase
}) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [inputQuery, setInputQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    titleAr: '',
    titleEn: '',
    occupancyType: 'commercial',
    subgroupCode: 'هـ-١',
    aboveGroundFloors: 5,
    basementFloors: 1,
    basementUse: 'parking',
    floorArea: 1000,
    buildingHeight: 18,
    location: ''
  });

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProjectForm.titleAr.trim()) return;
    const bFloors = Number(newProjectForm.basementFloors);
    const agFloors = Number(newProjectForm.aboveGroundFloors);
    const area = Number(newProjectForm.floorArea);
    const height = Number(newProjectForm.buildingHeight);
    
    const newProj = {
      titleAr: newProjectForm.titleAr,
      titleEn: newProjectForm.titleEn || newProjectForm.titleAr,
      typeAr: newProjectForm.occupancyType === 'commercial' ? 'تجاري ومواقف سيارات' :
              newProjectForm.occupancyType === 'residential' ? 'سكني عمارات' :
              newProjectForm.occupancyType === 'business' ? 'إداري ومهني' :
              newProjectForm.occupancyType === 'industrial' ? 'صناعي ومخازن' : 'متعدد الاستخدام',
      typeEn: newProjectForm.occupancyType,
      status: 'pending_review',
      statusLabelAr: 'قيد المراجعة وإعداد الملف',
      statusLabelEn: 'Under Review',
      descriptionAr: `${newProjectForm.titleAr} مكون من ${bFloors > 0 ? `بدروم (${bFloors} أدوار) و` : ''}${agFloors} أدوار علوية بمساحة ${area} م² وارتفاع ${height}م.`,
      descriptionEn: `Project with ${agFloors} floors, ${area} m2 area and ${height}m height.`,
      facts: {
        occupancyType: newProjectForm.occupancyType,
        subgroupCode: newProjectForm.subgroupCode,
        subgroupNameAr: newProjectForm.occupancyType === 'residential' ? 'إشغالات سكنية (ج-١)' :
                        newProjectForm.occupancyType === 'commercial' ? 'إشغالات تجارية (هـ-١)' :
                        newProjectForm.occupancyType === 'business' ? 'إشغالات إدارية (د)' : 'إشغال متنوع',
        aboveGroundFloors: agFloors,
        basementFloors: bFloors,
        totalFloors: agFloors + bFloors,
        floorArea: area,
        totalArea: area * (agFloors + bFloors),
        buildingHeight: height,
        basementUse: bFloors > 0 ? newProjectForm.basementUse : 'none',
        occupantLoadEstimated: Math.round(area * agFloors / 10),
        location: newProjectForm.location || (isAr ? 'القاهرة الجديدة' : 'New Cairo')
      }
    };
    if (onAddNewProject) {
      onAddNewProject(newProj);
    }
    setIsNewModalOpen(false);
    setNewProjectForm({
      titleAr: '',
      titleEn: '',
      occupancyType: 'commercial',
      subgroupCode: 'هـ-١',
      aboveGroundFloors: 5,
      basementFloors: 1,
      basementUse: 'parking',
      floorArea: 1000,
      buildingHeight: 18,
      location: ''
    });
  };

  const samplePrompt = isAr 
    ? "لدي مبنى تجاري مكون من بدروم وأرضي وخمسة أدوار متكررة، مساحة الدور ١٢٠٠ م²، ارتفاع المبنى ٢٤ م، والبدروم مخصص لانتظار السيارات."
    : "I have a commercial building with a basement, ground floor, and five upper floors. The floor area is 1,200 m², the building height is 24 m, and the basement is used for parking.";

  const handleAssessSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    onQuickAssess(inputQuery);
  };

  const handleLoadSample = () => {
    setInputQuery(samplePrompt);
  };

  const recentSearches = [
    { ar: "اشتراطات المباني المرتفعة التي يزيد ارتفاعها عن ٢٢ متراً", en: "High-rise provisions for buildings > 22m height" },
    { ar: "متطلبات عزل جراج البدروم ومعدل سحب الدخان الميكانيكي", en: "Basement parking 2-hr fire separation & smoke exhaust rate" },
    { ar: "أقصى مسافة ارتحال لمخارج الطوارئ في الإشغالات التجارية (هـ-١)", en: "Maximum travel distance to exit in Group E-1 mercantile" },
    { ar: "حساب سعة خزان مياه مكافحة الحريق والاحتياطي المائي", en: "Fire fighting water storage tank capacity & 90-min duration" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Section with Natural Language Search Box */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #172554 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 32px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: isAr ? '-40px' : 'auto',
          right: isAr ? 'auto' : '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '860px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5', marginBottom: '16px' }}>
            <Flame size={15} />
            {isAr ? 'الكود المصري لحماية المنشآت من الحريق - إصدار ٢٠٢٦ الرسمي' : 'Official Egyptian Fire Code 2026 Edition'}
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px' }}>
            {isAr 
              ? 'فحص المشاريع والبحث الدقيق في اشتراطات الكود المصري'
              : 'Assess Projects & Search Official Egyptian Fire Code Requirements'}
          </h1>
          <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '24px' }}>
            {isAr 
              ? 'أدخل وصف المبنى باللغة الطبيعية أو اطرح سؤالاً كودياً؛ للحصول على تقييم هندسي موثق بالنصوص الرسمية ورقم البند ورقم الصفحة وفقاً للقرار الوزاري ٢٥٥ لسنة ٢٠٢٦.'
              : 'Describe your building in natural language or ask a code question for source-grounded engineering assessment with exact article, edition, and page citations.'}
          </p>

          {/* Search / Assessment Input Form */}
          <form onSubmit={handleAssessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '6px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              alignItems: 'center'
            }}>
              <Search size={22} style={{ color: '#64748b', margin: '0 14px', flexShrink: 0 }} />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isAr 
                  ? "مثال: لدي مبنى تجاري مكون من بدروم وأرضي و٥ أدوار متكررة بارتفاع ٢٤م ومساحة ١٢٠٠ م٢..."
                  : "e.g., Commercial building with basement, ground and 5 upper floors, 1200 m2 floor area, 24m height..."}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.98rem',
                  fontFamily: 'inherit',
                  color: '#0f172a',
                  padding: '12px 8px'
                }}
              />
              <button 
                type="submit" 
                className="btn-primary"
                style={{ borderRadius: 'var(--radius-md)', padding: '12px 24px', flexShrink: 0 }}
              >
                <Sparkles size={16} />
                {isAr ? 'تقييم فوري للمشروع' : 'Assess Project'}
              </button>
            </div>

            {/* Quick Benchmark Example Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {isAr ? 'جرّب المثال القياسي:' : 'Try benchmark prompt:'}
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#f8fafc',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🏢 {isAr ? 'مبنى تجاري ٢٤م وبدروم جراج' : '24m Commercial + Basement Garage'}</span>
                <span style={{ color: '#93c5fd', textDecoration: 'underline' }}>{isAr ? '(تعبئة تلقائية)' : '(Insert)'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: '#1e293b' }}>
          {isAr ? 'الإجراءات الهندسية السريعة' : 'Quick Engineering Actions'}
        </h2>
        <div className="grid-4">
          
          <div className="card" style={{ cursor: 'pointer', borderTop: '4px solid #dc2626' }} onClick={() => setCurrentTab('assessment')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <FileCheck2 size={22} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              {isAr ? 'فحص ومطابقة مشروع' : 'Check a Project'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
              {isAr 
                ? 'إدخال مواصفات المبنى وتحديد بنود الكود الواجبة والتأكد من متطلبات الارتفاع والسلالم.'
                : 'Enter building specs and verify applicable code provisions, egress, and sprinklers.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700, fontSize: '0.84rem' }}>
              <span>{isAr ? 'بدء الفحص' : 'Start Assessment'}</span>
              <Arrow size={14} />
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer', borderTop: '4px solid #2563eb' }} onClick={() => setCurrentTab('library')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              {isAr ? 'البحث في نصوص الكود' : 'Search the Code'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
              {isAr 
                ? 'استعراض نصوص الأجزاء الثلاثة للكود (البنائية، الميكانيكية، الكهربائية) والبحث برقم البند.'
                : 'Browse parts 1, 2, and 3 verbatim text with article numbers and page citations.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.84rem' }}>
              <span>{isAr ? 'تصفح المكتبة' : 'Browse Library'}</span>
              <Arrow size={14} />
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer', borderTop: '4px solid #059669' }} onClick={() => setCurrentTab('drawing')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ClipboardList size={22} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              {isAr ? 'فحص ومراجعة مخطط' : 'Review a Drawing'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
              {isAr 
                ? 'رفع المساقط المعمارية (PDF/CAD) وتحديد مسافات الارتحال والسلالم وصناديق الحريق.'
                : 'Upload plans (PDF/CAD) to inspect travel distances, exits, and fire hose reels.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700, fontSize: '0.84rem' }}>
              <span>{isAr ? 'فحص المخطط' : 'Inspect Drawing'}</span>
              <Arrow size={14} />
            </div>
          </div>

          <div className="card" style={{ cursor: 'pointer', borderTop: '4px solid #d97706' }} onClick={() => setCurrentTab('issues')}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ShieldAlert size={22} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
              {isAr ? 'إعداد مذكرة للدفاع المدني' : 'Prepare Authority Review'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
              {isAr 
                ? 'دراسة مشكلات المباني القائمة وإعداد بدائل وحلول للمناقشة مع اللجان المختصة.'
                : 'Formulate options for discussion and review packages for Civil Protection review.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 700, fontSize: '0.84rem' }}>
              <span>{isAr ? 'فتح مساحة الحالات' : 'Open Workspace'}</span>
              <Arrow size={14} />
            </div>
          </div>
        </div>

        {/* Interactive Calculators Hero Showcase */}
        <div 
          onClick={() => setCurrentTab('calculators')}
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '16px 22px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            transition: 'transform 0.2s ease, border-color 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
              flexShrink: 0
            }}>
              <Calculator size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isAr ? 'حاسبات الكود السريعة التفاعلية (Interactive Calculators)' : 'Interactive Fire Code Calculators'}
                </h3>
                <span style={{ fontSize: '0.7rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  {isAr ? 'إدخال لحظي ومخططات' : 'Real-time Diagrams'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                {isAr 
                  ? 'سعة خزان المياه ومجموعة الطلمبات الثلاثية (GPM/m³) • عروض السلالم ومسالك الهروب (معامل ٧٫٦ و ٥٫٠ مم) • مراوح ضغط السلالم وسحب الدخان (٥٠ باسكال و ١٫٠ م/ث).'
                  : 'Water tank & triplex pumps • Stair & egress widths • Stairwell pressurization (50 Pa & 1.0 m/s).'}
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
          }}>
            <span>{isAr ? 'فتح الحاسبات الهندسية' : 'Open Calculators'}</span>
            <Arrow size={16} />
          </div>
        </div>

        {/* Civil Protection Rejections & Code Interpretations Hero Showcase */}
        <div 
          onClick={() => setCurrentTab('rejections')}
          style={{
            marginTop: '12px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '14px',
            padding: '16px 22px',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {isAr ? 'أخطاء الحماية المدنية الشائعة وتفسيرات الكود (Rejection Hub)' : 'Civil Protection Rejections & Interpretations'}
                </h3>
                <span style={{ fontSize: '0.7rem', background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  {isAr ? 'قسم ذهبي لاعتماد المخططات' : 'Golden Approval Hub'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                {isAr 
                  ? 'أسباب رفض الرسومات وطرق تفاديها (أبواب الهروب، استمرارية السلالم، غرف الكهرباء) • تفسيرات رسمية لفض النزاعات وحساب الارتفاع ٢٤م • أسئلة شائعة بالأرقام.'
                  : 'Common rejection causes & remedies (exit doors, stair continuity, electrical rooms) • Authoritative rulings • Practical FAQs.'}
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
          }}>
            <span>{isAr ? 'استعراض أسباب الرفض' : 'Explore Rejections'}</span>
            <Arrow size={16} />
          </div>
        </div>
      </section>

      {/* Two Column Section: Recent Projects & Official Documents Status */}
      <section className="grid-2">
        {/* Recent Projects */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              <Building size={20} color="#dc2626" />
              {isAr ? 'المشاريع الحديثة المعتمدة' : 'Recent Projects'}
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px', marginRight: '6px' }}>
                {projects.length}
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {projects.length < 3 && onRestoreDefaultProjects && (
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.78rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={onRestoreDefaultProjects}
                  title={isAr ? 'استعادة المشروعات النموذجية الافتراضية' : 'Restore Sample Projects'}
                >
                  <RotateCcw size={13} />
                  <span>{isAr ? 'استعادة النماذج' : 'Restore Samples'}</span>
                </button>
              )}
              {onOpenFirebase && (
                <button 
                  className="btn-secondary" 
                  style={{ 
                    fontSize: '0.78rem', 
                    padding: '5px 11px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#b45309',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: 600
                  }}
                  onClick={onOpenFirebase}
                  title={isAr ? 'مزامنة السحابة فايربيز (Firebase Firestore)' : 'Firebase Cloud Sync'}
                >
                  <Cloud size={13} color="#f59e0b" />
                  <span>{isAr ? '☁️ سحابة Firebase' : '☁️ Firebase Sync'}</span>
                </button>
              )}
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setIsNewModalOpen(true)}
              >
                <Plus size={14} />
                <span>{isAr ? 'مشروع جديد +' : '+ New Project'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '36px 16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto'
                }}>
                  <Building size={22} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  {isAr ? 'لا توجد مشاريع مسجلة حالياً' : 'No Projects Available'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                  {isAr 
                    ? 'تم مسح كافة المشاريع. يمكنك إضافة مشروعك الجديد أو استعادة المشاريع النموذجية الاسترشادية.'
                    : 'All projects have been deleted. You can create a new project or restore standard samples.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="btn-primary"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    {isAr ? '+ إنشاء مشروع جديد' : '+ Create Project'}
                  </button>
                  {onRestoreDefaultProjects && (
                    <button
                      onClick={onRestoreDefaultProjects}
                      className="btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      {isAr ? 'استعادة النماذج (٣ مشاريع)' : 'Restore 3 Samples'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              projects.map((proj) => {
                const isCurrent = selectedProject && selectedProject.id === proj.id;
                return (
                  <div 
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: isCurrent ? '2px solid #dc2626' : '1px solid var(--surface-border)',
                      background: isCurrent ? '#fef2f2' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {isAr ? proj.titleAr : proj.titleEn}
                        </h4>
                        {isCurrent && (
                          <span style={{ fontSize: '0.68rem', background: '#dc2626', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                            {isAr ? 'النشط' : 'Active'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${
                          (proj.status === 'Requires Review' || proj.status === 'review_required') ? 'badge-amber' : 
                          (proj.status === 'Potential Issue Identified' || proj.status === 'potential_issue' || proj.status === 'critical_issue') ? 'badge-red' : 'badge-green'
                        }`}>
                          {(proj.status === 'Requires Review' || proj.status === 'review_required') ? (isAr ? 'يتطلب مراجعة' : 'Requires Review') :
                           (proj.status === 'Potential Issue Identified' || proj.status === 'potential_issue' || proj.status === 'critical_issue') ? (isAr ? 'ملاحظة حرجة' : 'Potential Issue') :
                           (isAr ? 'قيد المطابقة' : 'In Review')}
                        </span>

                        {/* Delete Project Button */}
                        {onDeleteProject && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(proj);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '3px 7px',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              transition: 'all 0.15s ease'
                            }}
                            title={isAr ? "مسح هذا المشروع نهائياً" : "Delete Project"}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Trash2 size={13} />
                            <span>{isAr ? 'مسح' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', lineHeight: 1.4 }}>
                      {isAr ? proj.descriptionAr : proj.descriptionEn}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: '#475569', flexWrap: 'wrap' }}>
                      <span>📐 {isAr ? `الارتفاع: ${proj.facts?.buildingHeight || 0}م` : `Height: ${proj.facts?.buildingHeight || 0}m`}</span>
                      <span>🏢 {isAr ? `الأدوار: ${proj.facts?.totalFloors || 0}` : `Floors: ${proj.facts?.totalFloors || 0}`}</span>
                      <span>📏 {isAr ? `المساحة: ${proj.facts?.floorArea || 0} م²` : `Area: ${proj.facts?.floorArea || 0} m²`}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Official 2026 Code Knowledge Base Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>
              <Layers size={20} color="#2563eb" />
              {isAr ? 'وثائق الكود المصري المعتمدة (إصدار ٢٠٢٦)' : 'Official Code Documents (2026 Edition)'}
            </h3>
            <span className="badge badge-green">
              <CheckCircle2 size={12} />
              {isAr ? 'محدث ونشط' : 'Active & Verified'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SOURCE_DOCUMENTS.map((doc) => (
              <div 
                key={doc.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-dark" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      {doc.codeNumber}
                    </span>
                    <strong style={{ fontSize: '0.86rem', color: '#1e293b' }}>
                      {isAr ? doc.titleAr.split(':')[0] : doc.titleEn.split(':')[0]}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    <span>{doc.pages} {isAr ? 'صفحة' : 'pages'}</span> • <span>{doc.sizeMB}</span> • <span>{doc.processingStatus}</span>
                  </div>
                </div>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', flexShrink: 0 }}
                  onClick={() => setCurrentTab('library')}
                >
                  {isAr ? 'تصفح' : 'Open'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>
              {isAr 
                ? 'تمت فهرسة المستندات الرسمية الأربعة الصادرة بالقرار الوزاري ٢٥٥ لسنة ٢٠٢٦ بالكامل، وتعمل المنظومة بمبدأ الربط المصدري الدقيق دون أي تأليف للبند أو رقم الصفحة.'
                : 'All 4 official documents under Decree 255/2026 are fully indexed with zero-hallucination source grounding.'}
            </span>
          </div>
        </div>
      </section>

      {/* Recent Searches */}
      <section className="card">
        <h3 className="card-title">
          <Clock size={18} color="#64748b" />
          {isAr ? 'الاستعلامات الكودية الشائعة والحديثة' : 'Frequent Code Queries & Topics'}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {recentSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(isAr ? item.ar : item.en);
                onQuickAssess(isAr ? item.ar : item.en);
              }}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                color: '#334155',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <Search size={14} color="#64748b" />
              <span>{isAr ? item.ar : item.en}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid #fecaca',
            textAlign: isAr ? 'right' : 'left'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {isAr ? 'تأكيد مسح المشروع' : 'Confirm Project Deletion'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
              {isAr ? (
                <>
                  هل أنت متأكد من مسح مشروع <strong>«{projectToDelete.titleAr}»</strong>؟
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    سيتم حذف بيانات التقييم والمطابقة لهذا المشروع من القائمة (ويمكنك استعادة النماذج الافتراضية بأي وقت).
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete project <strong>"{projectToDelete.titleEn}"</strong>?
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.86rem' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProject) {
                    onDeleteProject(projectToDelete.id);
                  }
                  setProjectToDelete(null);
                }}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={15} />
                {isAr ? 'نعم، امسح المشروع' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Creation Modal */}
      {isNewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 'clamp(10px, 3vw, 20px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: 'clamp(16px, 4vw, 28px)',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '92dvh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            textAlign: isAr ? 'right' : 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={22} color="#dc2626" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isAr ? 'إنشاء وتسجيل مشروع جديد' : 'Create New Project'}
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {isAr ? 'اسم المشروع أو المنشأة:' : 'Project Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newProjectForm.titleAr}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, titleAr: e.target.value })}
                  placeholder={isAr ? "مثال: مجمع العاصمة الإداري والتجاري" : "e.g., Capital Business Mall"}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'نوع الإشغال الرئيسي:' : 'Occupancy Type:'}
                  </label>
                  <select
                    value={newProjectForm.occupancyType}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, occupancyType: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  >
                    <option value="commercial">{isAr ? 'تجاري ومول (هـ-١)' : 'Commercial (E-1)'}</option>
                    <option value="residential">{isAr ? 'سكني عمارات (ج-١)' : 'Residential (C-1)'}</option>
                    <option value="business">{isAr ? 'إداري ومهني (د)' : 'Business (D)'}</option>
                    <option value="industrial">{isAr ? 'صناعي ومخازن (ص-٢)' : 'Industrial (H-2)'}</option>
                    <option value="institutional">{isAr ? 'مستشفيات ورعاية (ب-٣)' : 'Institutional Hospital'}</option>
                    <option value="mixed_comm_bus">{isAr ? 'متعدد الإشغال (تجاري وإداري)' : 'Mixed-Use Commercial/Business'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'الموقع أو المدينة:' : 'Location:'}
                  </label>
                  <input
                    type="text"
                    value={newProjectForm.location}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, location: e.target.value })}
                    placeholder={isAr ? "مثال: التجمع الخامس، القاهرة" : "e.g., New Cairo"}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'الأدوار فوق الأرض:' : 'Above Ground Floors:'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newProjectForm.aboveGroundFloors}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, aboveGroundFloors: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'أدوار البدروم:' : 'Basement Floors:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={newProjectForm.basementFloors}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, basementFloors: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'مساحة الدور (م²):' : 'Floor Area (m²):'}
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="50000"
                    value={newProjectForm.floorArea}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, floorArea: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    {isAr ? 'ارتفاع المبنى الإجمالي (م):' : 'Building Height (m):'}
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="300"
                    value={newProjectForm.buildingHeight}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, buildingHeight: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.86rem' }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? 'تسجيل وبدء التقييم ⟶' : 'Save & Assess ⟶'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
