import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  ExternalLink,
  Info,
  Wrench,
  Droplets,
  Zap,
  Layers,
  Car,
  Compass,
  Trash2
} from 'lucide-react';
import { parseProjectDescription, assessProjectAgainstCode } from '../services/assessmentEngine';
import { OCCUPANCY_CLASSIFICATIONS } from '../data/codeKnowledgeBase';

export default function ProjectAssessment({ 
  lang, 
  selectedProject, 
  onSaveAssessment, 
  initialQuery = '',
  onDeleteProject
}) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const defaultDescription = selectedProject?.descriptionAr || initialQuery || 
    "مبنى تجاري مكون من بدروم وأرضي وخمسة أدوار متكررة، مساحة الدور ١٢٠٠ م²، ارتفاع المبنى ٢٤ م، والبدروم مخصص لانتظار السيارات.";

  const [descriptionInput, setDescriptionInput] = useState(defaultDescription);
  
  // Structured form state
  const [formData, setFormData] = useState({
    occupancyType: selectedProject?.facts?.occupancyType || 'commercial',
    subgroupCode: selectedProject?.facts?.subgroupCode || 'هـ-١',
    aboveGroundFloors: selectedProject?.facts?.aboveGroundFloors || 6,
    basementFloors: selectedProject?.facts?.basementFloors || 1,
    basementUse: selectedProject?.facts?.basementUse || 'parking',
    floorArea: selectedProject?.facts?.floorArea || 1200,
    buildingHeight: selectedProject?.facts?.buildingHeight || 24,
    occupantLoad: selectedProject?.facts?.occupantLoadEstimated || 1400,
    hasSprinklers: 'proposed',
    location: selectedProject?.facts?.location || (isAr ? 'القاهرة الجديدة' : 'New Cairo')
  });

  const runAssessment = (text) => {
    const parsedFacts = parseProjectDescription(text);
    
    // Merge parsed facts with current formData
    const newOccupancy = parsedFacts.occupancyType || formData.occupancyType;
    const newFloors = parsedFacts.aboveGroundFloors !== undefined && parsedFacts.aboveGroundFloors !== null
      ? parsedFacts.aboveGroundFloors
      : formData.aboveGroundFloors;
    const newBasementFloors = parsedFacts.basementFloors !== null && parsedFacts.basementFloors !== undefined 
      ? parsedFacts.basementFloors 
      : formData.basementFloors;
    const newBasementUse = parsedFacts.basementUse || (newBasementFloors === 0 ? 'none' : formData.basementUse);
    const newArea = parsedFacts.floorArea || formData.floorArea;
    
    // In Egypt: Residential floor-to-floor is standard 3.0m (قانون البناء ١١٩/٢٠٠٨); Commercial is 3.3m
    const floorRate = newOccupancy === 'residential' ? 3.0 : 3.3;
    const calculatedHeight = Math.round(newFloors * floorRate * 10) / 10;
    
    // Use parsed text height if available; otherwise dynamically calculate from floors and occupancy.
    // NEVER allow an obsolete 24m from a previous project to persist!
    const newHeight = parsedFacts.buildingHeight ? parsedFacts.buildingHeight : calculatedHeight;
    const newHighestOccupiedHeight = newOccupancy === 'residential'
      ? (parsedFacts.highestOccupiedFloorHeight || Math.round((newFloors - 1) * floorRate * 10) / 10)
      : newHeight;

    const mergedFacts = {
      ...parsedFacts,
      occupancyType: newOccupancy,
      occupancySubgroup: newOccupancy === 'residential' ? 'ج-١' : (parsedFacts.occupancySubgroup || formData.subgroupCode),
      subgroupNameAr: newOccupancy === 'residential' ? 'إشغالات سكنية دائمة (المجموعة ج-١: عمارات شقق سكنية)' : (parsedFacts.subgroupNameAr || undefined),
      aboveGroundFloors: newFloors,
      basementFloors: newBasementFloors,
      basementUse: newBasementUse,
      floorArea: newArea,
      buildingHeight: newHeight,
      highestOccupiedFloorHeight: newHighestOccupiedHeight,
      floorHeightAssumed: floorRate,
      totalFloors: newFloors + newBasementFloors,
      totalArea: newArea * (newFloors + newBasementFloors)
    };

    setFormData(prev => ({
      ...prev,
      occupancyType: newOccupancy,
      subgroupCode: mergedFacts.occupancySubgroup,
      aboveGroundFloors: newFloors,
      basementFloors: newBasementFloors,
      basementUse: newBasementUse,
      floorArea: newArea,
      buildingHeight: newHeight
    }));

    const result = assessProjectAgainstCode(mergedFacts);
    setAssessmentResult(result);
    return result;
  };

  const [assessmentResult, setAssessmentResult] = useState(() => {
    try {
      return assessProjectAgainstCode(parseProjectDescription(defaultDescription));
    } catch {
      return null;
    }
  });
  const [expandedCard, setExpandedCard] = useState(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Run assessment on initialQuery change
  useEffect(() => {
    if (initialQuery) {
      setDescriptionInput(initialQuery);
      runAssessment(initialQuery);
    }
  }, [initialQuery]);

  // Synchronize form and re-run assessment when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      const desc = selectedProject.descriptionAr || selectedProject.name || '';
      setDescriptionInput(desc);
      const newForm = {
        occupancyType: selectedProject.facts?.occupancyType || 'commercial',
        subgroupCode: selectedProject.facts?.subgroupCode || selectedProject.facts?.occupancySubgroup || 'هـ-١',
        aboveGroundFloors: selectedProject.facts?.aboveGroundFloors || 6,
        basementFloors: selectedProject.facts?.basementFloors !== undefined ? selectedProject.facts.basementFloors : 1,
        basementUse: selectedProject.facts?.basementUse || 'parking',
        floorArea: Number(selectedProject.facts?.floorArea) || 1200,
        buildingHeight: Number(selectedProject.facts?.buildingHeight) || 24,
        occupantLoad: selectedProject.facts?.occupantLoadEstimated || 1400,
        hasSprinklers: 'proposed',
        location: selectedProject.facts?.location || (isAr ? 'القاهرة الجديدة' : 'New Cairo')
      };
      setFormData(newForm);
      if (desc) {
        runAssessment(desc);
      } else {
        const res = assessProjectAgainstCode({
          ...selectedProject.facts,
          ...newForm
        });
        setAssessmentResult(res);
      }
    }
  }, [selectedProject?.id]);

  const handleDescriptionSubmit = (e) => {
    e.preventDefault();
    runAssessment(descriptionInput);
  };

  const handleManualFormSubmit = (e) => {
    e.preventDefault();
    const bFloors = formData.basementUse === 'none' ? 0 : Number(formData.basementFloors);
    const bUse = bFloors === 0 ? 'none' : formData.basementUse;
    const occ = formData.occupancyType;

    const manualFacts = {
      occupancyType: occ,
      occupancySubgroup: occ === 'mixed_comm_bus' ? 'هـ / د' : (occ === 'residential' ? 'ج-١' : formData.subgroupCode),
      subgroupNameAr: occ === 'mixed_comm_bus' 
        ? 'مبنى متعدد الإشغال: تجاري وإداري (المجموعتان هـ / د طبقاً للباب الثاني والباب السادس)'
        : (occ === 'business' ? 'إشغالات إدارية ومهنية (المجموعة د)' 
        : (occ === 'residential' ? 'إشغالات سكنية دائمة (المجموعة ج-١: عمارات شقق سكنية)' : undefined)),
      aboveGroundFloors: Number(formData.aboveGroundFloors),
      basementFloors: bFloors,
      basementUse: bUse,
      floorArea: Number(formData.floorArea),
      buildingHeight: Number(formData.buildingHeight),
      totalFloors: Number(formData.aboveGroundFloors) + bFloors,
      totalArea: Number(formData.floorArea) * (Number(formData.aboveGroundFloors) + bFloors),
      occupantLoad: Number(formData.occupantLoad)
    };

    const result = assessProjectAgainstCode(manualFacts);
    setAssessmentResult(result);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title & Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isAr ? 'تقييم المشروع ومطابقة الكود المصري ٢٠٢٦' : 'Project Assessment & Egyptian Fire Code Evaluation'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {isAr 
              ? 'تحليل المعطيات الهندسية ومطابقتها مع القرار الوزاري ٢٥٥ لسنة ٢٠٢٦ مع التوثيق المصدري الدقيق.'
              : 'Engineering fact assessment and compliance check against Decree 255/2026 with exact source grounding.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedProject && onDeleteProject && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                color: '#dc2626',
                borderColor: '#fca5a5',
                background: '#fef2f2'
              }}
              title={isAr ? "مسح هذا المشروع" : "Delete Project"}
            >
              <Trash2 size={16} />
              {isAr ? 'مسح المشروع' : 'Delete Project'}
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
          >
            <Printer size={16} />
            {isAr ? 'طباعة التقرير الفني' : 'Print Assessment'}
          </button>
        </div>
      </div>

      {/* Input Section: Natural Language Box */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#dc2626" />
            {isAr ? 'وصف المشروع باللغة الطبيعية' : 'Natural Language Project Description'}
          </h2>
          <button 
            type="button" 
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            onClick={() => setShowManualForm(!showManualForm)}
          >
            {showManualForm ? (isAr ? 'إخفاء المعاملات الهندسية' : 'Hide Manual Fields') : (isAr ? 'تعديل المعاملات يدوياً' : 'Edit Parameters Manually')}
          </button>
        </div>

        <form onSubmit={handleDescriptionSubmit}>
          <textarea
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #cbd5e1',
              fontFamily: 'inherit',
              fontSize: '0.94rem',
              lineHeight: 1.6,
              color: '#0f172a',
              resize: 'vertical'
            }}
            placeholder={isAr ? "صف المبنى بمصطلحاتك: مثل إشغال تجاري، عدد الأدوار، الارتفاع، البدروم، والمساحات..." : "Describe the building in your words..."}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {assessmentResult?.facts?.detectedEntities?.map((ent, idx) => (
                <span key={idx} className="badge badge-blue" style={{ fontSize: '0.76rem' }}>
                  ✓ {ent.label}
                </span>
              ))}
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
              <RefreshCw size={16} />
              {isAr ? 'إعادة تحليل وتقييم المشروع' : 'Re-Analyze & Assess'}
            </button>
          </div>
        </form>

        {/* Optional Manual Parameters Form */}
        {showManualForm && (
          <form onSubmit={handleManualFormSubmit} style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#1e293b' }}>
              {isAr ? 'المحددات الهندسية التفصيلية' : 'Detailed Engineering Parameters'}
            </h3>
            <div className="grid-3" style={{ gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'نوع الإشغال الرئيسي' : 'Occupancy Type'}
                </label>
                <select
                  value={formData.occupancyType}
                  onChange={(e) => setFormData({ ...formData, occupancyType: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                >
                  <option value="commercial">{isAr ? 'تجاري (هـ)' : 'Commercial (Group E)'}</option>
                  <option value="business">{isAr ? 'إداري ومهني (د)' : 'Business / Admin (Group D)'}</option>
                  <option value="mixed_comm_bus">{isAr ? 'متعدد الإشغال: تجاري وإداري (هـ / د)' : 'Mixed: Commercial & Business (Groups E & D)'}</option>
                  <option value="residential">{isAr ? 'سكني (ج)' : 'Residential (Group C)'}</option>
                  <option value="institutional">{isAr ? 'مؤسسي وصحي (ب)' : 'Institutional / Hospital (Group B)'}</option>
                  <option value="assembly">{isAr ? 'تجمعات أفراد (أ)' : 'Assembly (Group A)'}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'ارتفاع المبنى (متر)' : 'Building Height (m)'}
                </label>
                <input
                  type="number"
                  value={formData.buildingHeight}
                  onChange={(e) => setFormData({ ...formData, buildingHeight: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'مساحة الدور (م²)' : 'Floor Area (m²)'}
                </label>
                <input
                  type="number"
                  value={formData.floorArea}
                  onChange={(e) => setFormData({ ...formData, floorArea: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'أدوار فوق الأرض (أرضي + متكرر)' : 'Floors Above Grade'}
                </label>
                <input
                  type="number"
                  value={formData.aboveGroundFloors}
                  onChange={(e) => setFormData({ ...formData, aboveGroundFloors: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'أدوار البدروم' : 'Basement Floors'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.basementFloors}
                  onChange={(e) => {
                    const count = Math.max(0, parseInt(e.target.value || 0, 10));
                    setFormData(prev => ({
                      ...prev,
                      basementFloors: count,
                      basementUse: count === 0 ? 'none' : (prev.basementUse === 'none' ? 'parking' : prev.basementUse)
                    }));
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'استخدام البدروم' : 'Basement Use'}
                </label>
                <select
                  value={formData.basementUse}
                  onChange={(e) => {
                    const useVal = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      basementUse: useVal,
                      basementFloors: useVal === 'none' ? 0 : (prev.basementFloors === 0 ? 1 : prev.basementFloors)
                    }));
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                >
                  <option value="none">{isAr ? 'لا يوجد بدروم (بدون طوابق تحت الأرض)' : 'None (No Basement Floors)'}</option>
                  <option value="parking">{isAr ? 'جراج انتظار سيارات (Parking)' : 'Parking Garage'}</option>
                  <option value="storage">{isAr ? 'مخازن بضائع (Storage)' : 'Storage'}</option>
                  <option value="services">{isAr ? 'غرف خدمات ميكانيكية وكهربائية' : 'MEP Services'}</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '12px', textAlign: isAr ? 'left' : 'right' }}>
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
                {isAr ? 'تطبيق المعاملات الهندسية' : 'Apply Parameters'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Follow-up Questions Section */}
      {assessmentResult?.followUpQuestions?.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 700, fontSize: '1rem', marginBottom: '10px' }}>
            <HelpCircle size={20} />
            {isAr ? 'أسئلة استيضاحية لاستكمال الملف الهندسي:' : 'Required Follow-up Clarifications:'}
          </div>
          <p style={{ fontSize: '0.84rem', color: '#92400e', marginBottom: '12px' }}>
            {isAr 
              ? 'لتدقيق تقرير المطابقة ومنع أي ثغرات عند العرض على لجان الحماية المدنية، يُرجى تزويد النظام بالبيانات التالية:'
              : 'To ensure complete compliance evaluation before Civil Protection review, please clarify the following:'}
          </p>
          <ul style={{ paddingRight: isAr ? '20px' : '0', paddingLeft: isAr ? '0' : '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {assessmentResult.followUpQuestions.map((q) => (
              <li key={q.id} style={{ fontSize: '0.86rem', color: '#78350f', fontWeight: 600 }}>
                {isAr ? q.questionAr : q.questionEn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assessment Summary Header & Interactive Discipline Filter Bar */}
      {(() => {
        const allFindings = assessmentResult?.findings || [];
        const mechFindings = allFindings.filter(f => f.discipline === 'mechanical');
        const archFindings = allFindings.filter(f => f.discipline === 'architectural');
        const elecFindings = allFindings.filter(f => f.discipline === 'electrical');
        const displayedFindings = disciplineFilter === 'all' 
          ? allFindings 
          : allFindings.filter(f => f.discipline === disciplineFilter);

        return (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {isAr ? `نتائج التقييم الكودي الموثقة (${displayedFindings.length} من أصل ${allFindings.length} بنود)` : `Documented Code Findings (${displayedFindings.length} of ${allFindings.length})`}
                  </h2>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                    {isAr 
                      ? 'تفصيل كامل وشامل للأعمال الميكانيكية (إطفاء ورشاشات وخزان)، والاشتراطات المعمارية ومسالك الهروب والرامبات، والأنظمة الكهربائية والإنذار.'
                      : 'Comprehensive breakdown of mechanical fire protection, architectural egress & ramps, and electrical alarm systems.'}
                  </p>
                </div>
                <span className="badge badge-dark" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                  {isAr ? 'الكود المصري ٢٠٢٦ - قرار ٢٥٥' : 'Decree 255/2026 Grounded'}
                </span>
              </div>

              {/* Discipline Filter Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('all')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: disciplineFilter === 'all' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                    background: disciplineFilter === 'all' ? '#fee2e2' : '#ffffff',
                    color: disciplineFilter === 'all' ? '#991b1b' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Layers size={14} />
                  {isAr ? `جميع البنود الهندسية (${allFindings.length})` : `All Requirements (${allFindings.length})`}
                </button>

                <button
                  type="button"
                  onClick={() => setDisciplineFilter('mechanical')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: disciplineFilter === 'mechanical' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: disciplineFilter === 'mechanical' ? '#e0f2fe' : '#ffffff',
                    color: disciplineFilter === 'mechanical' ? '#0369a1' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Wrench size={14} />
                  {isAr ? `الأعمال الميكانيكية وإطفاء الحريق (${mechFindings.length})` : `Mechanical Fire Protection (${mechFindings.length})`}
                </button>

                <button
                  type="button"
                  onClick={() => setDisciplineFilter('architectural')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: disciplineFilter === 'architectural' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: disciplineFilter === 'architectural' ? '#d1fae5' : '#ffffff',
                    color: disciplineFilter === 'architectural' ? '#065f46' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Building2 size={14} />
                  {isAr ? `الاشتراطات المعمارية والرامبات (${archFindings.length})` : `Architectural Egress & Ramps (${archFindings.length})`}
                </button>

                <button
                  type="button"
                  onClick={() => setDisciplineFilter('electrical')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: disciplineFilter === 'electrical' ? '2px solid #d97706' : '1px solid #cbd5e1',
                    background: disciplineFilter === 'electrical' ? '#fef3c7' : '#ffffff',
                    color: disciplineFilter === 'electrical' ? '#92400e' : '#334155',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Zap size={14} />
                  {isAr ? `الأنظمة الكهربائية والإنذار (${elecFindings.length})` : `Electrical & Alarm (${elecFindings.length})`}
                </button>
              </div>
            </div>

            {/* Structured Findings Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayedFindings.map((finding, idx) => {
                const isExpanded = expandedCard === finding.id || (expandedCard === null && idx === 0);

                // Status Badge styling
                let badgeClass = 'badge-blue';
                if (finding.status === 'Potential Issue Identified') badgeClass = 'badge-red';
                else if (finding.status === 'Requires Professional Review') badgeClass = 'badge-amber';
                else if (finding.status === 'Potentially Applicable') badgeClass = 'badge-green';

                const borderAccent = finding.severity === 'high' 
                  ? '#dc2626' 
                  : (finding.discipline === 'mechanical' ? '#0284c7' : (finding.discipline === 'architectural' ? '#059669' : '#d97706'));

                return (
                  <div key={finding.id} className="card" style={{ borderRight: isAr ? `5px solid ${borderAccent}` : '1px solid var(--surface-border)', borderLeft: !isAr ? `5px solid ${borderAccent}` : '1px solid var(--surface-border)' }}>
                    
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {finding.discipline === 'mechanical' && (
                            <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Wrench size={12} /> {isAr ? 'كود ٣٠٥/٢ - ميكانيكا' : 'Code 305/2 - Mechanical'}
                            </span>
                          )}
                          {finding.discipline === 'architectural' && (
                            <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Building2 size={12} /> {isAr ? 'كود ٣٠٥/١ - معماري ورامبات' : 'Code 305/1 - Egress & Ramps'}
                            </span>
                          )}
                          {finding.discipline === 'electrical' && (
                            <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Zap size={12} /> {isAr ? 'كود ٣٠٥/٣ - كهرباء وإنذار' : 'Code 305/3 - Electrical'}
                            </span>
                          )}

                          <span className="badge badge-dark" style={{ fontSize: '0.74rem' }}>
                            {finding.codeReference.docCode}
                          </span>
                          <span className={`badge ${badgeClass}`}>
                            {finding.statusAr || finding.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                            {finding.category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                          {isAr ? finding.requirementAr : finding.requirementEn}
                        </h3>
                      </div>

                      <button
                        className="btn-secondary"
                        onClick={() => setExpandedCard(isExpanded ? null : finding.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}
                      >
                        {isExpanded ? (isAr ? 'طي التفاصيل' : 'Collapse') : (isAr ? 'عرض النص الكودي' : 'Show Text')}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Facts Used Snippet */}
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                      <strong>{isAr ? 'المعطيات الهندسية المستخدمة: ' : 'Facts Used: '}</strong>
                      {finding.projectFactsUsed}
                    </div>

                    {/* Expanded Detailed Sections */}
                    {isExpanded && (
                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                        
                        {/* 1. Official Code Citation & Verbatim Text */}
                        <div className="citation-box">
                          <div className="citation-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={16} color="#dc2626" />
                              <span>{finding.codeReference.docTitle}</span>
                            </div>
                            <span className="badge badge-dark" style={{ fontSize: '0.72rem' }}>
                              {isAr ? `إصدار ${finding.codeReference.edition} | ${finding.codeReference.article} | ص ${finding.codeReference.page}` : `Ed. ${finding.codeReference.edition} | Art. ${finding.codeReference.article} | p. ${finding.codeReference.page}`}
                            </span>
                          </div>
                          
                          <div className="source-verbatim-text">
                            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b91c1c', marginBottom: '4px' }}>
                              {isAr ? 'النص الرسمي المعتمد للكود (دون أي تحريف):' : 'Verbatim Code Text:'}
                            </div>
                            « {finding.sourceText} »
                          </div>
                        </div>

                        {/* 2. Open Questions & Assumptions */}
                        <div className="grid-2">
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                            <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <HelpCircle size={15} color="#d97706" />
                              {isAr ? 'الأسئلة الفنية المفتوحة' : 'Open Technical Questions'}
                            </h4>
                            <ul style={{ paddingRight: isAr ? '16px' : '0', paddingLeft: isAr ? '0' : '16px', fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {finding.openQuestions?.map((oq, i) => (
                                <li key={i}>{oq}</li>
                              ))}
                            </ul>
                          </div>

                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                            <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Info size={15} color="#2563eb" />
                              {isAr ? 'الافتراضات التصميمية' : 'Design Assumptions'}
                            </h4>
                            <ul style={{ paddingRight: isAr ? '16px' : '0', paddingLeft: isAr ? '0' : '16px', fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {finding.assumptions?.map((asmp, i) => (
                                <li key={i}>{asmp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* 3. Recommended Next Step */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <ShieldCheck size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                          <div style={{ fontSize: '0.84rem', color: '#166534' }}>
                            <strong>{isAr ? 'الإجراء الهندسي الموصى به: ' : 'Recommended Next Step: '}</strong>
                            {finding.recommendedNextStep}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
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
                  هل أنت متأكد من مسح مشروع <strong>«{selectedProject.titleAr}»</strong>؟
                  <br />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    سيتم مسح المشروع من بيئة العمل وستتمكن من إنشاء مشروع جديد أو اختيار مشروع آخر.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete project <strong>"{selectedProject.titleEn}"</strong>?
                </>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.86rem' }}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProject) {
                    onDeleteProject(selectedProject.id);
                  }
                  setShowDeleteModal(false);
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

    </div>
  );
}
