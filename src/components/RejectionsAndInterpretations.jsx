import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  HelpCircle, 
  Sparkles, 
  Scale, 
  Layers, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  FileCheck2,
  Flame,
  Building,
  Info
} from 'lucide-react';
import { 
  REJECTION_CATEGORIES, 
  COMMON_REJECTIONS, 
  CODE_INTERPRETATIONS, 
  FREQUENTLY_ASKED_QUESTIONS 
} from '../data/rejectionKnowledgeBase';

export default function RejectionsAndInterpretations({ 
  lang = 'ar', 
  selectedProject, 
  onOpenAssistant,
  onSwitchTab
}) {
  const isAr = lang === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  // Active view: 'rejections' | 'interpretations' | 'faqs'
  const [activeSubTab, setActiveSubTab] = useState('rejections');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInterp, setExpandedInterp] = useState(CODE_INTERPRETATIONS[0]?.id || null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Filter rejections with safe optional chaining
  const filteredRejections = COMMON_REJECTIONS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.titleAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorityNoteAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codeClauseAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(t => t?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter interpretations with safe optional chaining
  const filteredInterpretations = CODE_INTERPRETATIONS.filter(item => {
    return !searchQuery.trim() ||
      item.topicAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questionAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.officialRulingAr?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter FAQs with safe optional chaining
  const filteredFaqs = FREQUENTLY_ASKED_QUESTIONS.filter(item => {
    return !searchQuery.trim() ||
      item.qAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAskAIAboutItem = (item) => {
    if (onOpenAssistant) {
      const q = isAr
        ? `بصفتك خبيراً في الكود المصري للحريق، اشرح لي كيفية تفادي الخطأ التالي أثناء مراجعة الحماية المدنية: "${item.titleAr}"، وما هي البنود والحسابات الدقيقة المطلوبة؟`
        : `As an Egyptian Fire Code expert, please advise how to resolve this Civil Protection rejection: "${item.titleEn}".`;
      onOpenAssistant(q);
    }
  };

  const handleAskAIAboutInterp = (interp) => {
    if (onOpenAssistant) {
      const q = isAr
        ? `أريد تفصيلاً هندسياً معتمداً وتوضيحاً للمسألة التالية في الكود المصري ٣٠٥: "${interp.questionAr}"`
        : `Please provide a detailed engineering ruling under Egyptian Fire Code 305 regarding: "${interp.questionEn}".`;
      onOpenAssistant(q);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #172554 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        padding: '28px 24px',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: isAr ? '20px' : 'auto',
          right: isAr ? 'auto' : '20px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <ShieldAlert size={14} color="#ef4444" />
            <span>{isAr ? 'دليل الاعتماد وتفادي الرفض في الحماية المدنية المصرية' : 'Egyptian Civil Protection Approval Guide'}</span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '8px', lineHeight: 1.3 }}>
            {isAr 
              ? 'مكتبة أخطاء الرفض الشائعة وتفسيرات الكود الرسمية' 
              : 'Common Civil Protection Rejections & Code Interpretations'}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
            {isAr
              ? 'دليل استشاري عملي يوثق أكثر الملاحظات والأخطاء الهندسية التي تؤدي إلى رفض مخططات الحريق أثناء المراجعة الميدانية والاعتماد بإدارات الحماية المدنية، مدعوماً بالتفسيرات الرسمية المعتمدة لفض النزاعات وتوحيد المفاهيم الهندسية.'
              : 'Practical reference documenting critical rejection reasons during Egyptian Civil Protection drawing reviews, paired with authoritative technical interpretations and real-world solutions.'}
          </p>

          {/* Sub-Tabs Switcher Bar */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setActiveSubTab('rejections')}
              style={{
                background: activeSubTab === 'rejections' ? '#dc2626' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: activeSubTab === 'rejections' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSubTab === 'rejections' ? '0 4px 12px rgba(220, 38, 38, 0.4)' : 'none'
              }}
            >
              <AlertTriangle size={16} />
              <span>{isAr ? '🚨 أسباب الرفض الشائعة وكيفية تفاديها' : '🚨 Common Rejections & Solutions'}</span>
              <span style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem'
              }}>
                {COMMON_REJECTIONS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('interpretations')}
              style={{
                background: activeSubTab === 'interpretations' ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: activeSubTab === 'interpretations' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSubTab === 'interpretations' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              <Scale size={16} />
              <span>{isAr ? '⚖️ تفسيرات الكود وفض النزاعات الهندسية' : '⚖️ Code Interpretations & Rulings'}</span>
              <span style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem'
              }}>
                {CODE_INTERPRETATIONS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('faqs')}
              style={{
                background: activeSubTab === 'faqs' ? '#059669' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: activeSubTab === 'faqs' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeSubTab === 'faqs' ? '0 4px 12px rgba(5, 150, 105, 0.4)' : 'none'
              }}
            >
              <HelpCircle size={16} />
              <span>{isAr ? '❓ الأسئلة الشائعة وحسابات الموقع (FAQs)' : '❓ Practical FAQs'}</span>
              <span style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.72rem'
              }}>
                {FREQUENTLY_ASKED_QUESTIONS.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Search & Filter Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            flex: 1,
            minWidth: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={18} 
              color="#94a3b8" 
              style={{
                position: 'absolute',
                right: isAr ? '14px' : 'auto',
                left: isAr ? 'auto' : '14px',
                pointerEvents: 'none'
              }} 
            />
            <input 
              type="text"
              placeholder={isAr 
                ? 'ابحث برقم البند الكودي، أو سبب الرفض (مثل: أبواب، سلالم، مضخات، مسافة ارتحال، بدروم)...' 
                : 'Search rejection reason, code clause, doors, pumps, stairs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: isAr ? '10px 42px 10px 14px' : '10px 14px 10px 42px',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  left: isAr ? '12px' : 'auto',
                  right: isAr ? 'auto' : '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {activeSubTab === 'rejections' && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {REJECTION_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === cat.id ? 700 : 500,
                    border: selectedCategory === cat.id ? '1px solid #dc2626' : '1px solid #e2e8f0',
                    background: selectedCategory === cat.id ? '#fee2e2' : '#f8fafc',
                    color: selectedCategory === cat.id ? '#b91c1c' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isAr ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. REJECTIONS LIBRARY VIEW */}
      {/* ==================================================================== */}
      {activeSubTab === 'rejections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? `تم العثور على (${filteredRejections.length}) ملاحظة شائعة` : `Found (${filteredRejections.length}) common rejection items`}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#dc2626', background: '#fef2f2', padding: '3px 10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              {isAr ? '⚠️ معتمدة ومطابقة لبروتوكولات فحص الحماية المدنية' : '⚠️ Grounded in Civil Protection Protocols'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {filteredRejections.map(item => (
              <div 
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #fed7aa',
                  borderRight: isAr ? '5px solid #dc2626' : '1.5px solid #fed7aa',
                  borderLeft: isAr ? '1.5px solid #fed7aa' : '5px solid #dc2626',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header line: Title & Severity */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: item.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                      color: item.severity === 'critical' ? '#dc2626' : '#d97706',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.4 }}>
                        {isAr ? item.titleAr : item.titleEn}
                      </h3>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {item.tags.map((t, idx) => (
                          <span key={idx} style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontSize: '0.7rem',
                            padding: '1px 8px',
                            borderRadius: '6px'
                          }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: item.severity === 'critical' ? '#dc2626' : '#d97706',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.5px'
                  }}>
                    {item.severity === 'critical' 
                      ? (isAr ? 'رفض مباشر قاطع (Critical)' : 'Fatal Rejection') 
                      : (isAr ? 'ملاحظة جوهرية إلزامية' : 'High Priority Note')}
                  </span>
                </div>

                {/* Inspector Note Card (نص ملاحظة الحماية المدنية) */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.84rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <FileCheck2 size={15} />
                    <span>{isAr ? 'نص الملاحظة في تقرير الحماية المدنية:' : 'Official Civil Protection Review Comment:'}</span>
                  </div>
                  <div style={{ color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{isAr ? item.authorityNoteAr : item.authorityNoteEn}"
                  </div>
                </div>

                {/* Code Reference Clause */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.8rem',
                  color: '#1e3a8a',
                  lineHeight: 1.5
                }}>
                  <strong>{isAr ? '📌 السند الكودي الإلزامي:' : 'Mandatory Code Clause:'} </strong>
                  {isAr ? item.codeClauseAr : item.codeClauseEn}
                </div>

                {/* Visual Comparison Box: Wrong vs Right */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px',
                  marginTop: '4px'
                }}>
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '0.8rem',
                    color: '#991b1b'
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle size={15} color="#dc2626" />
                      <span>{isAr ? 'الخطأ الشائع المرفوض:' : 'Incorrect Common Practice:'}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{item.wrongPracticeAr}</p>
                  </div>

                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '0.8rem',
                    color: '#166534'
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>{isAr ? 'الحل الهندسي المعتمد كودياً:' : 'Approved Code-Compliant Remedy:'}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{item.correctPracticeAr}</p>
                  </div>
                </div>

                {/* Detailed Solution & Actions */}
                <div style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '0.82rem', color: '#475569', flex: 1, minWidth: '240px' }}>
                    <strong style={{ color: '#0f172a' }}>{isAr ? '💡 الإجراء الهندسي:' : 'Action:'} </strong>
                    {item.approvedSolutionAr}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAskAIAboutItem(item)}
                      style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        color: '#f8fafc',
                        border: '1px solid #334155',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      title={isAr ? 'اسأل المساعد الذكي حول هذه الحالة' : 'Consult AI on this rejection'}
                    >
                      <Sparkles size={13} color="#f59e0b" />
                      <span>{isAr ? 'استشارة المساعد الذكي' : 'Ask AI Specialist'}</span>
                    </button>

                    {onSwitchTab && (
                      <button
                        onClick={() => onSwitchTab('assessment', { fromRejection: item.id, itemTitle: item.titleAr, category: item.category })}
                        style={{
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{isAr ? 'فحص في مشروعي' : 'Check In Project'}</span>
                        <Arrow size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. CODE INTERPRETATIONS VIEW */}
      {/* ==================================================================== */}
      {activeSubTab === 'interpretations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '14px 18px',
            color: '#166534',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Scale size={20} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isAr ? 'تفسيرات هندسية معتمدة لفض النزاعات وتوحيد مفاهيم الكود المصري:' : 'Authoritative Code Interpretations:'}</strong>
              <div style={{ color: '#15803d', fontSize: '0.8rem', marginTop: '2px' }}>
                {isAr 
                  ? 'هذه التفسيرات مستندة إلى نصوص قرارات اللجان الفنية الدائمة لكود 305 بوزارة الإسكان وإدارات الحماية المدنية.'
                  : 'Grounded in Permanent Technical Committee rulings and Egyptian Fire Code 305 definitions.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredInterpretations.map((interp, index) => {
              const isExpanded = expandedInterp === interp.id;
              return (
                <div 
                  key={interp.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Topic Title Bar */}
                  <div 
                    onClick={() => setExpandedInterp(isExpanded ? null : interp.id)}
                    style={{
                      padding: '18px 20px',
                      background: isExpanded ? '#f8fafc' : '#ffffff',
                      borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#4338ca',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {isAr ? interp.topicAr : interp.topicEn}
                        </h4>
                        <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                          {isAr ? interp.questionAr : interp.questionEn}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Official Ruling Card */}
                      <div style={{
                        background: '#eff6ff',
                        border: '1.5px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Scale size={15} />
                          <span>{isAr ? 'التفسير والقرار الهندسي المعتمد:' : 'Official Engineering Ruling:'}</span>
                        </div>
                        <p style={{ margin: 0, color: '#1e3a8a', lineHeight: 1.6 }}>
                          {isAr ? interp.officialRulingAr : (interp.officialRulingEn || interp.officialRulingAr)}
                        </p>
                      </div>

                      {/* Engineering Impact */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        fontSize: '0.84rem'
                      }}>
                        <div style={{ fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                          {isAr ? '🔍 الأثر الهندسي على المخططات والتراخيص:' : 'Engineering Impact:'}
                        </div>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                          {interp.engineeringImpactAr}
                        </p>
                      </div>

                      {/* Golden Rule Banner */}
                      <div style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                        border: '1px solid #fde68a',
                        borderRadius: '10px',
                        padding: '10px 16px',
                        fontSize: '0.82rem',
                        color: '#92400e',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <span>{interp.keyRuleAr}</span>
                        <button
                          onClick={() => handleAskAIAboutInterp(interp)}
                          style={{
                            background: '#0f172a',
                            color: '#fef08a',
                            border: 'none',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={12} color="#f59e0b" />
                          <span>{isAr ? 'اسأل الذكاء الهندسي' : 'Ask AI'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. PRACTICAL FAQS VIEW */}
      {/* ==================================================================== */}
      {activeSubTab === 'faqs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} color="#059669" />
              <span>{isAr ? 'أهم الأسئلة الكودية الشائعة والأرقام المعيارية' : 'Standard Fire Code Numbers & FAQs'}</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              {isAr 
                ? 'إجابات سريعة ومباشرة على استفسارات الموقع والنسب الحسابية المعتمدة وفق كود الحريق المصري ٣٠٥.'
                : 'Direct, rapid answers on standard sizing parameters and occupant load factors.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div 
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    style={{
                      padding: '16px 18px',
                      background: isExpanded ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {faq.tag}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {faq.qAr}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </div>

                  {isExpanded && (
                    <div style={{
                      padding: '16px 18px',
                      background: '#ffffff',
                      borderTop: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      color: '#334155',
                      lineHeight: 1.6
                    }}>
                      {faq.aAr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
