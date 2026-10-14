import React, { useState } from 'react';
import { 
  Flame, 
  Wind, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Layers,
  BookOpen
} from 'lucide-react';

export default function SplashScreen({ 
  isOpen, 
  onClose, 
  lang = 'ar' 
}) {
  const [activeSide, setActiveSide] = useState('heat'); // 'heat' | 'fuel' | 'oxygen' | 'reaction'
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const handleEnterPlatform = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('hideFireCodeSplash', 'true');
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
    }
    onClose();
  };

  const triangleDetails = {
    heat: {
      titleAr: 'الحرارة (Heat / Thermal Energy)',
      titleEn: 'Heat (Thermal Energy)',
      color: '#ef4444',
      bgGrad: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.05))',
      icon: Flame,
      summaryAr: 'الطاقة الحرارية اللازمة لرفع درجة حرارة المادة القابلة للاشتعال إلى نقطة الوميض والاشتعال الذاتي.',
      codePrincipleAr: 'مبدأ الإطفاء بالكود المصري 305: (التبريد - Cooling) عبر شبكات رشاشات المياه التلقائية وصناديق الحريق لخفض درجة الحرارة دون نقطة الاشتعال.'
    },
    fuel: {
      titleAr: 'الوقود (Fuel / Combustible Material)',
      titleEn: 'Fuel (Combustible Material)',
      color: '#f59e0b',
      bgGrad: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.05))',
      icon: Zap,
      summaryAr: 'المادة القابلة للاشتعال سواء كانت في حالة صلبة (أخشاب/أقمشة)، أو سائلة (محروقات)، أو غازية (غاز طبيعي/LPG).',
      codePrincipleAr: 'مبدأ الإطفاء بالكود المصري 305: (التجويع - Starvation) بعزل المواد القابلة للاحتراق وقطع مصادر الغازات أو إخلاء المواد سريعة الاشتعال.'
    },
    oxygen: {
      titleAr: 'الأكسجين (Oxygen / Oxidizing Agent)',
      titleEn: 'Oxygen (Oxidizing Agent)',
      color: '#06b6d4',
      bgGrad: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.05))',
      icon: Wind,
      summaryAr: 'العامل المؤكسد الضروري لاستمرار الاحتراق (يتطلب الحريق تركيز أكسجين في الهواء الجوي يتجاوز 16%).',
      codePrincipleAr: 'مبدأ الإطفاء بالكود المصري 305: (الخنق - Smothering) عبر أنظمة ثاني أكسيد الكربون CO2 ورغوة الإطفاء والغازات النظيفة لحجب الأكسجين.'
    },
    reaction: {
      titleAr: 'التفاعل الكيميائي المتسلسل (Chain Reaction)',
      titleEn: 'Uninhibited Chemical Chain Reaction',
      color: '#ec4899',
      bgGrad: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.05))',
      icon: Sparkles,
      summaryAr: 'التفاعل التفاعلي بين الجذور الحرة للوقود والأكسجين، وهو الركن الرابع في هرم الحريق (Fire Tetrahedron).',
      codePrincipleAr: 'مبدأ الإطفاء بالكود المصري 305: (تثبيط التفاعل - Chemical Inhibition) باستخدام البودرة الكيماوية الجافة وأنظمة الإطفاء بالغازات النظيفة (FM-200 / Novec).'
    }
  };

  const currentDetail = triangleDetails[activeSide];

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
      backgroundColor: 'rgba(5, 11, 24, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '20px',
      overflowY: 'auto',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Background ambient lighting blobs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        width: '380px',
        height: '380px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      {/* Main Container Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '940px',
        background: 'linear-gradient(165deg, #0f172a 0%, #090d16 100%)',
        border: '1px solid rgba(249, 115, 22, 0.3)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.2)',
        color: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 10px #ef4444'
            }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fed7aa', letterSpacing: '0.5px' }}>
              {isAr ? 'الافتتاحية الرسمية لمنظومة الكود المصري' : 'Official Launch & Engineering Credentials'}
            </span>
            <span style={{
              fontSize: '0.72rem',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {isAr ? 'القرار ٢٥٥ / ٢٠٢٦' : 'Decree 255/2026'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isAr ? 'إغلاق الافتتاحية' : 'Close Splash'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.15fr)',
          gap: '24px',
          padding: '28px',
          alignItems: 'center'
        }}>
          {/* Left Column: Fire Triangle Visual Graphic */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '20px',
            position: 'relative'
          }}>
            {/* Fire Triangle SVG */}
            <div style={{ position: 'relative', width: '280px', height: '260px' }}>
              <svg 
                viewBox="0 0 300 280" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  filter: 'drop-shadow(0 0 16px rgba(239, 68, 68, 0.3))' 
                }}
              >
                {/* Glow Filter Definitions */}
                <defs>
                  <linearGradient id="heatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="oxygenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="fuelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff4444" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Inner background triangle */}
                <polygon 
                  points="150,30 270,240 30,240" 
                  fill="rgba(15, 23, 42, 0.75)" 
                  stroke="rgba(255, 255, 255, 0.08)" 
                  strokeWidth="2" 
                />

                {/* Center Core Pulsing Circle */}
                <circle cx="150" cy="165" r="46" fill="url(#centerGlow)" />
                <circle 
                  cx="150" 
                  cy="165" 
                  r="24" 
                  fill="#7f1d1d" 
                  stroke="#ef4444" 
                  strokeWidth="2.5" 
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setActiveSide('reaction')}
                />
                <text 
                  x="150" 
                  y="169" 
                  fill="#ffffff" 
                  fontSize="11" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  🔥
                </text>

                {/* Right Side: Heat Edge (Top to Bottom-Right) */}
                <line 
                  x1="150" y1="30" x2="270" y2="240" 
                  stroke="url(#heatGrad)" 
                  strokeWidth={activeSide === 'heat' ? '8' : '5'}
                  strokeLinecap="round"
                  style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                  onClick={() => setActiveSide('heat')}
                />

                {/* Bottom Side: Fuel Edge (Bottom-Right to Bottom-Left) */}
                <line 
                  x1="270" y1="240" x2="30" y2="240" 
                  stroke="url(#fuelGrad)" 
                  strokeWidth={activeSide === 'fuel' ? '8' : '5'}
                  strokeLinecap="round"
                  style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                  onClick={() => setActiveSide('fuel')}
                />

                {/* Left Side: Oxygen Edge (Bottom-Left to Top) */}
                <line 
                  x1="30" y1="240" x2="150" y2="30" 
                  stroke="url(#oxygenGrad)" 
                  strokeWidth={activeSide === 'oxygen' ? '8' : '5'}
                  strokeLinecap="round"
                  style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                  onClick={() => setActiveSide('oxygen')}
                />

                {/* Vertex 1: Top (Heat / الحرارة) */}
                <g 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveSide('heat')}
                >
                  <circle cx="150" cy="30" r="18" fill="#1e293b" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="150" cy="30" r="8" fill="#ef4444" />
                </g>

                {/* Vertex 2: Bottom-Right (Fuel / الوقود) */}
                <g 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveSide('fuel')}
                >
                  <circle cx="270" cy="240" r="18" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
                  <circle cx="270" cy="240" r="8" fill="#f59e0b" />
                </g>

                {/* Vertex 3: Bottom-Left (Oxygen / الأكسجين) */}
                <g 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveSide('oxygen')}
                >
                  <circle cx="30" cy="240" r="18" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" />
                  <circle cx="30" cy="240" r="8" fill="#06b6d4" />
                </g>
              </svg>

              {/* Labels on vertices */}
              <div 
                onClick={() => setActiveSide('heat')}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: activeSide === 'heat' ? '#dc2626' : 'rgba(15, 23, 42, 0.9)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid #ef4444',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isAr ? 'الحرارة (HEAT)' : 'HEAT'}
              </div>

              <div 
                onClick={() => setActiveSide('fuel')}
                style={{
                  position: 'absolute',
                  bottom: '-12px',
                  right: '-10px',
                  background: activeSide === 'fuel' ? '#d97706' : 'rgba(15, 23, 42, 0.9)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid #f59e0b',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isAr ? 'الوقود (FUEL)' : 'FUEL'}
              </div>

              <div 
                onClick={() => setActiveSide('oxygen')}
                style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '-10px',
                  background: activeSide === 'oxygen' ? '#0891b2' : 'rgba(15, 23, 42, 0.9)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: '1px solid #06b6d4',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {isAr ? 'الأكسجين (O₂)' : 'OXYGEN'}
              </div>
            </div>

            {/* Quick interactive note */}
            <div style={{
              marginTop: '18px',
              fontSize: '0.74rem',
              color: '#94a3b8',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Info size={13} color="#f97316" />
              <span>{isAr ? 'انقر على أي ضلع أو مركز المثلث لاستعراض مبدأ الإطفاء بالكود' : 'Click any side to explore code extinguishment principles'}</span>
            </div>

            {/* Selected Element Box */}
            <div style={{
              marginTop: '12px',
              width: '100%',
              background: currentDetail.bgGrad,
              border: `1px solid ${currentDetail.color}40`,
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.78rem',
              textAlign: isAr ? 'right' : 'left'
            }}>
              <div style={{ fontWeight: 800, color: currentDetail.color, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <currentDetail.icon size={14} />
                <span>{isAr ? currentDetail.titleAr : currentDetail.titleEn}</span>
              </div>
              <p style={{ color: '#cbd5e1', lineHeight: 1.5, margin: 0, fontSize: '0.75rem' }}>
                {isAr ? currentDetail.codePrincipleAr : currentDetail.summaryAr}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Attribution & Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Title Section */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '10px'
              }}>
                <ShieldCheck size={14} />
                <span>{isAr ? 'المنظومة الهندسية المعتمدة لحماية الأرواح والمنشآت' : 'Certified Life Safety & Fire Protection System'}</span>
              </div>

              <h2 style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.3,
                marginBottom: '6px',
                background: 'linear-gradient(to right, #ffffff, #fed7aa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {isAr ? 'مساعد الكود المصري لحريق والاشتراطات الهندسية' : 'Egyptian Fire Code & Life Safety Assistant'}
              </h2>

              <p style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                lineHeight: 1.5
              }}>
                {isAr 
                  ? 'المرجع الرقمي الشامل لتطبيق الكود المصري لحماية المنشآت من أخطار الحريق (كود ٣٠٥) بأجزائه الثلاثة وقرار وزير الإسكان والمرافق رقم ٢٥٥ لسنة ٢٠٢٦.'
                  : 'Comprehensive engineering reference adhering to Egyptian Fire Code 305 and Ministerial Decree 255/2026.'}
              </p>
            </div>

            {/* Engineer Attribution Card - Ahmed Fawzy */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1.5px solid #d97706',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(254, 215, 170, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Golden corner badge */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: isAr ? 0 : 'auto',
                right: isAr ? 'auto' : 0,
                background: 'linear-gradient(135deg, #f59e0b, #b45309)',
                color: '#0f172a',
                padding: '4px 14px',
                borderBottomRightRadius: isAr ? '12px' : 0,
                borderBottomLeftRadius: isAr ? 0 : '12px',
                fontSize: '0.7rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                letterSpacing: '0.5px'
              }}>
                <Award size={13} />
                <span>{isAr ? 'المطور والاستشاري المصمم' : 'Lead Designer & Engineer'}</span>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {isAr ? 'تم التصميم والبرمجة والتطوير الهندسي بواسطة:' : 'Designed, Engineered & Developed By:'}
                </div>
                
                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#fbbf24',
                  textShadow: '0 0 12px rgba(251, 191, 36, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  {isAr ? 'المهندس / أحمد فوزي' : 'Eng. Ahmed Fawzy'}
                </div>

                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
                  {isAr 
                    ? 'استشاري ومصمم أنظمة السلامة ومكافحة الحريق والأنظمة الهندسية'
                    : 'Fire Protection & Life Safety Systems Design Consultant'}
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '10px',
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#22c55e" />
                    <strong>{isAr ? 'جميع الحقوق محفوظة © ٢٠٢٦ المهندس أحمد فوزي' : 'All Rights Reserved © 2026 Eng. Ahmed Fawzy'}</strong>
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                    {isAr 
                      ? 'مطور بموجب حقوق الملكية الفكرية والهندسية للحلول البرمجية المتخصصة في كود الحريق المصري والتطبيقات الاستشارية.'
                      : 'Proprietary engineering software compliant with Egyptian Civil Protection & Fire Code Standards.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              fontSize: '0.72rem'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#ef4444', fontWeight: 800 }}>الكود ٣٠٥</div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>بأجزائه الثلاثة</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#f59e0b', fontWeight: 800 }}>القرار ٢٥٥</div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>إصدار سنة ٢٠٢٦</div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#06b6d4', fontWeight: 800 }}>مثلث الحريق</div>
                <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>المحرك الحسابي</div>
              </div>
            </div>

            {/* Footer Actions inside Splash */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '8px',
              flexWrap: 'wrap'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                color: '#94a3b8',
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  style={{ accentColor: '#ef4444', cursor: 'pointer' }}
                />
                <span>{isAr ? 'عدم إظهار هذه الافتتاحية تلقائياً عند بدء التشغيل' : "Don't show this screen automatically"}</span>
              </label>

              <button
                type="button"
                onClick={handleEnterPlatform}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{isAr ? 'الدخول إلى منظومة الكود المصري' : 'Enter Engineering Platform'}</span>
                <ChevronRight size={18} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
