import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Download, 
  Printer, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  FileCheck2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { CODE_PROVISIONS, OFFICIAL_METADATA } from '../data/codeKnowledgeBase';

export default function IssueWorkspace({ lang, selectedProject, onGenerateReport }) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ChevronLeft : ChevronRight;

  // State for the issue form
  const [issueTitle, setIssueTitle] = useState(
    isAr 
      ? "تجاوز مسافة الارتحال بأحد أدوار المبنى القائم وعدم وجود درج هروب ثانٍ مباشر"
      : "Excess travel distance on 3rd floor and lack of secondary direct exit staircase in existing building"
  );

  const [issueDescription, setIssueDescription] = useState(
    isAr 
      ? "مبنى تجاري قائم منذ ٢٠١٨، تم رصد ملاحظة من إدارة الحماية المدنية أثناء المعاينة الدورية تفيد بوجود مسار هروب بطول ٥٨ متراً ينتهي بدرج واحد غير معزول حريقياً، مع تعذر إنشاء درج خارجي إضافي بسبب ارتدادات الجار الملاصق."
      : "Existing commercial building constructed in 2018. Civil Protection inspection noted a 58m travel distance leading to a single unrated staircase, with site boundary constraints preventing external fire stairs."
  );

  const [selectedIssueCategory, setSelectedIssueCategory] = useState('egress');
  const [analyzed, setAnalyzed] = useState(true);

  // Categorized realistic corrective options with full Arabic & English data
  const OPTIONS_BY_CATEGORY = {
    egress: [
      {
        id: 'opt-a',
        titleAr: 'البديل الأول: إنشاء ممر هروب أفقي محمي (Horizontal Exit) مع زيادة معدل الرشاشات',
        titleEn: 'Option A: Pressurized Horizontal Exit Corridor with Enhanced Fast-Response Sprinklers',
        advantagesAr: 'لا يتطلب نزع ملكية أو تعدي على خط التنظيم الخارجي، ويوفر منطقة لجوء آمنة بنفس الطابق.',
        advantagesEn: 'No external boundary encroachment, creates a safe refuge area on the same level.',
        constraintsAr: 'يتطلب التضحية بجزء من المساحة الإيجارية وتأكيد مقاومة الفاصل الحريقي ساعتين مع أبواب ذاتية الغلق.',
        constraintsEn: 'Requires partial retail area reduction and certified 2-hr fire-rated wall with magnetic hold-open doors.',
        assumptionsAr: 'افتراض قدرة البلاطة الخرسانية القائمة على تحمل عزل الحريق ساعتين.',
        assumptionsEn: 'Assumption of existing reinforced concrete slab achieving 2-hr fire resistance rating.',
        codeCitation: 'كود ٣٠٥/١ - الباب الرابع - البند ٤-٣-٢ (المخارج الأفقية)',
        authorityApprovalLikelihood: 'خيار معتمد كودياً كبديل هندسي معادل بموافقة اللجنة الفنية الاستشارية للحماية المدنية'
      },
      {
        id: 'opt-b',
        titleAr: 'البديل الثاني: عزل الدرج الداخلي القائم بحوائط ساعتين وتوفير نظام ضغط هواء موجب مع رشاشات ESFR',
        titleEn: 'Option B: Enclose Existing Staircase with 2-Hr Shaft & Positive Pressure Fans + ESFR Sprinklers',
        advantagesAr: 'أقل تكلفة إنشائية، ويحمي مسار الهروب القائم بالكامل من تسرب الدخان والحرارة.',
        advantagesEn: 'Lower structural disruption, protects existing staircase from smoke penetration.',
        constraintsAr: 'يتطلب مساراً كهربائياً آمناً ومولد طوارئ لتشغيل مراوح الضغط الموجب دون انقطاع.',
        constraintsEn: 'Requires dedicated fire-rated wiring and standby generator for uninterrupted pressurization fan operation.',
        assumptionsAr: 'افتراض توفر مخرج مباشر في أسفل الدرج يؤدي للشارع الخارجي.',
        assumptionsEn: 'Assumption of direct ground floor discharge leading safely to public way.',
        codeCitation: 'كود ٣٠٥/١ - الباب الخامس - البند ٥-١-٤ (السلالم المضغوطة)',
        authorityApprovalLikelihood: 'مقبول بنسبة عالية مع تقديم دراسة سريان الهواء معتمدة من استشاري ميكانيكا'
      },
      {
        id: 'opt-c',
        titleAr: 'البديل الثالث: إعادة تقسيم الإشغال وتخفيض الحمولة الاستيعابية (Occupant Load Capping)',
        titleEn: 'Option C: Occupancy Compartmentalization & Occupant Load Reduction',
        advantagesAr: 'تخفيض متطلبات تدفق الأشخاص دون أعمال هدم وتعديل إنشائي واسع.',
        advantagesEn: 'Reduces required egress width without major civil demolition.',
        constraintsAr: 'يفرض قيوداً تشغيلية وتجارية على عدد الزوار والمحلات المسموح بتشغيلها.',
        constraintsEn: 'Imposes operational capacity limits on the commercial facility.',
        assumptionsAr: 'افتراض إمكانية التحكم الإداري والأمني في عدد الداخلين للمبنى.',
        assumptionsEn: 'Assumption of strict administrative access control on maximum occupant density.',
        codeCitation: 'كود ٣٠٥/١ - الباب الثاني - البند ٢-١ (كثافة الإشغال)',
        authorityApprovalLikelihood: 'يتطلب تعهداً موثقاً من مالك المشروع وموافقة مديرية أمن الحماية المدنية المختصة'
      }
    ],
    transformers: [
      {
        id: 'opt-t1',
        titleAr: 'البديل الأول: حماية الغرفة بنظام إطفاء غازي تلقائي (Clean Agent) مع عزل إنشائي ٣ ساعات',
        titleEn: 'Option A: Clean Agent Total Flooding System with 3-Hr Fire Rated Enclosure',
        advantagesAr: 'إخماد سريع فوري دون إتلاف المعدات الكهربائية الحية ودون الحاجة لتصريف مياه.',
        advantagesEn: 'Instant non-conductive suppression without water damage to live electrical equipment.',
        constraintsAr: 'يتطلب إحكام الغرفة (Room Integrity Test) وخوانق حريق آلية تغلق قبل التفريغ.',
        constraintsEn: 'Requires certified room envelope integrity and automatic motorized fire dampers.',
        assumptionsAr: 'افتراض إمكانية فصل التغذية الكهربائية آلياً (Trip Coil) عند إشارة الإنذار.',
        assumptionsEn: 'Assumption of automatic trip-coil interlock disconnecting power prior to discharge.',
        codeCitation: 'كود ٣٠٥/٢ - الباب الرابع ص ٤-١٢ وكود ٣٠٥/٣ ص ١-١٨',
        authorityApprovalLikelihood: 'مطابق تماماً لاشتراطات كود الحماية المدنية لغرف المحولات'
      },
      {
        id: 'opt-t2',
        titleAr: 'البديل الثاني: استبدال المحول الزيتي بمحول جاف (Dry-Type Transformer)',
        titleEn: 'Option B: Replace Oil-Filled with Cast-Resin Dry-Type Transformer',
        advantagesAr: 'إلغاء خطر انتشار الزيت المشتعل وتخفيض متطلب العزل الحريقي إلى ساعتين فقط.',
        advantagesEn: 'Eliminates pool fire risk and reduces required wall fire separation to 2 hours.',
        constraintsAr: 'تكلفة استبدال المعدات مرتفعة نسبياً.',
        constraintsEn: 'Higher initial capital expenditure for transformer equipment replacement.',
        assumptionsAr: 'افتراض قدرة الشبكة وأبعاد الغرفة على استيعاب المحول الجاف.',
        assumptionsEn: 'Assumption of adequate ventilation and physical dimensions for dry-type cooling.',
        codeCitation: 'كود ٣٠٥/١ - الباب الثالث ص ٣-١٥',
        authorityApprovalLikelihood: 'مقبول ومعتمد ويوصى به للمباني الإدارية والتجارية المغلقة'
      }
    ],
    smoke: [
      {
        id: 'opt-s1',
        titleAr: 'البديل الأول: نظام سحب دخان ميكانيكي بمعدل ١٠ مرات/ساعة ومجاري هواء مقاومة ساعتين',
        titleEn: 'Option A: Mechanical Smoke Exhaust System @ 10 ACH with 2-Hr Fire Rated Ductwork',
        advantagesAr: 'سحب فعال للدخان والحرارة يضمن مسارات هروب مرئية لفرق الإنقاذ.',
        advantagesEn: 'Effective smoke evacuation maintaining tenable egress conditions.',
        constraintsAr: 'يتطلب فتحات تعويض هواء طبيعي أو ميكانيكي بنسبة ٧٥-٨٠٪ من معدل السحب.',
        constraintsEn: 'Requires dedicated makeup air system delivering 75-80% of exhaust rate.',
        assumptionsAr: 'افتراض توفر تغذية طوارئ كهربائية مستقلة للمراوح من المولد.',
        assumptionsEn: 'Assumption of dual power supply from life-safety standby generator.',
        codeCitation: 'كود ٣٠٥/٢ - الباب الخامس (التهوية وسحب الدخان) ص ٥-١١',
        authorityApprovalLikelihood: 'الحل الكودي الإلزامي المعتمد من الحماية المدنية للبدرومات'
      },
      {
        id: 'opt-s2',
        titleAr: 'البديل الثاني: نظام مراوح الدفع النفاثة (Jet Fans) الموجهة مع نمذجة CFD',
        titleEn: 'Option B: Impulse Jet Fan Ventilation System with Validated CFD Simulation',
        advantagesAr: 'يلغي مجاري الهواء الضخمة ويوفر مساحات رأسية للسيارات والخدمات.',
        advantagesEn: 'Eliminates extensive duct runs, saving critical ceiling clearance.',
        constraintsAr: 'يتطلب تقديم دراسة محاكاة ديناميكا موائع حسابية (CFD) معتمدة من استشاري.',
        constraintsEn: 'Requires certified CFD modeling showing velocity distribution and smoke clearance.',
        assumptionsAr: 'افتراض تقسيم الجراج إلى مناطق دخان لا تتجاوز ٢٥٠٠ م² لكل منطقة.',
        assumptionsEn: 'Assumption of smoke zoning not exceeding 2,500 m² per exhaust section.',
        codeCitation: 'كود ٣٠٥/٢ - ملحق أنظمة التهوية النفاثة والقرار ٢٥٥/٢٠٢٦',
        authorityApprovalLikelihood: 'مقبول لدى لجان الحماية المدنية بموجب دراسة CFD معتمدة'
      }
    ]
  };

  const correctiveOptions = OPTIONS_BY_CATEGORY[selectedIssueCategory] || OPTIONS_BY_CATEGORY.egress;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title & Official Stamp Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
            <AlertTriangle size={14} />
            {isAr ? 'مسودة دراسة فنية للمناقشة مع لجان الحماية المدنية' : 'Discussion Draft — Requires Review by Competent Authority'}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isAr ? 'مساحة دراسة حالات وملاحظات المباني القائمة' : 'Existing-Project Issue & Compliance Workspace'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {isAr 
              ? 'صياغة الملاحظات الفنية للمنشآت القائمة وإعداد بدائل الحلول الهندسية المرجعية للعرض على السلطات المختصة.'
              : 'Document reported life-safety issues, evaluate code provisions, and prepare balanced discussion options.'}
          </p>
        </div>

        <button 
          onClick={onGenerateReport}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText size={16} />
          {isAr ? 'تصدير المذكرة الفنية الرسمية (PDF/DOCX)' : 'Export Technical Memorandum'}
        </button>
      </div>

      {/* Main Form: Issue Formulation */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} color="#dc2626" />
          {isAr ? 'بيانات الملاحظة أو المخالفة المرصودة' : 'Reported Fire-Safety Issue & Known Facts'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              {isAr ? 'تصنيف الملاحظة الفنية / نوع المنظومة:' : 'Issue Category / System Type:'}
            </label>
            <select
              value={selectedIssueCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setSelectedIssueCategory(cat);
                if (cat === 'egress') {
                  setIssueTitle(isAr ? 'تجاوز مسافة الارتحال بأحد أدوار المبنى وعدم وجود درج هروب ثانٍ مباشر' : 'Excess travel distance and single fire exit staircase');
                  setIssueDescription(isAr ? 'مبنى قائم تم رصد مسار هروب بطول ٥٨ متراً ينتهي بدرج واحد غير معزول مع تعذر إنشاء درج خارجي بسبب ارتداد الجار.' : '58m travel distance leading to a single unrated staircase with boundary constraints.');
                } else if (cat === 'transformers') {
                  setIssueTitle(isAr ? 'وجود غرفة محول كهربائي ملاصقة لممر هروب رئيسي بدون عزل ٣ ساعات' : 'Transformer room adjacent to main egress path without 3-hr fire rating');
                  setIssueDescription(isAr ? 'غرفة محول مغمور بالزيت تفتح أبوابها على ممر داخلي ولا تحتوي على وسيط إطفاء غازي تلقائي أو حوض احتواء زيت.' : 'Oil transformer room discharging onto internal corridor without clean agent suppression or bund wall.');
                } else if (cat === 'smoke') {
                  setIssueTitle(isAr ? 'قصور تهوية وسحب دخان بدروم جراج سيارات متعدد الطوابق' : 'Inadequate mechanical smoke exhaust in multi-level parking basement');
                  setIssueDescription(isAr ? 'بدروم سيارات بمساحة ١٢٠٠ م² لا يحتوي على مجاري سحب دخان كودية (١٠ مرات/ساعة) أو فتحات تعويض هواء.' : '1200 m² parking basement lacking 10 ACH mechanical smoke extraction and makeup air dampers.');
                }
                setAnalyzed(true);
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.92rem', color: '#0f172a', background: '#ffffff' }}
            >
              <option value="egress">{isAr ? 'مسارات الهروب والسلالم وعروض الأبواب (كود ٣٠٥/١)' : 'Egress Paths, Staircases & Door Widths (Code 305/1)'}</option>
              <option value="transformers">{isAr ? 'غرف المحولات واللوحات الكهربائية والعزل الحريقي (كود ٣٠٥/١ و ٣٠٥/٢ و ٣٠٥/٣)' : 'Transformer & Electrical Rooms (Code 305/1, 305/2, 305/3)'}</option>
              <option value="smoke">{isAr ? 'سحب دخان البدروم والجراجات ومراوح الضغط (كود ٣٠٥/٢ و ٣٠٥/٣)' : 'Basement Smoke Exhaust & Pressurization (Code 305/2, 305/3)'}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              {isAr ? 'عنوان الملاحظة الفنية:' : 'Issue Title:'}
            </label>
            <input
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.92rem', color: '#0f172a' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              {isAr ? 'شرح الملاحظة والوقائع الهندسية القائمة:' : 'Detailed Description & Known Facts:'}
            </label>
            <textarea
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {isAr ? 'المشروع المرتبط: ' : 'Linked Project: '}
                <strong>{selectedProject ? (isAr ? selectedProject.titleAr : selectedProject.titleEn) : (isAr ? 'المجمع التجاري - القاهرة' : 'Commercial Center')}</strong>
              </span>
            </div>

            <button
              onClick={() => setAnalyzed(true)}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.86rem' }}
            >
              <Sparkles size={16} />
              {isAr ? 'تحديث بدائل الحلول والدراسة' : 'Generate Discussion Options'}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analyzed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Missing Information Notice */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} />
              {isAr ? 'المعلومات الناقصة المؤثرة في القرار الهندسي:' : 'Missing Information Impacting Engineering Decision:'}
            </h3>
            <ul style={{ paddingRight: isAr ? '20px' : '0', paddingLeft: isAr ? '0' : '20px', fontSize: '0.84rem', color: '#1e3a8a', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>{isAr ? 'تقرير معاينة إنشائية لسقف وبلاطة الدور لتأكيد مقاومة الفاصل الحريقي ساعتين.' : 'Structural condition report confirming 2-hr fire resistance of existing slab.'}</li>
              <li>{isAr ? 'قياس دقيق لضغط وتدفق شبكة مياه الحريق القائمة من أقرب حنفية حريق بلدية.' : 'Flow and pressure test data of nearest municipal fire hydrant.'}</li>
              <li>{isAr ? 'موافقة الجار الملاصق في حالة الحاجة لفتح منافذ تهوية أو سحب دخان علوية.' : 'Adjoining property boundary agreements for overhead smoke exhaust discharge.'}</li>
            </ul>
          </div>

          {/* Options for Discussion Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {isAr ? 'بدائل وحلول هندسية مطروحة للمناقشة مع الحماية المدنية' : 'Engineered Corrective Options for Authority Discussion'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {isAr 
                  ? 'خيارات استرشادية مبنية على الكود المصري ٢٠٢٦ ولا تعني الموافقة التلقائية حتى اعتمادها من اللجنة الفنية.'
                  : 'Discussion options grounded in Egyptian Fire Code 2026. Explicitly requires Civil Protection committee approval.'}
              </p>
            </div>
            <span className="badge badge-amber">
              {isAr ? 'مسودة مناقشة رسمية' : 'Discussion Draft'}
            </span>
          </div>

          {/* Corrective Options Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {correctiveOptions.map((opt, index) => (
              <div key={opt.id} className="card" style={{ borderTop: `4px solid ${index === 0 ? '#10b981' : index === 1 ? '#2563eb' : '#d97706'}` }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {isAr ? opt.titleAr : opt.titleEn}
                  </h3>
                  <span className="badge badge-dark" style={{ fontSize: '0.72rem' }}>
                    {opt.codeCitation}
                  </span>
                </div>

                <div className="grid-2" style={{ gap: '14px', marginBottom: '14px' }}>
                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', fontSize: '0.82rem' }}>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>
                      ✓ {isAr ? 'المزايا الفنية والتشغيلية:' : 'Advantages:'}
                    </strong>
                    <span style={{ color: '#14532d' }}>{isAr ? opt.advantagesAr : opt.advantagesEn}</span>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a', fontSize: '0.82rem' }}>
                    <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>
                      ⚠️ {isAr ? 'المحددات والقيود التنفيذية:' : 'Constraints:'}
                    </strong>
                    <span style={{ color: '#78350f' }}>{isAr ? opt.constraintsAr : opt.constraintsEn}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <strong>{isAr ? 'الافتراض الهندسي: ' : 'Assumption: '}</strong>
                    {isAr ? opt.assumptionsAr : opt.assumptionsEn}
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e40af' }}>
                    📋 {isAr ? opt.authorityApprovalLikelihood : 'Requires specialized consulting engineer review'}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Authority Comments & Decision Box Preview */}
          <div className="card" style={{ background: '#fafaf9', border: '2px dashed #cbd5e1' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
              {isAr ? 'مساحة مخصصة لقرار وملاحظات ضابط / مهندس الحماية المدنية المختص:' : 'Space for Civil Protection Officer / Committee Decision:'}
            </h3>
            <div style={{ height: '110px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
              {isAr 
                ? 'يُترك هذا الجزء فارغاً في المسودة ليتم تدوين التوجيهات الرسمية وخاتم الإدارة العامة للحماية المدنية أثناء جلسة العرض والمناقشة...'
                : 'Reserved for official Civil Protection committee remarks, conditions, and official stamp.'}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
