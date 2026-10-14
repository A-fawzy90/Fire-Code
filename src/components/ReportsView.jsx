import React from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  Flame,
  ExternalLink
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/codeKnowledgeBase';
import FireBrandLogo from './FireBrandLogo';

export default function ReportsView({ lang, selectedProject }) {
  const isAr = lang === 'ar';

  const project = selectedProject || {
    titleAr: "مجمع تجاري وبدروم مواقف - القاهرة الجديدة",
    titleEn: "Commercial Center & Basement Parking - New Cairo",
    descriptionAr: "مبنى تجاري مكون من بدروم وأرضي وخمسة أدوار متكررة، مساحة الدور ١٢٠٠ م²، ارتفاع المبنى ٢٤ م، والبدروم مخصص لانتظار السيارات.",
    facts: {
      occupancyType: "commercial",
      subgroupCode: "هـ-١",
      subgroupNameAr: "إشغالات تجارية كبيرة (المجموعة هـ-١)",
      buildingHeight: 24,
      aboveGroundFloors: 6,
      basementFloors: 1,
      totalFloors: 7,
      floorArea: 1200,
      totalArea: 8400,
      basementUse: "parking",
      location: "التجمع الخامس، القاهرة الجديدة"
    }
  };

  const handleDownloadDocx = () => {
    // Generate valid Microsoft Word HTML formatted document (.doc)
    const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${project.titleAr}</title>
<style>
  body { font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; margin: 40px; color: #0f172a; line-height: 1.6; }
  h1 { color: #b91c1c; font-size: 18pt; border-bottom: 2px solid #b91c1c; padding-bottom: 8px; text-align: center; }
  h2 { color: #1e293b; font-size: 14pt; margin-top: 24px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 11pt; }
  th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: right; }
  th { background-color: #f1f5f9; color: #1e293b; }
  .alert { background-color: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 12px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 6px; }
  .footer { margin-top: 40px; font-size: 10pt; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
</style>
</head>
<body dir="rtl">
  <h1>مذكرة فنية استرشادية لمطابقة كود الحريق المصري</h1>
  <p style="text-align: center; font-size: 12pt; color: #475569;">وفق متطلبات قرار وزير الإسكان والمرافق رقم ٢٥٥ لسنة ٢٠٢٦</p>
  
  <div class="alert">
    ⚠️ مسودة فنية استرشادية للعرض والمناقشة — تتطلب مراجعة واعتماد الإدارة العامة للحماية المدنية
  </div>

  <h2>أولاً: بيانات المشروع</h2>
  <table>
    <tr><th width="30%">اسم المشروع</th><td>${project.titleAr}</td></tr>
    <tr><th>الموقع العام</th><td>${project.facts.location || 'غير محدد'}</td></tr>
    <tr><th>التصنيف الكودي</th><td>${project.facts.subgroupNameAr || 'إشغال عام'}</td></tr>
    <tr><th>الارتفاع وعدد الطوابق</th><td>ارتفاع المبنى: ${project.facts.buildingHeight} متراً (${project.facts.totalFloors} طوابق)</td></tr>
    <tr><th>المساحة</th><td>مساحة الدور: ${project.facts.floorArea} م² • إجمالي المساحة: ${project.facts.totalArea} م²</td></tr>
  </table>

  <h2>ثانياً: الاشتراطات الفنية المطبقة</h2>
  <table>
    <tr><th>المجال الهندسي</th><th>الاشتراط الكودي والمتطلب الإلزامي</th><th>المرجع بالكود المصري</th></tr>
    <tr>
      <td>الارتفاع والسلامة</td>
      <td>${Number(project.facts.buildingHeight) > 22 ? 'تطبيق اشتراطات المباني المرتفعة: شبكة رشاشات مائية شاملة، مصعد إطفاء، سلالم مضغوطة.' : 'منشأة منخفضة / متوسطة الارتفاع، استيفاء اشتراطات الهروب والتهوية الطبيعية.'}</td>
      <td>كود ٣٠٥/١ - الباب الخامس</td>
    </tr>
    <tr>
      <td>أدوار البدروم</td>
      <td>${Number(project.facts.basementFloors) > 0 ? `فصل حريقي ساعتين، سحب دخان ميكانيكي بمعدل ${project.facts.basementUse === 'parking' ? '١٠' : '٦'} مرات/ساعة، فصل السلالم بمخرج مباشر.` : 'المبنى بدون بدروم (إعفاء من سحب دخان البدرومات).'}</td>
      <td>كود ٣٠٥/١ - الباب الخامس ص ٥-١٠</td>
    </tr>
    <tr>
      <td>مسالك الهروب</td>
      <td>معامل سعة السلالم ٧٫٦ مم/شخص و ٥٫٠ مم للأبواب (ينخفض إلى ٥٫٠ مم و ٣٫٨ مم مع الرشاشات التلقائية).</td>
      <td>كود ٣٠٥/١ - الباب الرابع ص ٤-١٢</td>
    </tr>
  </table>

  <div class="footer">
    تم الإعداد بواسطة: منظومة مساعد كود الحريق المصري (إصدار ٢٠٢٦)<br>
    تصميم وتطوير: المهندس / أحمد فوزي — مهندس أنظمة مكافحة وإنذار الحريق ومصمم البرنامج
  </div>
</body>
</html>
    `;

    const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Technical_Memorandum_Fire_Code_${Date.now()}.doc`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isAr ? 'حزمة التقارير والمذكرات الفنية الرسمية' : 'Official Reports & Review Package'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {isAr 
              ? 'صياغة المذكرة الهندسية للعرض على لجان الدفاع المدني والجهات الرسمية مع التوثيق المصدري الكامل.'
              : 'Formulate official technical submission memoranda for Civil Protection review.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={16} />
            {isAr ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleDownloadDocx}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} />
            {isAr ? 'تحميل كملف Word (.doc)' : 'Download Word Doc (.doc)'}
          </button>
        </div>
      </div>

      {/* Printable Technical Memorandum Document Sheet */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 'var(--radius-lg)',
        padding: '48px',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        lineHeight: 1.7,
        color: '#0f172a'
      }}>
        
        {/* Official Letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              {isAr ? 'مذكرة فنية استرشادية لمطابقة كود الحريق' : 'Technical Fire Code Verification Memorandum'}
            </div>
            <div style={{ fontSize: '0.86rem', color: '#334155' }}>
              {isAr ? 'وفق الكود المصري لحماية المنشآت من أخطار الحريق (قرار وزاري رقم ٢٥٥ لسنة ٢٠٢٦)' : 'Compliant with Egyptian Fire Code (Decree No. 255/2026)'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {isAr ? 'إعداد: المهندس / أحمد فوزي — مهندس أنظمة مكافحة وإنذار الحريق ومصمم البرنامج' : 'Prepared by: Eng. Ahmed Fawzy — Fire Protection & Alarm Systems Engineer'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              <FireBrandLogo size={46} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626' }}>
              كود الحريق ٣٠٥
            </span>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
              {isAr ? 'مذكرة فنية استرشادية' : 'Technical Review Memorandum'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {isAr ? 'القرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦' : 'Decree No. 255/2026'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Mandatory Watermark / Legal Banner */}
        <div style={{
          background: '#fee2e2',
          border: '1px solid #f87171',
          padding: '10px 16px',
          borderRadius: '6px',
          textAlign: 'center',
          fontWeight: 800,
          color: '#991b1b',
          fontSize: '0.92rem',
          marginBottom: '28px'
        }}>
          ⚠️ {isAr ? 'مسودة فنية للمناقشة — تتطلب مراجعة واعتماد الإدارة العامة للحماية المدنية' : 'DISCUSSION DRAFT — REQUIRES REVIEW AND APPROVAL BY CIVIL PROTECTION'}
        </div>

        {/* Section 1: Project Identification */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
            {isAr ? 'أولاً: بيانات المنشأة والمعطيات الهندسية المعتمدة' : '1. Project Identification & Technical Data'}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 700, color: '#475569', width: '30%' }}>{isAr ? 'اسم المشروع:' : 'Project Name:'}</td>
                <td style={{ padding: '8px', color: '#0f172a' }}>{isAr ? project.titleAr : project.titleEn}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 700, color: '#475569' }}>{isAr ? 'الموقع العام:' : 'Location:'}</td>
                <td style={{ padding: '8px', color: '#0f172a' }}>{project.facts.location}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 700, color: '#475569' }}>{isAr ? 'التصنيف الكودي للإشغال:' : 'Occupancy Group:'}</td>
                <td style={{ padding: '8px', color: '#0f172a' }}>
                  <strong>{project.facts.subgroupNameAr}</strong> ({isAr ? 'جدول ٢-١ الباب الثاني' : 'Table 2-1'})
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 700, color: '#475569' }}>{isAr ? 'عدد الطوابق والارتفاع:' : 'Floors & Height:'}</td>
                <td style={{ padding: '8px', color: '#0f172a' }}>
                  {project.facts.totalFloors} {isAr ? 'طوابق' : 'floors'} ({project.facts.basementFloors} {isAr ? 'بدروم' : 'basement'} + {project.facts.aboveGroundFloors} {isAr ? 'أرضي ومتكرر' : 'above'}) • {isAr ? `ارتفاع المبنى: ${project.facts.buildingHeight} متراً` : `Height: ${project.facts.buildingHeight}m`}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px', fontWeight: 700, color: '#475569' }}>{isAr ? 'مساحة الدور والإجمالي:' : 'Floor & Total Area:'}</td>
                <td style={{ padding: '8px', color: '#0f172a' }}>
                  {project.facts.floorArea} م² {isAr ? 'للدور' : '/ floor'} • {project.facts.totalArea} م² {isAr ? 'إجمالي المساحة' : 'total'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Core Code Provisions Applied */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
            {isAr ? 'ثانياً: البنود والاشتراطات الكودية الإلزامية المطبقة' : '2. Applicable Code Provisions & Direct Citations'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Dynamic Height Classification */}
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  {Number(project.facts.buildingHeight) > 22 
                    ? (isAr ? '١. اشتراطات المباني المرتفعة (High-Rise Provisions)' : '1. High-Rise Building Provisions')
                    : (isAr ? '١. اشتراطات المباني منخفضة ومتوسطة الارتفاع' : '1. Low / Mid-Rise Building Provisions')}
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  {Number(project.facts.buildingHeight) > 22 
                    ? (isAr ? 'كود ٣٠٥/١ - الباب الخامس - ص ٥-٢' : 'Code 305/1 - Ch. 5 - p. 5-2')
                    : (isAr ? 'كود ٣٠٥/١ - الباب الرابع - ص ٤-٨' : 'Code 305/1 - Ch. 4 - p. 4-8')}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                {Number(project.facts.buildingHeight) > 22
                  ? (isAr 
                      ? `تجاوز ارتفاع المبنى (${project.facts.buildingHeight} متراً) لحد الارتفاع الكودي (٢٢م للإشغالات التجارية والإدارية / ٢٨م للسكني) يلزمه توفير شبكة رشاشات تلقائية شاملة لكافة الأدوار، ومصعد مخصص لرجال الإطفاء، وسلالم هروب مغلقة ومحمية بضغط هواء موجب (٢٥-٥٠ باسكال).`
                      : `Building height (${project.facts.buildingHeight}m) exceeds the high-rise threshold (22m mercantile/business / 28m residential), mandating automatic sprinklers throughout, designated firefighter lift, and pressurized staircases.`)
                  : (isAr
                      ? `ارتفاع المبنى الحالي (${project.facts.buildingHeight} متراً) يقع دون حد المباني المرتفعة، مما يعفي المشروع من متطلبات مصاعد الحريق المخصصة وشبكات ضغط السلالم المعقدة، مع الاكتفاء بالتهوية الطبيعية للسلالم الخارجية أو صواعد الهروب المحمية ساعتين.`
                      : `Building height (${project.facts.buildingHeight}m) is below the high-rise limit, exempting it from specialized firefighter lifts and complex stair pressurization, provided natural ventilation or protected enclosures are maintained.`)}
              </p>
            </div>

            {/* Dynamic Basement Assessment */}
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  {Number(project.facts.basementFloors) > 0
                    ? (isAr ? '٢. عزل جراج البدروم وسحب الدخان الميكانيكي' : '2. Basement Compartmentation & Smoke Exhaust')
                    : (isAr ? '٢. وضعية أدوار البدروم (Basement Floors)' : '2. Basement Assessment')}
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  {isAr ? 'كود ٣٠٥/١ - الباب الخامس - ص ٥-١٠' : 'Code 305/1 - Ch. 5 - p. 5-10'}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                {Number(project.facts.basementFloors) > 0
                  ? (isAr
                      ? `عزل أرضيات وحوائط البدروم بفواصل حريق لا تقل عن ساعتين، وتركيب نظام ميكانيكي مستقل لسحب الدخان بمعدل ${project.facts.basementUse === 'parking' ? '١٠' : '٦'} مرات تغيير هواء/ساعة مع فصل سلالم هروب البدروم بمخرج مباشر للخارج.`
                      : `Basement requires 2-hour fire-rated separation, independent mechanical smoke exhaust at ${project.facts.basementUse === 'parking' ? '10' : '6'} ACH, and direct-to-exterior isolated stairs.`)
                  : (isAr
                      ? `المبنى مصمم بدون أدوار تحت الأرض (صفر بدروم)، مما يمنحه إعفاءً كودياً كاملاً من اشتراطات سحب دخان البدرومات الميكانيكية المعقدة وفواصل العزل تحت السطحية.`
                      : `Building contains no underground levels (zero basements), granting full exemption from complex basement mechanical smoke exhaust systems.`)}
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  ٣. سعة خزان مياه مكافحة الحريق ومجموعة الطلمبات
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  كود ٣٠٥/٢ - الباب الثالث - ص ٣-١٨
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                توفير خزان أرضي مستقل بسعة تكفي تشغيل شبكة الرشاشات وصناديق الحريق لمدة ٩٠ دقيقة متصل بمجموعة طلمبات ثلاثية (كهرباء + ديزل احتياطي + جوكي).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Options for Discussion */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>
            {isAr ? 'ثالثاً: الحلول والبدائل الهندسية المعروضة للمناقشة' : '3. Proposed Options for Discussion'}
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p><strong>البديل (أ):</strong> إنشاء ممر هروب أفقي محمي (Horizontal Exit) مع زيادة معدل تدفق الرشاشات التلقائية بالمنطقة التجارية.</p>
            <p><strong>البديل (ب):</strong> عزل الدرج الداخلي القائم بقواطع ساعتين وتركيب منظومة مراوح ضغط هواء موجب لآبار السلالم متصلة بمولد الطوارئ.</p>
          </div>
        </div>

        {/* Section 4: Authority Decision & Official Stamp Box */}
        <div style={{ border: '2px solid #0f172a', borderRadius: '8px', padding: '18px', background: '#fafaf9' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '12px', textAlign: 'center' }}>
            {isAr ? 'تأشيرة وقرار لجنة الحماية المدنية المختصة' : 'Competent Authority Decision & Endorsement'}
          </div>
          <div style={{ minHeight: '120px', borderBottom: '1px dashed #cbd5e1', marginBottom: '14px', color: '#94a3b8', fontSize: '0.82rem' }}>
            {isAr ? 'ملاحظات اللجنة والشروط الخاصة الواجب استيفاؤها قبل منح رخصة التشغيل النهائية:' : 'Committee observations and conditional requirements:'}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
            <div>{isAr ? 'مهندس السلامة المعتمد: ..........................' : 'Consulting Engineer: ..........................'}</div>
            <div>{isAr ? 'رئيس لجنة المعاينة: ..........................' : 'Civil Protection Officer: ..........................'}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', border: '1px solid #cbd5e1', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.72rem' }}>
                {isAr ? 'خاتم الحماية المدنية' : 'Official Stamp'}
              </div>
            </div>
          </div>
        </div>

        {/* System & Designer Attribution Strip */}
        <div style={{
          marginTop: '20px',
          paddingTop: '12px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div>
            <span>🔥 {isAr ? 'منظومة مساعد كود الحريق المصري (كود ٣٠٥ والقرار ٢٥٥ / ٢٠٢٦)' : 'Egyptian Fire Code Assistant Suite'}</span>
            <span style={{ margin: '0 6px' }}>•</span>
            <strong style={{ color: '#0f172a' }}>{isAr ? 'تصميم وبرمجة: المهندس / أحمد فوزي' : 'Designed & Engineered by Eng. Ahmed Fawzy'}</strong>
          </div>
          <div>
            <span>{isAr ? 'جميع الحقوق محفوظة © ٢٠٢٦' : 'All Rights Reserved © 2026'}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
