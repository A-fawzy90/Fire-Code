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
    // Generate text/docx simulation file
    const content = `
جمهورية مصر العربية
وزارة الإسكان والمرافق والمجتمعات العمرانية
الإدارة العامة للحماية المدنية

مذكرة فنية للعرض والمناقشة
بشأن دراسة مطابقة اشتراطات الكود المصري لحماية المنشآت من أخطار الحريق
(القرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦)

اسم المشروع: ${project.titleAr}
الموقع: ${project.facts.location}
التصنيف الكودي: ${project.facts.subgroupNameAr}
الارتفاع الكلي: ${project.facts.buildingHeight} متراً
المساحة الإجمالية: ${project.facts.totalArea} م²

الحالة: مسودة للمناقشة الفنية - تتطلب اعتماد إدارة الحماية المدنية
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Technical_Memorandum_Civil_Protection_${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
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
            {isAr ? 'تحميل بصيغة DOCX' : 'Download DOCX'}
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
              {isAr ? 'جمهورية مصر العربية' : 'Arab Republic of Egypt'}
            </div>
            <div style={{ fontSize: '0.86rem', color: '#334155' }}>
              {isAr ? 'وزارة الإسكان والمرافق والمجتمعات العمرانية' : 'Ministry of Housing, Utilities & Urban Communities'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {isAr ? 'المركز القومي لبحوث الإسكان والبناء' : 'Housing & Building National Research Center (HBRC)'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 4px auto', background: '#dc2626', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={28} />
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626' }}>
              كود الحريق ٢٠٢٦
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
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  ١. اشتراطات المباني المرتفعة (High-Rise Requirements)
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  كود ٣٠٥/١ - الباب الخامس - ص ٥-٢
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                تجاوز ارتفاع المبنى (٢٢ متراً) يلزمه توفير شبكة رشاشات تلقائية شاملة لكافة الأدوار، ومصعد مخصص لرجال الإطفاء، وسلالم هروب مغلقة ومحمية بضغط هواء موجب.
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  ٢. عزل جراج البدروم وسحب الدخان الميكانيكي
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 700 }}>
                  كود ٣٠٥/١ - الباب الخامس - ص ٥-١٠
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                عزل أرضيات وحوائط البدروم بفواصل حريق لا تقل عن ساعتين، وتركيب نظام ميكانيكي مستقل لسحب الدخان بمعدل ١٠ مرات تغيير هواء/ساعة مع فصل سلالم هروب البدروم بمخرج مباشر للخارج.
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

      </div>

    </div>
  );
}
