import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Save, 
  UploadCloud, 
  DownloadCloud, 
  Key, 
  Check, 
  HelpCircle,
  Copy,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  testFirebaseConnection, 
  syncProjectsToFirestore, 
  fetchProjectsFromFirestore,
  DEFAULT_FIREBASE_PROJECT_ID
} from '../services/firebaseConfig';

export default function FirebaseSyncModal({ 
  isOpen, 
  onClose, 
  lang = 'ar', 
  projects = [], 
  onProjectsUpdated 
}) {
  const isAr = lang === 'ar';

  // State hooks declared unconditionally at the very top (100% React Hooks rules compliant)
  const [config, setConfig] = useState(getFirebaseConfig());
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey || '');
  const [appIdInput, setAppIdInput] = useState(config.appId || '');
  const [senderIdInput, setSenderIdInput] = useState(config.messagingSenderId || '');
  
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getFirebaseConfig();
      setConfig(current);
      setApiKeyInput(current.apiKey || '');
      setAppIdInput(current.appId || '');
      setSenderIdInput(current.messagingSenderId || '');
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSaveConfig = async () => {
    try {
      const updated = await saveFirebaseConfig({
        apiKey: apiKeyInput.trim(),
        appId: appIdInput.trim(),
        messagingSenderId: senderIdInput.trim()
      });
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      alert(isAr ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving config');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await saveFirebaseConfig({
        apiKey: apiKeyInput.trim(),
        appId: appIdInput.trim(),
        messagingSenderId: senderIdInput.trim()
      });
      const result = await testFirebaseConnection();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        messageAr: `فشل الاختبار: ${err.message}`,
        messageEn: `Test failed: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncProjects = async () => {
    if (!projects || projects.length === 0) {
      alert(isAr ? 'لا توجد مشاريع محلية لرفعها إلى السحابة.' : 'No local projects to upload.');
      return;
    }
    setSyncing(true);
    try {
      const res = await syncProjectsToFirestore(projects);
      if (res.success) {
        alert(isAr 
          ? `تم رفع ومزامنة ${res.syncedCount} مشروع مع قاعدة بيانات Firestore بنجاح!` 
          : `Successfully synced ${res.syncedCount} projects to Firestore!`);
      } else {
        alert(isAr ? 'فشلت المزامنة. تأكد من إعداد المفاتيح واختبار الاتصال.' : 'Sync failed. Please check config.');
      }
    } catch (err) {
      alert(isAr ? `فشل المزامنة: ${err.message}` : `Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleFetchProjects = async () => {
    setFetching(true);
    try {
      const cloudProjects = await fetchProjectsFromFirestore();
      if (cloudProjects && cloudProjects.length > 0) {
        const confirmMerge = window.confirm(isAr
          ? `تم العثور على (${cloudProjects.length}) مشروع في السحابة.\n\nاضغط [موافق] لدمجها وحفظ مشاريعك الحالية معها بأمان.\nاضغط [إلغاء] للتراجع.`
          : `Found (${cloudProjects.length}) projects in Firestore.\n\nClick [OK] to safely merge them with your existing local projects.\nClick [Cancel] to abort.`);
        
        if (!confirmMerge) return;

        // Safe Merge Strategy: Combine existing projects with cloud projects by ID with strict schema validation
        const mergedMap = new Map();
        (projects || []).forEach(p => {
          if (p && p.id) mergedMap.set(String(p.id), p);
        });
        cloudProjects.forEach(cp => {
          if (!cp || typeof cp !== 'object') return;
          const key = String(cp.id || `proj-cloud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
          const existing = mergedMap.get(key) || {};
          mergedMap.set(key, {
            ...existing,
            ...cp,
            id: key,
            name: typeof cp.name === 'string' && cp.name.trim() ? cp.name : (existing.name || 'مشروع سحابي بدون عنوان'),
            occupancyType: cp.occupancyType || existing.occupancyType || 'commercial',
            status: cp.status || existing.status || 'pending_review',
            facts: (typeof cp.facts === 'object' && cp.facts !== null) ? { ...(existing.facts || {}), ...cp.facts } : (existing.facts || {})
          });
        });

        const mergedList = Array.from(mergedMap.values());
        if (onProjectsUpdated) {
          onProjectsUpdated(mergedList);
        }

        alert(isAr 
          ? `تم دمج وتحديث (${mergedList.length}) مشروع بنجاح!` 
          : `Successfully merged and updated (${mergedList.length}) projects!`);
      } else {
        alert(isAr 
          ? 'قاعدة بيانات Firestore فارغة حالياً. يمكنك استخدام زر "مزامنة ورفع المشاريع" لتصدير مشاريعك الحالية إلى السحابة.' 
          : 'Firestore is empty. Use Sync button to upload your local projects.');
      }
    } catch (err) {
      alert(isAr ? `فشل استرجاع المشاريع: ${err.message}` : `Fetch failed: ${err.message}`);
    } finally {
      setFetching(false);
    }
  };

  const copySecureRules = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      // Allow read/write only to authenticated users (including anonymous sessions)
      allow read, write: if request.auth != null;
    }
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null;
    }
    match /_connection_check/{docId} {
      allow read, write: if true;
    }
  }
}`;
    const fallbackCopy = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = rules;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedRules(true);
        setTimeout(() => setCopiedRules(false), 3000);
      } catch (err) {
        console.warn('Fallback copy error:', err);
      }
    };

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rules).then(() => {
          setCopiedRules(true);
          setTimeout(() => setCopiedRules(false), 3000);
        }).catch(() => fallbackCopy());
      } else {
        fallbackCopy();
      }
    } catch {
      fallbackCopy();
    }
  };

  // Safe early exit AFTER all React Hooks have been unconditionally executed
  if (!isOpen) return null;

  const isConnected = !!config.apiKey && config.apiKey.trim() !== '';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(5, 11, 24, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      padding: 'clamp(8px, 2.5vw, 20px)',
      overflowY: 'auto'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '94dvh',
        background: 'linear-gradient(165deg, #0f172a 0%, #090d16 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15)',
        color: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fef08a' }}>
                {isAr ? 'قاعدة بيانات Firebase السحابية (Firestore)' : 'Firebase Cloud Firestore Sync'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Project ID: <strong style={{ color: '#38bdf8' }}>{DEFAULT_FIREBASE_PROJECT_ID}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94a3b8',
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '78vh', overflowY: 'auto' }}>
          
          {/* Quick Direct Console Links */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isConnected ? '#22c55e' : '#f59e0b',
                boxShadow: isConnected ? '0 0 8px #22c55e' : '0 0 8px #f59e0b'
              }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                {isConnected 
                  ? (isAr ? 'البيانات مهيأة وجاهزة للمزامنة السحابية' : 'Configuration ready for Cloud Sync')
                  : (isAr ? 'بانتظار إدخال مفتاح الـ Web API Key' : 'Awaiting Web API Key')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="https://console.firebase.google.com/project/fire-code-9603d/overview"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fed7aa',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{isAr ? 'لوحة تحكم Firebase' : 'Firebase Console'}</span>
                <ExternalLink size={12} />
              </a>

              <a
                href="https://console.firebase.google.com/project/fire-code-9603d/firestore"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{isAr ? 'Firestore Database' : 'Firestore DB'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Quick Setup Guide Toggle with Secure Firestore Rules */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px'
          }}>
            <div 
              onClick={() => setShowGuide(!showGuide)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a', fontWeight: 700, fontSize: '0.84rem' }}>
                <HelpCircle size={16} color="#f59e0b" />
                <span>{isAr ? 'خطوات تفعيل قاعدة البيانات وقواعد الأمان المعتمدة:' : 'Setup guide & Secure Firestore Rules:'}</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', textDecoration: 'underline' }}>
                {showGuide ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض الخطوات والقواعد' : 'Show steps & rules')}
              </span>
            </div>

            {showGuide && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ol style={{ margin: 0, paddingRight: isAr ? '20px' : 0, paddingLeft: !isAr ? '20px' : 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <li>ادخل على <a href="https://console.firebase.google.com/project/fire-code-9603d/overview" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>مشروعك (fire-code-9603d)</a> ثم <strong>Project settings</strong> ➔ في الأسفل اضغط <code>&lt;/&gt;</code> وانسخ <code>apiKey</code>.</li>
                  <li>من القائمة الجانبية ادخل على <strong>Authentication</strong> واضغط <strong>Get started</strong>، وفعل <strong>Anonymous</strong> أو الإيميل.</li>
                  <li>في <strong>Firestore Database</strong> اضغط تبويب <strong>Rules</strong> وضع قواعد الأمان المعتمدة لحماية بيانات مشاريعك من القراءة أو التعديل غير المصرح به:</li>
                </ol>

                <div style={{
                  background: '#090d16',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px',
                  position: 'relative',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  color: '#86efac'
                }}>
                  <button
                    onClick={copySecureRules}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: isAr ? '6px' : 'auto',
                      right: !isAr ? '6px' : 'auto',
                      background: copiedRules ? '#16a34a' : '#1e293b',
                      color: '#fff',
                      border: '1px solid #475569',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copiedRules ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedRules ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ القواعد' : 'Copy Rules')}</span>
                  </button>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Credentials Form */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={16} color="#f59e0b" />
              <span>{isAr ? 'إعدادات وبيانات مفتاح الويب (Web App Credentials):' : 'Web App Credentials:'}</span>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                Web API Key (من كونسول Firebase):
              </label>
              <input 
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  background: '#090d16',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div className="grid-2" style={{ gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Project ID (مثبت لمشروعك):
                </label>
                <input 
                  type="text"
                  value={DEFAULT_FIREBASE_PROJECT_ID}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#93c5fd',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  App ID (اختياري / من الكونسول):
                </label>
                <input 
                  type="text"
                  value={appIdInput}
                  onChange={(e) => setAppIdInput(e.target.value)}
                  placeholder="1:123456:web:abcd..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    background: '#090d16',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleSaveConfig}
                style={{
                  background: saveSuccess ? '#16a34a' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                {saveSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>{saveSuccess ? (isAr ? 'تم الحفظ!' : 'Saved!') : (isAr ? 'حفظ الإعدادات' : 'Save Config')}</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#0f172a',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: testing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <RefreshCw size={14} className={testing ? 'spin' : ''} />
                <span>{testing ? (isAr ? 'جاري الاختبار...' : 'Testing...') : (isAr ? 'حفظ واختبار الاتصال' : 'Save & Test')}</span>
              </button>
            </div>

            {/* Test Connection Output Feedback */}
            {testResult && (
              <div style={{
                marginTop: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: testResult.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: testResult.success ? '1px solid #22c55e' : '1px solid #ef4444',
                color: testResult.success ? '#86efac' : '#fca5a5'
              }}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{isAr ? testResult.messageAr : testResult.messageEn}</span>
              </div>
            )}
          </div>

          {/* Cloud Sync Actions */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={16} color="#38bdf8" />
              <span>{isAr ? 'إجراءات المزامنة السحابية (Firestore Cloud Sync):' : 'Cloud Sync Operations:'}</span>
            </div>

            <div className="grid-2" style={{ gap: '10px' }}>
              {/* Push to Cloud */}
              <button
                type="button"
                onClick={handleSyncProjects}
                disabled={syncing}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <UploadCloud size={18} />
                <span>{syncing ? (isAr ? 'جاري الرفع...' : 'Syncing...') : (isAr ? `مزامنة ${projects.length} مشاريع للسحابة` : `Upload ${projects.length} Projects`)}</span>
              </button>

              {/* Pull from Cloud */}
              <button
                type="button"
                onClick={handleFetchProjects}
                disabled={fetching}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: fetching ? 'not-allowed' : 'pointer'
                }}
              >
                <DownloadCloud size={18} />
                <span>{fetching ? (isAr ? 'جاري الجلب...' : 'Fetching...') : (isAr ? 'استرجاع ودمج من السحابة' : 'Fetch & Merge Cloud Projects')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          color: '#64748b'
        }}>
          <span>{isAr ? 'مزامنة آمنة • مشاريع كود الحريق المصري ٢٠٢٦' : 'Secure Cloud Sync • Egyptian Fire Code 2026'}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              fontWeight: 700,
              textDecoration: 'underline'
            }}
          >
            {isAr ? 'إغلاق النافذة' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
