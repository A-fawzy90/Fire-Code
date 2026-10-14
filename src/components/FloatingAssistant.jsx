import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  AlertTriangle, 
  Check, 
  Copy, 
  Flame, 
  Building2, 
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Cpu,
  Globe
} from 'lucide-react';
import { askCodeAssistant } from '../services/aiProvider';
import { OFFICIAL_METADATA } from '../data/codeKnowledgeBase';

export default function FloatingAssistant({ lang, selectedProject, isOpen, setIsOpen, initialQuery }) {
  const isAr = lang === 'ar';
  
  // Search Mode: 'general' (Default, broad Egyptian Code search) | 'project' (Optionally bind to active project)
  const [searchMode, setSearchMode] = useState('general');

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      data: {
        exactSourceText: isAr 
          ? "مرحباً بك في المساعد الذكي المعتمد لكود الحريق المصري (إصدار ٢٠٢٦). جميع الإجابات مستندة حصراً إلى الأجزاء الثلاثة للكود المصري لحماية المنشآت من أخطار الحريق وقرار وزير الإسكان رقم ٢٥٥ لسنة ٢٠٢٦، مع التحقق المنطقي المزدوج لمنع أي معلومات غير دقيقة."
          : "Welcome to the Egyptian Fire Code Assistant (2026 Edition). All responses are strictly grounded in Ministerial Decree No. 255/2026 and official HBRC code documents.",
        citation: {
          docTitle: isAr ? "الكود المصري لحماية المنشآت من أخطار الحريق" : "Egyptian Fire Protection Code",
          docCode: "٣٠٥/١-٢-٣",
          edition: "2026",
          chapter: isAr ? "القرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦" : "Ministerial Decree 255/2026",
          article: isAr ? "مادة ١" : "Article 1",
          page: "1"
        },
        plainExplanation: isAr
          ? "يمكنك سؤالي بشكل عام عن: اشتراطات غرف المحول، غرف المولدات، هود المطابخ التجارية، خوانق الحريق (Dampers)، مسافات الارتحال، سعة مخارج الطوارئ، متطلبات رشاشات الحريق، أو اشتراطات البدروم لكافة أنواع المباني."
          : "You can ask about transformer rooms, generators, kitchen hoods, fire dampers, exit travel distances, egress capacities, or sprinkler mandates across all building occupancies.",
        isProjectSpecific: false,
        aiAssessment: isAr 
          ? "وضع الاستعلام: بحث عام شامل في نصوص الكود المصري (شامل لكافة الإشغالات والأنظمة) دون التقيد بمشروع بعينه. يمكنك التبديل لتطبيق الشروط على مشروع محدد متى أردت."
          : "Mode: General Code Search across all building types and engineering disciplines.",
        userFactsUsed: isAr ? "بحث عام في الكود المصري العام" : "General Code Query",
        humanReviewNoticeAr: "تنبيه مهني: هذا المساعد يقدم دعماً هندسياً استرشادياً موثقاً ولا يُعتبر ترخيصاً أو موافقة رسمية من الحماية المدنية.",
        humanReviewNoticeEn: "Notice: Guidance only; does not substitute official Civil Protection review."
      }
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const thinkingStepsList = isAr ? [
    "المرحلة الأولى: تفكيك الاستعلام الهندسي واستخراج الكلمات المفتاحية...",
    "المرحلة الثانية: فحص مجلدات الكود المصري ٢٠٢٦ (٣٠٥/١ إنشائي، ٣٠٥/٢ ميكانيكي، ٣٠٥/٣ كهربائي)...",
    "المرحلة الثالثة: تدقيق رقم الباب والبند ومطابقة اشتراطات الحماية المدنية المعتمدة...",
    "المرحلة الرابعة: مواءمة الاشتراطات المعمارية والميكانيكية وصياغة التقرير الهندسي الشامل..."
  ] : [
    "Phase 1: Parsing engineering query and extracting domain keywords...",
    "Phase 2: Scanning 2026 Code Volumes (305/1 Architectural, 305/2 Mechanical, 305/3 Electrical)...",
    "Phase 3: Verifying chapter, article, and Civil Protection mandates...",
    "Phase 4: Harmonizing multidisciplinary provisions into final compliance report..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading, thinkingStep]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInputVal(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    let interval;
    if (loading) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev < thinkingStepsList.length - 1 ? prev + 1 : prev));
      }, 420);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputVal;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const responseData = await askCodeAssistant(
        query, 
        searchMode === 'project' ? selectedProject : null, 
        'local-rag', 
        { mode: searchMode }
      );
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        data: responseData
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        text: isAr ? 'حدث خطأ أثناء معالجة الاستعلام. يرجى المحاولة مرة أخرى.' : 'Error processing query. Please retry.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReasoning = (msgId) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        data: {
          exactSourceText: isAr 
            ? "تمت إعادة تهيئة المحادثة. تفضل بطرح أي سؤال يتعلق باشتراطات الكود المصري لحماية المنشآت من أخطار الحريق."
            : "Conversation cleared. Ask any question regarding the Egyptian Fire Code requirements.",
          citation: {
            docTitle: isAr ? "الكود المصري للحريق" : "Egyptian Fire Code",
            docCode: "٣٠٥",
            edition: "2026",
            chapter: isAr ? "عام" : "General",
            article: "-",
            page: "-"
          },
          plainExplanation: isAr ? "جاهز لاستقبال استفساراتك الهندسية بدقة وتأصيل كودي معتمد." : "Ready for your engineering queries.",
          aiAssessment: isAr ? "يتم الربط تلقائياً مع محرك الاسترجاع المعزز للكود المصري ٢٠٢٦." : "Connected to 2026 Egyptian Fire Code RAG engine.",
          userFactsUsed: selectedProject ? (isAr ? selectedProject.titleAr : selectedProject.titleEn) : "عام",
          humanReviewNoticeAr: "تنبيه مهني: مراجعة المخططات الهندسية من قبل استشاري معتمد متطلب قانوني إلزامي.",
          humanReviewNoticeEn: "Notice: Professional consulting review is legally mandatory."
        }
      }
    ]);
  };

  const suggestions = [
    { ar: "حساب سعة خزان المياه وقدرة الطلمبات", en: "Calculate water tank and pumps" },
    { ar: "حساب عروض السلالم ومسالك الهروب", en: "Calculate egress stair width" },
    { ar: "حساب مراوح ضغط السلالم وسحب الدخان", en: "Calculate stair pressurization fan CFM" },
    { ar: "اشتراطات غرف المحول", en: "Transformer room requirements" },
    { ar: "اشتراطات غرف المولدات وخزانات الوقود", en: "Generator rooms & fuel tanks" },
    { ar: "أنظمة هود المطابخ التجارية والكيماويات الرطبة", en: "Commercial kitchen hood fire systems" },
    { ar: "اشتراطات خوانق الحريق والدخان (Dampers)", en: "Fire & smoke dampers rules" },
    { ar: "متى يلزم تركيب شبكة رشاشات مائية تلقائية؟", en: "When are automatic fire sprinklers mandatory?" },
    { ar: "اشتراطات عزل جراج البدروم وسحب الدخان", en: "Basement parking separation & smoke exhaust" },
    { ar: "ما هي شروط مسافة الارتحال في المباني التجارية؟", en: "Commercial building travel distance rules" }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="floating-ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title={isAr ? "المساعد الذكي لكود الحريق المصري ٢٠٢٦" : "Egyptian Fire Code AI Assistant 2026"}
        aria-label="Toggle AI Assistant"
      >
        <Sparkles size={20} color="#fef08a" />
        <span>{isAr ? 'المساعد الهندسي الذكي' : 'Code AI Assistant'}</span>
        {selectedProject && (
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '0.72rem',
            fontWeight: '600'
          }}>
            {isAr ? 'مشروع نشط' : 'Project Linked'}
          </span>
        )}
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="ai-drawer" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Flame size={20} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', lineHeight: 1.2, margin: 0 }}>
                  {isAr ? 'المساعد الذكي لكود الحريق المصري' : 'Egyptian Fire Code Assistant'}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {isAr ? 'مستند إلى قرار ٢٥٥ لسنة ٢٠٢٦ • HBRC' : 'Decree 255/2026 Grounded • HBRC'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={handleReset}
                title={isAr ? "إعادة تعيين المحادثة" : "Clear conversation"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                title={isAr ? "إغلاق" : "Close"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search Scope Switcher (General Search vs Project Bound) */}
          <div style={{
            background: searchMode === 'general' ? '#f0fdf4' : '#eff6ff',
            borderBottom: searchMode === 'general' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* General Mode Button (Default) */}
                <button
                  type="button"
                  onClick={() => setSearchMode('general')}
                  style={{
                    background: searchMode === 'general' ? '#15803d' : '#ffffff',
                    color: searchMode === 'general' ? '#ffffff' : '#334155',
                    border: searchMode === 'general' ? '1px solid #166534' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: searchMode === 'general' ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={isAr ? "بحث عام شامل في الكود المصري لكافة المباني" : "General Code Search"}
                >
                  <Globe size={13} />
                  <span>{isAr ? '🌐 استعلام عام في الكود (مفعّل)' : '🌐 General Code Search'}</span>
                </button>

                {/* Project Mode Button (Optional) */}
                {selectedProject && (
                  <button
                    type="button"
                    onClick={() => setSearchMode('project')}
                    style={{
                      background: searchMode === 'project' ? '#1d4ed8' : '#ffffff',
                      color: searchMode === 'project' ? '#ffffff' : '#475569',
                      border: searchMode === 'project' ? '1px solid #1e40af' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: searchMode === 'project' ? '0 2px 6px rgba(29, 78, 216, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={isAr ? "تطبيق الشروط على بيانات المشروع الحالي" : "Link to current project"}
                  >
                    <Building2 size={13} />
                    <span>{isAr ? `🏢 ربط بالمشروع الحالي` : '🏢 Link to Project'}</span>
                  </button>
                )}
              </div>

              {/* Status Note */}
              <div style={{ fontSize: '0.72rem', color: searchMode === 'general' ? '#15803d' : '#1e40af', fontWeight: 600 }}>
                {searchMode === 'general' 
                  ? (isAr ? '✅ بحث مفتوح غير مقيد بمشروع' : '✅ Unrestricted broad search')
                  : (isAr ? `مشروع: ${selectedProject?.titleAr?.slice(0, 18)}...` : 'Project mode')}
              </div>
            </div>

            {/* Sub-bar explanation for users */}
            {searchMode === 'general' ? (
              <div style={{ fontSize: '0.73rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.7)', padding: '5px 8px', borderRadius: '6px' }}>
                <span>ℹ️</span>
                <span>{isAr ? 'يتم البحث في كامل أجزاء الكود المصري (٣٠٥/١ و ٣٠٥/٢ و ٣٠٥/٣) والقرار ٢٥٥ لكافة المنشآت والأنظمة دون حصر الإجابة بمشروع.' : 'Searching all code volumes broadly without scoping to a single project.'}</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.73rem', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', padding: '5px 8px', borderRadius: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>🏢</span>
                  <span>{isAr ? `المشروع المقترن: ${selectedProject?.titleAr} (ارتفاع: ${selectedProject?.facts?.buildingHeight || 24}م)` : `Linked: ${selectedProject?.titleEn}`}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchMode('general')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  {isAr ? 'إلغاء الربط والعودة للبحث العام 🌐' : 'Unlink and return to general 🌐'}
                </button>
              </div>
            )}
          </div>

          {/* Message List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#f8fafc'
          }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '94%'
                  }}
                >
                  {/* Sender & Timestamp */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '0.7rem',
                    color: '#64748b',
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    {isUser ? (
                      <>
                        <span>{msg.timestamp}</span>
                        <strong>{isAr ? 'أنت' : 'You'}</strong>
                        <User size={12} />
                      </>
                    ) : (
                      <>
                        <Bot size={12} color="#dc2626" />
                        <strong>{isAr ? 'مساعد كود الحريق المعتمد' : 'Code Assistant'}</strong>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  {isUser ? (
                    <div style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '10px 14px',
                      borderRadius: '14px 14px 2px 14px',
                      fontSize: '0.88rem',
                      lineHeight: 1.5
                    }}>
                      {msg.text}
                    </div>
                  ) : (
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px 14px 14px 2px',
                      padding: '14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Simple text or structured data */}
                      {msg.text ? (
                        <p style={{ fontSize: '0.86rem', color: '#1e293b' }}>{msg.text}</p>
                      ) : msg.data ? (
                        <>
                          {/* 1. Pill: Exact Code Quote */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span className="response-pill pill-quote">
                                {isAr ? '📜 نص الكود المعتمد (حرفي بدون تصرف)' : '📜 Approved Code Verbatim'}
                              </span>
                              {msg.data.hasDirectCodeMatch && (
                                <span style={{ fontSize: '0.7rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '700' }}>
                                  <CheckCircle2 size={12} />
                                  {isAr ? 'مطابق لقرار ٢٥٥ لسنة ٢٠٢٦' : 'Decree 255/2026 Grounded'}
                                </span>
                              )}
                            </div>
                            
                            {/* Citation banner */}
                            {msg.data.citation && (
                              <div style={{
                                background: '#fef2f2',
                                borderRight: isAr ? '3px solid #dc2626' : 'none',
                                borderLeft: !isAr ? '3px solid #dc2626' : 'none',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: '#991b1b',
                                fontWeight: '700',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <span>
                                  {msg.data.citation.docTitle} ({msg.data.citation.docCode}) - {msg.data.citation.chapter} | {msg.data.citation.article} | ص {msg.data.citation.page}
                                </span>
                                <button 
                                  onClick={() => copyToClipboard(
                                    `${msg.data.citation.docTitle} - ${msg.data.citation.article}\n${msg.data.exactSourceText}`, 
                                    msg.id
                                  )}
                                  title={isAr ? "نسخ نص الكود" : "Copy code text"}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#991b1b',
                                    padding: '2px 4px'
                                  }}
                                >
                                  {copiedId === msg.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                                </button>
                              </div>
                            )}

                            <p style={{
                              fontSize: '0.85rem',
                              color: '#0f172a',
                              lineHeight: 1.6,
                              background: '#f8fafc',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: '1px solid #f1f5f9',
                              fontFamily: 'inherit'
                            }}>
                              "{msg.data.exactSourceText}"
                            </p>
                          </div>

                          {/* Multidisciplinary Breakdown (when applicable e.g. Transformer rooms, generators) */}
                          {msg.data.technicalBreakdown && (
                            <div style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: '800', fontSize: '0.84rem' }}>
                                <Cpu size={16} color="#0284c7" />
                                <span>{isAr ? 'التفصيل الهندسي المتكامل للاشتراطات' : 'Integrated Multidisciplinary Breakdown'}</span>
                              </div>

                              {/* Architectural Section */}
                              {msg.data.technicalBreakdown.architectural && (
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', borderLeft: isAr ? 'none' : '3px solid #3b82f6', borderRight: isAr ? '3px solid #3b82f6' : 'none' }}>
                                  <h4 style={{ fontSize: '0.8rem', color: '#1d4ed8', margin: '0 0 6px 0', fontWeight: '700' }}>
                                    🏛️ {msg.data.technicalBreakdown.architectural.titleAr}
                                  </h4>
                                  <ul style={{ margin: 0, paddingRight: isAr ? '18px' : 0, paddingLeft: !isAr ? '18px' : 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                                    {msg.data.technicalBreakdown.architectural.points.map((pt, i) => (
                                      <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Mechanical Section */}
                              {msg.data.technicalBreakdown.mechanical && (
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', borderLeft: isAr ? 'none' : '3px solid #dc2626', borderRight: isAr ? '3px solid #dc2626' : 'none' }}>
                                  <h4 style={{ fontSize: '0.8rem', color: '#b91c1c', margin: '0 0 6px 0', fontWeight: '700' }}>
                                    💧 {msg.data.technicalBreakdown.mechanical.titleAr}
                                  </h4>
                                  <ul style={{ margin: 0, paddingRight: isAr ? '18px' : 0, paddingLeft: !isAr ? '18px' : 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                                    {msg.data.technicalBreakdown.mechanical.points.map((pt, i) => (
                                      <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Ventilation & Dampers Section */}
                              {msg.data.technicalBreakdown.ventilation && (
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', borderLeft: isAr ? 'none' : '3px solid #d97706', borderRight: isAr ? '3px solid #d97706' : 'none' }}>
                                  <h4 style={{ fontSize: '0.8rem', color: '#b45309', margin: '0 0 6px 0', fontWeight: '700' }}>
                                    🌀 {msg.data.technicalBreakdown.ventilation.titleAr}
                                  </h4>
                                  <ul style={{ margin: 0, paddingRight: isAr ? '18px' : 0, paddingLeft: !isAr ? '18px' : 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                                    {msg.data.technicalBreakdown.ventilation.points.map((pt, i) => (
                                      <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Electrical & Alarm Section */}
                              {msg.data.technicalBreakdown.electricalAlarm && (
                                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', borderLeft: isAr ? 'none' : '3px solid #7c3aed', borderRight: isAr ? '3px solid #7c3aed' : 'none' }}>
                                  <h4 style={{ fontSize: '0.8rem', color: '#6d28d9', margin: '0 0 6px 0', fontWeight: '700' }}>
                                    ⚡ {msg.data.technicalBreakdown.electricalAlarm.titleAr}
                                  </h4>
                                  <ul style={{ margin: 0, paddingRight: isAr ? '18px' : 0, paddingLeft: !isAr ? '18px' : 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                                    {msg.data.technicalBreakdown.electricalAlarm.points.map((pt, i) => (
                                      <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Pill: Plain Explanation */}
                          {msg.data.plainExplanation && (
                            <div>
                              <span className="response-pill pill-explain">
                                {isAr ? '💡 الشرح الهندسي المبسط' : '💡 Plain Engineering Explanation'}
                              </span>
                              <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, margin: '6px 0 0 0' }}>
                                {msg.data.plainExplanation}
                              </p>
                            </div>
                          )}

                          {/* 3. Pill: Scope & Applicability (General vs Project) */}
                          {msg.data.aiAssessment && (
                            <div>
                              <span 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  fontSize: '0.73rem',
                                  fontWeight: 800,
                                  background: msg.data.isProjectSpecific ? '#fef3c7' : '#e0f2fe',
                                  color: msg.data.isProjectSpecific ? '#92400e' : '#0369a1',
                                  border: msg.data.isProjectSpecific ? '1px solid #fde68a' : '1px solid #bae6fd'
                                }}
                              >
                                {msg.data.isProjectSpecific 
                                  ? (isAr ? `🏢 التقييم الاسترشادي لمشروع: ${msg.data.projectName || ''}` : `🏢 Project Assessment: ${msg.data.projectName || ''}`)
                                  : (isAr ? '🌐 النطاق والتطبيق العام بالكود المصري' : '🌐 General Egyptian Code Scope')}
                              </span>
                              <p style={{ 
                                fontSize: '0.84rem', 
                                color: msg.data.isProjectSpecific ? '#92400e' : '#0c4a6e', 
                                lineHeight: 1.55, 
                                background: msg.data.isProjectSpecific ? '#fffbeb' : '#f0f9ff', 
                                border: msg.data.isProjectSpecific ? '1px solid #fde68a' : '1px solid #e0f2fe',
                                padding: '9px 12px', 
                                borderRadius: '8px', 
                                margin: '6px 0 0 0' 
                              }}>
                                {msg.data.aiAssessment}
                              </p>
                            </div>
                          )}

                          {/* Transparent Reasoning Chain Toggle */}
                          {msg.data.reasoningChain && msg.data.reasoningChain.length > 0 && (
                            <div>
                              <button
                                onClick={() => toggleReasoning(msg.id)}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '0.74rem',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontWeight: '600',
                                  width: '100%',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <ShieldCheck size={14} color="#059669" />
                                  {isAr ? 'خطوات التحليل والمطابقة الكودية (Reasoning Steps)' : 'Code Verification & Reasoning Chain'}
                                </span>
                                {expandedReasoning[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>

                              {expandedReasoning[msg.id] && (
                                <div style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderTop: 'none',
                                  borderRadius: '0 0 6px 6px',
                                  padding: '8px 12px',
                                  fontSize: '0.73rem',
                                  color: '#334155'
                                }}>
                                  <ol style={{ margin: 0, paddingRight: isAr ? '16px' : 0, paddingLeft: !isAr ? '16px' : 0, lineHeight: 1.6 }}>
                                    {msg.data.reasoningChain.map((step, idx) => (
                                      <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. Pill: User Project Facts */}
                          {msg.data.userFactsUsed && (
                            <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                              <span style={{ fontWeight: '700' }}>{isAr ? 'البيانات المستند إليها: ' : 'Facts used: '}</span>
                              <span>{msg.data.userFactsUsed}</span>
                            </div>
                          )}

                          {/* 5. Pill: Official Civil Protection Review Required */}
                          <div style={{
                            background: '#faf5ff',
                            border: '1px solid #f3e8ff',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.72rem',
                            color: '#7e22ce',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <AlertTriangle size={14} color="#9333ea" />
                            <span>{isAr ? msg.data.humanReviewNoticeAr : msg.data.humanReviewNoticeEn}</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Multi-stage Thinking Indicator */}
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignSelf: 'flex-start',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
                borderRadius: '14px 14px 14px 2px',
                fontSize: '0.82rem',
                color: '#334155',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                maxWidth: '92%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#dc2626" className="spin-slow" />
                  <strong style={{ color: '#0f172a', fontSize: '0.84rem' }}>
                    {isAr ? 'جارٍ تدقيق وتحليل الكود المصري بدقة...' : 'Deliberating across 2026 Code Volumes...'}
                  </strong>
                </div>

                <div style={{
                  fontSize: '0.76rem',
                  color: '#475569',
                  background: '#f8fafc',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #f1f5f9'
                }}>
                  {thinkingStepsList[thinkingStep]}
                </div>

                {/* Progress Mini Bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${((thinkingStep + 1) / thinkingStepsList.length) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #dc2626, #ea580c)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{
            padding: '8px 14px',
            background: '#f1f5f9',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(isAr ? s.ar : s.en)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  color: '#334155',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {isAr ? s.ar : s.en}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={searchMode === 'general' 
                ? (isAr ? "اكتب سؤالك العام عن الكود المصري (مثال: اشتراطات غرف المحول، مسافات الارتحال)..." : "Ask any general Egyptian Fire Code question...") 
                : (isAr ? `اكتب سؤالك بخصوص مشروع (${selectedProject?.titleAr?.slice(0, 18)}...)...` : "Ask about this project...")}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              style={{
                background: inputVal.trim() && !loading ? '#dc2626' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 16px',
                cursor: inputVal.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
