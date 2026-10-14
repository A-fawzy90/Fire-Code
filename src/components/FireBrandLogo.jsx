import React from 'react';

export default function FireBrandLogo({ size = 42, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 4px 12px rgba(239, 68, 68, 0.45))' }}
      aria-label="شعار كود الحريق ومكافحة الحريق"
    >
      <defs>
        {/* Deep midnight protective shield gradient */}
        <linearGradient id="navShieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="45%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Golden-Crimson Shield Border */}
        <linearGradient id="navShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="30%" stopColor="#f97316" />
          <stop offset="70%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Fire Extinguishing Water Arc Gradient */}
        <linearGradient id="navWaterArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Central Fire Flame Gradient */}
        <linearGradient id="navFlameGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#b91c1c" />
          <stop offset="25%" stopColor="#ea580c" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="90%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Yellow Base Line Glow */}
        <filter id="navGlowYellow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Main Security Shield Base (درع الحماية ومقاومة الحريق) */}
      <path 
        d="M256 24 
           C370 24 456 56 456 136 
           C456 286 370 416 256 492 
           C142 416 56 286 56 136 
           C56 56 142 24 256 24 Z" 
        fill="url(#navShieldBg)" 
        stroke="url(#navShieldRim)" 
        strokeWidth="18"
        strokeLinejoin="round"
      />

      {/* 2. Inner Shield Highlight Ring */}
      <path 
        d="M256 44 
           C352 44 430 72 430 142 
           C430 274 352 392 256 462 
           C160 392 82 274 82 142 
           C82 72 160 44 256 44 Z" 
        fill="none" 
        stroke="rgba(255, 255, 255, 0.15)" 
        strokeWidth="4"
      />

      {/* 3. The Engineering Fire Triangle (مثلث الحريق الهندسي) */}
      {/* Side 1: Left Leg (Heat to Oxygen) */}
      <line x1="256" y1="110" x2="130" y2="340" stroke="#f87171" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
      
      {/* Side 2: Right Leg (Heat to Fuel) */}
      <line x1="256" y1="110" x2="382" y2="340" stroke="#fb923c" strokeWidth="12" strokeLinecap="round" opacity="0.85" />

      {/* Side 3: THE GOLDEN YELLOW BASE LINE (بين الوقود والأكسجين كما طلب المهندس) */}
      <line 
        x1="130" 
        y1="340" 
        x2="382" 
        y2="340" 
        stroke="#fde047" 
        strokeWidth="16" 
        strokeLinecap="round"
        filter="url(#navGlowYellow)"
      />

      {/* Fire Triangle Vertex Points */}
      {/* Heat (Top - Crimson Red) */}
      <circle cx="256" cy="110" r="16" fill="#dc2626" stroke="#fef08a" strokeWidth="5" />
      {/* Oxygen (Bottom Left - Sky Cyan) */}
      <circle cx="130" cy="340" r="16" fill="#0284c7" stroke="#fef08a" strokeWidth="5" />
      {/* Fuel (Bottom Right - Amber Orange) */}
      <circle cx="382" cy="340" r="16" fill="#ea580c" stroke="#fef08a" strokeWidth="5" />

      {/* 4. Fire Fighting Water Extinguishment Arc (قوس مكافحة وإخماد الحريق بالماء) */}
      <path 
        d="M170 320 
           C125 250 145 170 205 130 
           C168 170 172 240 215 285 
           Z" 
        fill="url(#navWaterArc)" 
      />

      {/* Water Droplet Accents (رذاذ أنظمة الإطفاء والرشاشات) */}
      <circle cx="175" cy="155" r="9" fill="#38bdf8" />
      <circle cx="150" cy="205" r="7" fill="#67e8f9" />
      <circle cx="140" cy="260" r="8" fill="#38bdf8" />

      {/* 5. Central Dynamic Fire Flame (شعلة الحريق المركزية القوية) */}
      <path 
        d="M256 150
           C282 200 330 240 330 300
           C330 355 292 385 256 385
           C220 385 182 355 182 300
           C182 250 215 210 236 180
           C238 215 260 250 268 265
           C276 235 270 195 256 150 Z" 
        fill="url(#navFlameGrad)" 
      />

      {/* 6. High-Intensity White Hot Fire Core (لب الشعلة المتوهج) */}
      <path 
        d="M256 255
           C272 285 288 310 288 335
           C288 360 270 375 256 375
           C242 375 224 360 224 335
           C224 310 240 285 256 255 Z" 
        fill="#ffffff" 
        opacity="0.95"
      />
    </svg>
  );
}
