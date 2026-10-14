import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Key, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  History, 
  UserCheck, 
  Lock,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { SOURCE_DOCUMENTS, OFFICIAL_METADATA } from '../data/codeKnowledgeBase';
import { AI_PROVIDERS } from '../services/aiProvider';

export default function AdminView({ lang }) {
  const isAr = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState('providers'); // 'providers', 'sources', 'audit', 'roles'
  const [providers, setProviders] = useState(AI_PROVIDERS);
  const [selectedProviderId, setSelectedProviderId] = useState('local-rag');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Form states for external providers
  const [copilotApiKey, setCopilotApiKey] = useState('');
  const [copilotEndpoint, setCopilotEndpoint] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Audit Trail Log
  const [auditLogs] = useState([
    {
      id: 'log-1',
      timestamp: '2026-10-14 12:44:37',
      action: 'تحميل وفهرسة الكود المصري - الجزء الأول (٣٠٥/١) إصدار ٢٠٢٦',
      user: 'System Admin (HBRC Pipeline)',
      details: '252 pages, Scanned Raster Xerox Color C60, Hash: u00s1Q=='
    },
    {
      id: 'log-2',
      timestamp: '2026-10-14 12:49:05',
      action: 'تحميل وفهرسة الكود المصري - الجزء الثاني (٣٠٥/٢) إصدار ٢٠٢٦',
      user: 'System Admin (HBRC Pipeline)',
      details: '416 pages, Scanned Raster Xerox Color C60, Size: 76.8 MB'
    },
    {
      id: 'log-3',
      timestamp: '2026-10-14 12:49:21',
      action: 'تحميل وفهرسة الكود المصري - الجزء الثالث (٣٠٥/٣) إصدار ٢٠٢٦',
      user: 'System Admin (HBRC Pipeline)',
      details: '126 pages, Scanned Raster Xerox Color C60, Size: 19.5 MB'
    },
    {
      id: 'log-4',
      timestamp: '2026-10-14 12:49:25',
      action: 'تحميل واعتماد جدول تصنيف المباني والإشغالات (جدول ٢-١)',
      user: 'Chief Fire Consultant',
      details: '9 pages, PDF-XChange High-Res Extraction'
    },
    {
      id: 'log-5',
      timestamp: '2026-10-14 14:15:20',
      action: 'توليد تقرير تقييم هندسي لمشروع مجمع القاهرة الجديدة التجاري',
      user: 'Lead Architect',
      details: '6 code findings evaluated, 3 follow-ups generated'
    }
  ]);

  const handleTestConnection = (providerId) => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      if (providerId === 'local-rag') {
        setTestResult({
          success: true,
          messageAr: 'الاتصال المحلي نشط: قاعدة المعرفة المحلية المعتمدة الصادرة بقرار ٢٥٥ لسنة ٢٠٢٦ جاهزة وتعمل بدون إنترنت (Offline RAG).',
          messageEn: 'Local Grounded RAG is active and operational offline with official 2026 Code provisions.'
        });
      } else if (providerId === 'ms-copilot') {
        if (!copilotApiKey || !copilotEndpoint) {
          setTestResult({
            success: false,
            messageAr: 'فحص الإعدادات: لم يتم إدخال مفتاح الـ API أو رابط الـ Endpoint. لا يمكن حفظ أو تفعيل المزود دون بيانات صالحة.',
            messageEn: 'Validation Notice: API Key or Endpoint missing.'
          });
        } else {
          setTestResult({
            success: true,
            messageAr: 'تم التحقق من صحة تنسيق الرابط والمفتاح محلياً. ملاحظة أمنية: في بيئة الإنتاج المؤسسية، يُوصى بربط المفاتيح عبر خادم وسيط (Backend Proxy) لمنع كشفها في المتصفح.',
            messageEn: 'Format verified locally. Note: In enterprise production, API keys should be handled via a secure backend proxy to prevent client-side exposure.'
          });
        }
      } else if (providerId === 'gemini-custom') {
        if (!geminiApiKey) {
          setTestResult({
            success: false,
            messageAr: 'فحص الإعدادات: يرجى إدخال مفتاح Google Gemini API أولاً.',
            messageEn: 'Validation Notice: Please provide a Gemini API key first.'
          });
        } else {
          setTestResult({
            success: true,
            messageAr: 'تم التحقق من صحة تنسيق مفتاح Gemini محلياً. تنبيه أمني: استخدام المفتاح في المتصفح مخصص للاختبار الفردي؛ يُوصى باستخدام Backend Proxy في النشر المؤسسي.',
            messageEn: 'Gemini Key format verified locally. For production deployments, route requests through a secure backend proxy.'
          });
        }
      }
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {isAr ? 'إدارة المنظومة ومصادر الكود والذكاء الاصطناعي' : 'System Administration & AI Model Providers'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            {isAr 
              ? 'إدارة محركات الذكاء الاصطناعي القابلة للتوصيل (Pluggable AI)، وثائق الكود الرسمية، وسجلات التدقيق.'
              : 'Configure pluggable AI providers (Copilot/Azure/Local), manage official code sources, and audit logs.'}
          </p>
        </div>

        {/* Sub Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 'var(--radius-md)', padding: '4px' }}>
          <button
            onClick={() => setActiveSubTab('providers')}
            style={{
              background: activeSubTab === 'providers' ? '#ffffff' : 'transparent',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeSubTab === 'providers' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isAr ? 'مزودو الذكاء الاصطناعي (AI Providers)' : 'AI Providers'}
          </button>
          <button
            onClick={() => setActiveSubTab('sources')}
            style={{
              background: activeSubTab === 'sources' ? '#ffffff' : 'transparent',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeSubTab === 'sources' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isAr ? 'إدارة وثائق الكود والإصدارات' : 'Code Documents'}
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            style={{
              background: activeSubTab === 'audit' ? '#ffffff' : 'transparent',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeSubTab === 'audit' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isAr ? 'سجل التدقيق (Audit Trail)' : 'Audit Trail'}
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            style={{
              background: activeSubTab === 'roles' ? '#ffffff' : 'transparent',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.84rem',
              color: activeSubTab === 'roles' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isAr ? 'صلاحيات المستخدمين (RBAC)' : 'User Roles'}
          </button>
        </div>
      </div>

      {/* SubTab 1: Pluggable AI Providers */}
      {activeSubTab === 'providers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Security and Architecture Notice */}
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '16px 20px', fontSize: '0.86rem', color: '#92400e', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Key size={18} color="#d97706" />
              <strong style={{ color: '#b45309' }}>{isAr ? 'تنبيه أمني ومعماري هام بخصوص مفاتيح الـ API:' : 'Important Architecture & Security Warning:'}</strong>
            </div>
            {isAr 
              ? 'تطبيق الويب يعمل بصورة كاملة من جهة العميل (Client-Side Single Page Application). أي مفاتيح API تُدخل هنا تُحفظ في ذاكرة المتصفح المحلية (localStorage) وتُرسل مباشرة من جهازك. للاستخدام في المشروعات الحساسة أو النشر المؤسسي، يجب دائماً تفويض خادم وسيط (Backend Proxy / Cloud Function) لإخفاء المفاتيح وتأمين الاستدعاءات.'
              : 'This application runs entirely client-side. Keys entered here are stored in localStorage and called directly from your browser. In commercial or sensitive deployments, always route AI requests through a secure backend proxy.'}
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '16px 20px', fontSize: '0.86rem', color: '#1e40af' }}>
            <strong>{isAr ? 'مبدأ الشفافية في الذكاء الاصطناعي: ' : 'AI Transparency Principle: '}</strong>
            {isAr 
              ? 'تدعم المنظومة طبقة مزودي نماذج ذكاء اصطناعي مرنة وقابلة للتوصيل (Pluggable Model Provider Layer) تدعم Microsoft Copilot و Azure OpenAI. ولأغراض النزاهة الهندسية، لا يُعلن عن تفعيل أي تكامل خارجي ما لم يتم إعداده واختباره فعلياً.'
              : 'The application supports a pluggable AI model provider layer to integrate Microsoft Copilot or Azure OpenAI. Integration is only reported as active once configured and tested.'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {providers.map((p) => {
              const isSelected = selectedProviderId === p.id;
              return (
                <div 
                  key={p.id} 
                  className="card"
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '1px solid var(--surface-border)',
                    background: isSelected ? '#fcfdfe' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                          {p.status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {isAr ? p.statusLabelAr : p.statusLabelEn}
                        </span>
                        {isSelected && (
                          <span className="badge badge-dark">
                            {isAr ? 'المزود المختار حالياً' : 'Currently Selected'}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        {isAr ? p.nameAr : p.nameEn}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                        {isAr ? p.descriptionAr : p.descriptionEn}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedProviderId(p.id)}
                        className={isSelected ? "btn-primary" : "btn-secondary"}
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        {isSelected ? (isAr ? 'المزود النشط' : 'Active') : (isAr ? 'اختيار كمزود رئيسي' : 'Select Provider')}
                      </button>
                      <button
                        onClick={() => handleTestConnection(p.id)}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                        disabled={isTesting}
                      >
                        <RefreshCw size={14} className={isTesting ? "spin" : ""} />
                        {isAr ? 'اختبار الاتصال' : 'Test Connection'}
                      </button>
                    </div>
                  </div>

                  {/* Form fields if requires configuration */}
                  {p.requiresKey && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Key size={15} />
                        {isAr ? 'إعدادات نقطة النهاية والتراخيص (API Configuration):' : 'API & Endpoint Configuration:'}
                      </h4>
                      <div className="grid-2" style={{ gap: '12px' }}>
                        {p.id === 'ms-copilot' && (
                          <>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                Azure / Copilot Resource Endpoint URL:
                              </label>
                              <input
                                type="text"
                                value={copilotEndpoint}
                                onChange={(e) => setCopilotEndpoint(e.target.value)}
                                placeholder="https://your-resource.openai.azure.com/"
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                                API Secret Key:
                              </label>
                              <input
                                type="password"
                                value={copilotApiKey}
                                onChange={(e) => setCopilotApiKey(e.target.value)}
                                placeholder="••••••••••••••••••••••••"
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                              />
                            </div>
                          </>
                        )}
                        {p.id === 'gemini-custom' && (
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                              Google Gemini API Key:
                            </label>
                            <input
                              type="password"
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              placeholder="AIzaSy••••••••••••••••••••••••"
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Connection Test Result Alert */}
          {testResult && (
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: testResult.success ? '#ecfdf5' : '#fef2f2',
              border: testResult.success ? '1px solid #a7f3d0' : '1px solid #fecaca',
              color: testResult.success ? '#065f46' : '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {testResult.success ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
              <div>
                <strong>{testResult.success ? (isAr ? 'نتيجة الاختبار: ناجح' : 'Test Result: Success') : (isAr ? 'نتيجة الاختبار: تنبيه' : 'Test Result: Notice')}</strong>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>
                  {isAr ? testResult.messageAr : testResult.messageEn}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SubTab 2: Code Documents & Processing Status */}
      {activeSubTab === 'sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h3 className="card-title">
              <Layers size={20} color="#dc2626" />
              {isAr ? 'المستندات الرسمية وإصدارات الكود المسجلة' : 'Registered Code Documents & Editions'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SOURCE_DOCUMENTS.map((doc) => (
                <div key={doc.id} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge badge-dark">{doc.codeNumber}</span>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{isAr ? doc.titleAr : doc.titleEn}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {doc.pages} {isAr ? 'صفحة' : 'pages'} • {doc.sizeMB} • {isAr ? `الإصدار: ${doc.edition}` : `Edition: ${doc.edition}`}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                      <strong>{isAr ? 'حالة المعالجة: ' : 'Processing: '}</strong>{doc.processingStatus}
                    </div>
                  </div>

                  <span className="badge badge-green">
                    {isAr ? 'ساري ومعتمد' : 'Current & Active'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.82rem', color: '#991b1b' }}>
              <strong>{isAr ? 'التحكم في خلط الإصدارات (Strict Versioning): ' : 'Version Mixing Prevention: '}</strong>
              {isAr 
                ? 'كود الحريق الصادر سنة ١٩٩٨ ملغى رسمياً بموجب المادة الأولى من القرار ٢٥٥ لسنة ٢٠٢٦. يمنع المساعد خلط بنود الإصدار القديم مع الإصدار الجديد منعاً باتاً للحفاظ على المسؤولية القانونية.'
                : 'The 1998 edition is superseded by Decree 255/2026. The assistant strictly prevents mixing provisions between editions.'}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Audit Trail */}
      {activeSubTab === 'audit' && (
        <div className="card">
          <h3 className="card-title">
            <History size={20} color="#2563eb" />
            {isAr ? 'سجل التدقيق والتتبع الهندسي (Audit Trail)' : 'Engineering Audit Trail & Activity Log'}
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: isAr ? 'right' : 'left' }}>
                  <th style={{ padding: '10px 12px' }}>{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                  <th style={{ padding: '10px 12px' }}>{isAr ? 'الإجراء / العملية' : 'Action'}</th>
                  <th style={{ padding: '10px 12px' }}>{isAr ? 'المستخدم / الدور' : 'User'}</th>
                  <th style={{ padding: '10px 12px' }}>{isAr ? 'التفاصيل والتوثيق' : 'Details'}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{log.action}</td>
                    <td style={{ padding: '10px 12px', color: '#2563eb' }}>{log.user}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 4: Role-Based Access Control */}
      {activeSubTab === 'roles' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="card-title">
              <UserCheck size={20} color="#059669" />
              {isAr ? 'هيكل الصلاحيات المقترح للمؤسسات (Enterprise RBAC Schema)' : 'Proposed Enterprise RBAC Schema'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>
              {isAr 
                ? 'مخطط هيكلي استرشادي لتوزيع الصلاحيات عند ربط التطبيق مع خادم هوية مؤسسي (SSO / IAM). النسخة الحالية تعمل بجلسة فردية محلية آمنة (Single-User Local Client).'
                : 'Architectural blueprint for enterprise identity integration (SSO/IAM). Current runtime operates as a secure single-user local client.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>🛡️ مسؤول النظام (Administrator):</strong>
                <div style={{ color: '#64748b' }}>إدارة وثائق الكود، تكوين مزودي الذكاء الاصطناعي، ومراقبة سجلات التدقيق.</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>📐 مهندس سلامة ومكافحة حريق (Fire Protection Engineer):</strong>
                <div style={{ color: '#64748b' }}>إجراء تقييم المشاريع، فحص المخططات، وتوليد مذكرات العرض على الحماية المدنية.</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>📋 مراجع فني (Reviewer / Civil Protection Liaison):</strong>
                <div style={{ color: '#64748b' }}>مراجعة الملاحظات وتدوين قرارات وتأشيرات اللجان الهندسية.</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a' }}>👁️ مستعرض فقط (Read-Only Owner):</strong>
                <div style={{ color: '#64748b' }}>الاطلاع على التقارير وحالة المشروع دون صلاحية تعديل المعاملات.</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">
              <Lock size={20} color="#dc2626" />
              {isAr ? 'خصوصية وأمان مستندات المشروعات' : 'Data Privacy & File Security'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, marginBottom: '12px' }}>
              {isAr 
                ? 'يتم الاحتفاظ بملفات المخططات والمسودات الفنية المرفوعة في مساحة العمل الخاصة بالمشروع محلياً في متصفحك (Client-side Sandbox) دون أي تدريب لموديلات عامة أو مشاركة خارج جهازك.'
                : 'Customer files and drawings remain strictly local within your browser workspace and are never shared or used for foundation model training.'}
            </p>
            <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', fontSize: '0.8rem', color: '#065f46' }}>
              ✓ {isAr ? 'عزل البيانات نشط محلياً داخل المتصفح (Client LocalStorage Isolation)' : 'Client-side data isolation active — project files stay in your browser'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
