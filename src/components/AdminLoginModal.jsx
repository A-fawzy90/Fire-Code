import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Eye, EyeOff, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  lang = 'ar' 
}) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const validPasscodes = ['2026', 'fawzy2026', 'ahmed2026', 'admin', 'fawzy'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = pin.trim();
    if (!trimmed) {
      setErrorMsg(isAr ? 'يرجى إدخال رمز المرور' : 'Please enter the PIN');
      return;
    }

    if (validPasscodes.includes(trimmed.toLowerCase())) {
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess();
        setIsSuccess(false);
        setPin('');
        onClose();
      }, 700);
    } else {
      setErrorMsg(isAr 
        ? 'رمز المرور غير صحيح. هذه اللوحة مخصصة لإدارة المهندس أحمد فوزي فقط.' 
        : 'Invalid passcode. This portal is reserved for Eng. Ahmed Fawzy.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          padding: '24px 24px 20px 24px',
          color: '#ffffff',
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              [isAr ? 'left' : 'right']: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              flexShrink: 0
            }}>
              <Lock size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {isAr ? 'بوابة دخول المهندس المسؤول والمالك' : 'Engineer & Owner Portal'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                {isAr 
                  ? 'المهندس / أحمد فوزي — مصمم ومطور المنظومة' 
                  : 'Eng. Ahmed Fawzy — Lead Designer & Developer'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                {isAr ? 'تم التحقق بنجاح!' : 'Access Granted!'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
                {isAr ? 'مرحباً بك يا بشمهندس أحمد فوزي، تم تفعيل وضع المسؤول الكامل.' : 'Welcome Eng. Ahmed Fawzy, Admin mode is now active.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '0.84rem',
                color: '#475569',
                lineHeight: 1.5
              }}>
                {isAr 
                  ? 'أهلاً بك يا بشمهندس أحمد. أدخل رمز المرور السريع لفتح لوحة التحكم وقاعدة بيانات Firebase وإعدادات المصادر.' 
                  : 'Welcome Eng. Ahmed. Enter your PIN to unlock database controls, Firebase sync, and system settings.'}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {isAr ? 'رمز مرور المسؤول (Admin PIN):' : 'Admin Passcode:'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={isAr ? 'أدخل الرمز (مثال: 2026)' : 'Enter PIN (e.g. 2026)'}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 14px',
                      borderRadius: '10px',
                      border: errorMsg ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    style={{
                      position: 'absolute',
                      [isAr ? 'left' : 'right']: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errorMsg && (
                  <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>
                    {errorMsg}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Key size={16} />
                  <span>{isAr ? 'دخول المسؤول' : 'Unlock Admin'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
