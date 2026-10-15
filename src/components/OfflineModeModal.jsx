import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  HardDrive, 
  Smartphone, 
  Laptop, 
  Calculator, 
  BookOpen, 
  FileCheck2, 
  Sparkles,
  X,
  ExternalLink,
  Flame
} from 'lucide-react';

export default function OfflineModeModal({ 
  isOpen, 
  onClose, 
  lang = 'ar',
  isOnline = true,
  isFieldMode = false,
  onToggleFieldMode
}) {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const offlineFeatures = [
    {
      icon: BookOpen,
      color: '#2563eb',
      titleAr: 'تصفح الكود المصري ٣٠٥ والقرار ٢٥٥/٢٠٢٦',
      titleEn: 'Full Egyptian Fire Code 305 & Decree 255/2026',
      descAr: 'جميع نصوص الأجزاء الثلاثة (البنائية، الميكانيكية، الكهربائية) مخزنة محلياً بالكامل ومفهرسة للبحث برقم البند بدون نت.',
      descEn: 'All three parts (Architectural, Mechanical, Electrical) are bundled locally and indexed for clause lookups without an internet connection.'
    },
    {
      icon: Calculator,
      color: '#dc2626',
      titleAr: 'الحاسبات الهندسية التفاعلية اللحظية',
      titleEn: 'Interactive Real-Time Engineering Calculators',
      descAr: 'حساب سعات خزانات مياه الحريق، تدفق الـ GPM، قدرات طلمبات الديزل والكهرباء، عروض السلالم (٧٫٦ مم)، ومراوح الضغط وسحب الدخان.',
      descEn: 'Hydraulic calculations for water tanks, GPM demand, diesel/electric pumps, staircase widths (7.6 mm/person), and stair pressurization.'
    },
    {
      icon: FileCheck2,
      color: '#059669',
      titleAr: 'فحص وتقييم المشاريع والارتفاعات',
      titleEn: 'Project Assessment & Height Verification',
      descAr: 'تحديد اشتراطات الارتفاع، مسالك الهروب، وحسابات حمولة الإشغال ومسافات الارتحال تعمل بمحرك خوارزمي محلي سريع.',
      descEn: 'Evaluate building heights (16m / 22m / 24m thresholds), travel distances, and occupant loads via high-speed client-side algorithms.'
    },
    {
      icon: HardDrive,
      color: '#d97706',
      titleAr: 'التخزين المحلي على ذاكرة الجهاز (LocalStorage)',
      titleEn: 'Device Browser Storage (LocalStorage)',
      descAr: 'تُحفظ كافة بيانات مشاريعك ومسوداتك وتقاريرك محلياً في ذاكرة متصفحك. يوصى بالمزامنة السحابية أو تصدير ملف للحفظ الدائم.',
      descEn: 'Projects, calculations, and drafts persist in your local browser storage. Use cloud sync or file export for permanent disaster-proof archival.'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(5, 11, 24, 0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: 'clamp(8px, 2.5vw, 20px)',
      overflowY: 'auto'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '94dvh',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
        color: '#0f172a',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          background: isOnline ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'linear-gradient(135deg, #7c2d12 0%, #451a03 100%)',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.25)',
              color: isOnline ? '#4ade80' : '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {isAr ? 'وضع العمل الميداني بدون إنترنت (Offline Mode)' : 'Offline Field Mode (Basements & Job Sites)'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: isOnline ? '#86efac' : '#fed7aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#22c55e' : '#f97316' }} />
                <span>{isOnline ? (isAr ? 'متصل بالشبكة (الخدمات المحلية والسحابية نشطة)' : 'Online (Cloud & Local Ready)') : (isAr ? 'غير متصل (الوضع الميداني المحلي نشط)' : 'Offline (Field Mode Active)')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Highlight Notification */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={26} color="#16a34a" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.84rem', color: '#166534', lineHeight: 1.5 }}>
              <strong>{isAr ? 'ميزة هندسية مصممة لمواقع العمل تحت الإنشاء والبدرومات:' : 'Built specifically for construction sites & deep basements:'} </strong>
              {isAr
                ? 'تمت هندسة التطبيق ليعمل 100% بصورة مستقلة أوفلاين. لا تحتاج إطلاقاً إلى تغطية شبكة المحمول أو واي فاي لإجراء الحسابات الهيدروليكية أو استعراض نصوص الكود أو مراجعة اشتراطات الدفاع المدني.'
                : '100% self-contained client architecture. No mobile data or Wi-Fi required to run hydraulic formulas or query the Egyptian Fire Code.'}
            </div>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {offlineFeatures.map((feat, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${feat.color}15`,
                  color: feat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <feat.icon size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    {isAr ? feat.titleAr : feat.titleEn}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    {isAr ? feat.descAr : feat.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Optional Field Mode Quick Toggle */}
          {onToggleFieldMode && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                  {isAr ? '⚡ تفعيل الوضع الميداني السريع (Field Mode):' : '⚡ Enable Field Inspection Mode:'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {isAr 
                    ? 'يُقلل المؤثرات البصرية ويركز على الحاسبات السريعة واختبارات الموقع للبدرومات ومواقع الإنشاء.'
                    : 'Streamlines UI animations and focuses on essential job-site calculators and offline review.'}
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleFieldMode}
                style={{
                  background: isFieldMode ? '#16a34a' : '#64748b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                {isFieldMode ? (isAr ? 'مفعل ✔️' : 'Active ✔️') : (isAr ? 'تعطيل' : 'Off')}
              </button>
            </div>
          )}

          {/* Standalone File Direct Access */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                📄
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fed7aa' }}>
                  {isAr ? 'ملف التشغيل المستقل بالكامل (Single-File Offline Bundle)' : 'Standalone Offline HTML File'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {isAr 
                    ? 'Egyptian_Fire_Code_Complete_SingleFile.html (حوالي 1.45 ميجابايت مدمج بالكامل ويفتح مباشرة في أي متصفح)' 
                    : 'Self-contained 1.45MB HTML bundle that opens directly in any browser.'}
                </div>
              </div>
            </div>

            <a
              href="/Egyptian_Fire_Code_Complete_SingleFile.html"
              download="Egyptian_Fire_Code_Complete_SingleFile.html"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Download size={15} />
              <span>{isAr ? 'تحميل الملف المستقل 📥' : 'Download HTML File'}</span>
            </a>
          </div>

          {/* Installation Tips (PWA) */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '0.82rem',
            color: '#92400e'
          }}>
            <div style={{ fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={16} />
              <span>{isAr ? '📱 تثبيت البرنامج كتطبيق موبايل / لابتوب مستقل (PWA):' : 'Install as Offline Native App (PWA):'}</span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {isAr
                ? 'على الهاتف (Chrome أو Safari) اضغط على خيارات المتصفح (⋮ أو زر المشاركة) ثم اختر "إضافة إلى الشاشة الرئيسية (Add to Home Screen)". على اللابتوب (Chrome أو Edge) اضغط على أيقونة التثبيت ⊕ في شريط العنوان ليصبح برنامجاً يعمل بضغطة زر واحدة بدون إنترنت.'
                : 'In Chrome/Safari, tap Share/Options and select "Add to Home Screen". On desktop Chrome/Edge, click the install icon in the address bar.'}
            </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {isAr ? 'المهندس / أحمد فوزي — أنظمة مكافحة وإنذار الحريق' : 'Eng. Ahmed Fawzy — Fire Protection Systems'}
          </span>

          <button
            onClick={onClose}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'فهمت، متابعة العمل' : 'Got it, Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
