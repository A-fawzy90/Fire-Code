import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Flame, 
  Wind, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Gauge, 
  Maximize2, 
  ArrowRight, 
  Info,
  Building2,
  Sliders
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/codeKnowledgeBase';

export default function EngineeringCalculators({ lang, selectedProject, onOpenAssistant }) {
  const isAr = lang === 'ar';

  // Active Calculator Tab: 'tank_pump' | 'egress_stairs' | 'smoke_pressurization'
  const [activeCalc, setActiveCalc] = useState('tank_pump');
  const [copiedNote, setCopiedNote] = useState(false);

  // ==========================================
  // CALCULATOR 1: FIRE WATER TANK & PUMPS
  // ==========================================
  const [hazardClass, setHazardClass] = useState('ordinary_2'); // light, ordinary_1, ordinary_2, extra_1, storage
  const [floorArea, setFloorArea] = useState(selectedProject?.facts?.floorArea || 1200);
  const [hasSprinklers, setHasSprinklers] = useState(true);
  const [hasHoseCabinets, setHasHoseCabinets] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(90); // 30, 60, 90, 120
  const [buildingHeadMeters, setBuildingHeadMeters] = useState(selectedProject?.facts?.buildingHeight || 28);

  const tankPumpResults = useMemo(() => {
    // Flow parameters by Egyptian Code 305/2
    let sprinklerGpm = 0;
    let hoseGpm = hasHoseCabinets ? 250 : 0;

    switch (hazardClass) {
      case 'light':
        sprinklerGpm = hasSprinklers ? 350 : 0;
        if (hasHoseCabinets) hoseGpm = 100;
        break;
      case 'ordinary_1':
        sprinklerGpm = hasSprinklers ? 500 : 0;
        if (hasHoseCabinets) hoseGpm = 250;
        break;
      case 'ordinary_2':
        sprinklerGpm = hasSprinklers ? 750 : 0;
        if (hasHoseCabinets) hoseGpm = 250;
        break;
      case 'extra_1':
        sprinklerGpm = hasSprinklers ? 1000 : 0;
        if (hasHoseCabinets) hoseGpm = 500;
        break;
      case 'storage':
        sprinklerGpm = hasSprinklers ? 1500 : 0;
        if (hasHoseCabinets) hoseGpm = 500;
        break;
      default:
        sprinklerGpm = 750;
        hoseGpm = 250;
    }

    const totalFlowGpm = (sprinklerGpm + hoseGpm) || 500;
    const totalFlowLpm = Math.round(totalFlowGpm * 3.78541);
    const totalVolumeGallons = totalFlowGpm * durationMinutes;
    const totalVolumeM3 = Math.ceil((totalVolumeGallons * 3.78541) / 1000);

    // Approximate Dimensions for Concrete Tank (effective water depth = 3.5m)
    const effectiveDepth = 3.5;
    const requiredFootprintArea = Math.ceil(totalVolumeM3 / effectiveDepth);
    const tankWidth = Math.max(3.0, Math.round(Math.sqrt(requiredFootprintArea * 0.75) * 10) / 10);
    const tankLength = Math.max(4.0, Math.round((requiredFootprintArea / tankWidth) * 10) / 10);

    // Hydraulic Pressure Head calculation:
    // Static Head + Friction losses (approx 1.5 bar) + Required residual pressure at highest sprinkler (approx 2.5 bar)
    const staticPressureBar = (buildingHeadMeters * 9.81) / 100; // bar
    const frictionLossesBar = 1.5;
    const residualNozzleBar = 2.5;
    const totalHeadBar = Math.round((staticPressureBar + frictionLossesBar + residualNozzleBar) * 10) / 10;
    const totalHeadPsi = Math.round(totalHeadBar * 14.5038);

    // Pump Brake Horsepower (BHP): (GPM * PSI) / (1714 * Efficiency) with 15% safety factor
    const pumpEfficiency = 0.70;
    const calculatedHP = Math.round(((totalFlowGpm * totalHeadPsi) / (1714 * pumpEfficiency)) * 1.15);
    const standardHpRatings = [25, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300];
    const selectedHP = standardHpRatings.find(hp => hp >= calculatedHP) || Math.ceil(calculatedHP / 25) * 25;
    const pumpKw = Math.round(selectedHP * 0.746);

    // Jockey Pump: 1% to 2% flow or 10-15 GPM, Head + 10 PSI
    const jockeyGpm = Math.max(10, Math.round(totalFlowGpm * 0.015));
    const jockeyHP = selectedHP > 100 ? 5 : 3;

    // Diesel Tank Capacity: 1 Gallon per HP per 10 hours approx (NFPA 20 / Code 305/2 specifies 8 hours run time)
    const dieselFuelGallons = Math.round(selectedHP * 0.08 * 8);

    return {
      sprinklerGpm,
      hoseGpm,
      totalFlowGpm,
      totalFlowLpm,
      totalVolumeM3,
      totalVolumeGallons,
      tankLength,
      tankWidth,
      effectiveDepth,
      totalHeadBar,
      totalHeadPsi,
      pumpHP: selectedHP,
      pumpKw,
      jockeyGpm,
      jockeyHP,
      dieselFuelGallons
    };
  }, [hazardClass, floorArea, hasSprinklers, hasHoseCabinets, durationMinutes, buildingHeadMeters]);

  // ==========================================
  // CALCULATOR 2: EGRESS & STAIR SIZING
  // ==========================================
  const [occupantLoad, setOccupantLoad] = useState(240); // Number of people on most populated floor
  const [occupancyType, setOccupancyType] = useState('commercial'); // commercial, residential, assembly, educational, healthcare
  const [stairsProtectedWithSprinklers, setStairsProtectedWithSprinklers] = useState(true);
  const [numStairs, setNumStairs] = useState(2); // 2, 3, 4

  const egressResults = useMemo(() => {
    // Egyptian Fire Code 305/1 and Decree 255/2026:
    // Without Sprinklers: Stairs = 7.6 mm/person (0.3"), Level/Corridors = 5.0 mm/person (0.2")
    // With Sprinklers & Voice Alarm: Stairs = 5.0 mm/person (0.2"), Level/Corridors = 4.0 mm/person (0.16")
    const stairFactor = stairsProtectedWithSprinklers ? 5.0 : 7.6;
    const corridorFactor = stairsProtectedWithSprinklers ? 4.0 : 5.0;

    const totalStairWidthMm = Math.round(occupantLoad * stairFactor);
    const calculatedWidthPerStairMm = Math.ceil(totalStairWidthMm / numStairs);

    // Minimum Permissible Stair Width by Code 305/1 & Decree 255/2026:
    let minCodeWidthMm = 1100; // default for 50-200 persons
    if (occupancyType === 'healthcare') {
      minCodeWidthMm = 1800; // Hospital bed transport
    } else if (occupantLoad >= 200) {
      minCodeWidthMm = 1200; // Over 200 occupants
    } else if (occupantLoad < 50) {
      minCodeWidthMm = 900; // Small residential / small business
    }

    const finalStairWidthMm = Math.max(calculatedWidthPerStairMm, minCodeWidthMm);
    const finalStairWidthMeters = (finalStairWidthMm / 1000).toFixed(2);

    // Corridors & Exit Doors Width
    const totalCorridorWidthMm = Math.round(occupantLoad * corridorFactor);
    const minCorridorWidthMm = occupancyType === 'healthcare' ? 2200 : (occupantLoad > 50 ? 1200 : 1000);
    const finalCorridorWidthMm = Math.max(totalCorridorWidthMm, minCorridorWidthMm);

    // Capacity per stair (persons capacity)
    const stairCapacityPersons = Math.floor(finalStairWidthMm / stairFactor);

    // Standard Riser & Tread dimensions (Code 305/1)
    const riserHeightCm = 16.5; // Max 18cm, ideal 15-17cm
    const treadDepthCm = 28.0;  // Min 27cm, ideal 28-30cm

    return {
      stairFactor,
      corridorFactor,
      totalStairWidthMm,
      calculatedWidthPerStairMm,
      minCodeWidthMm,
      finalStairWidthMm,
      finalStairWidthMeters,
      finalCorridorWidthMm,
      finalCorridorWidthMeters: (finalCorridorWidthMm / 1000).toFixed(2),
      stairCapacityPersons,
      riserHeightCm,
      treadDepthCm
    };
  }, [occupantLoad, occupancyType, stairsProtectedWithSprinklers, numStairs]);

  // ==========================================
  // CALCULATOR 3: STAIRWELL PRESSURIZATION & SMOKE
  // ==========================================
  const [numStories, setNumStories] = useState(selectedProject?.facts?.totalFloors || 7);
  const [storyHeightMeters, setStoryHeightMeters] = useState(3.2);
  const [numOpenDoors, setNumOpenDoors] = useState(2); // Ground exit door + fire floor door
  const [doorWidthMeters, setDoorWidthMeters] = useState(1.0);
  const [doorHeightMeters, setDoorHeightMeters] = useState(2.1);
  const [injectionType, setInjectionType] = useState('multiple'); // 'single' | 'multiple'
  const [basementArea, setBasementArea] = useState(selectedProject?.facts?.floorArea || 1200);

  const smokeResults = useMemo(() => {
    // Egyptian Fire Code 305/1 & 305/3:
    // Minimum design differential pressure with all doors closed: 50 Pa
    // Maximum allowable door opening force <= 133 N (limits pressure to approx 100-130 Pa)
    const designDeltaP = 50; // Pascals

    // Code required egress airflow velocity through design open doors: 1.0 m/s
    const targetDoorVelocityMps = 1.0; 

    // Airflow through open doors: Q_doors = N_doors * Area * Velocity
    const safeDoorW = Math.max(0.8, doorWidthMeters || 1.0);
    const safeDoorH = Math.max(1.8, doorHeightMeters || 2.1);
    const safeNumOpen = Math.max(1, numOpenDoors || 2);
    const safeStories = Math.max(2, numStories || 7);
    const safeStoryH = Math.max(2.5, storyHeightMeters || 3.2);
    const totalStairHeight = Math.round(safeStories * safeStoryH * 10) / 10;

    const singleDoorAreaM2 = safeDoorW * safeDoorH;
    const totalOpenDoorAreaM2 = safeNumOpen * singleDoorAreaM2;
    const flowThroughDoorsM3s = totalOpenDoorAreaM2 * targetDoorVelocityMps; // m3/s
    const flowThroughDoorsCfm = flowThroughDoorsM3s * 2118.88;

    // Air leakage through closed doors & building envelope:
    // Each closed stair door leaks approx 150 - 250 CFM @ 50 Pa with standard seals
    const numClosedDoors = Math.max(0, safeStories - safeNumOpen);
    const leakagePerDoorCfm = 180;
    const totalClosedDoorsLeakageCfm = numClosedDoors * leakagePerDoorCfm;

    // Duct & shaft leakage safety factor: 15% - 25%
    const subtotalCfm = flowThroughDoorsCfm + totalClosedDoorsLeakageCfm;
    const safetyFactor = 1.20; // 20%
    const totalFanCapacityCfm = Math.round(subtotalCfm * safetyFactor);
    const totalFanCapacityM3h = Math.round(totalFanCapacityCfm * 1.69901);

    // Dynamic Fan static pressure:
    // In multiple injection shafts: balanced ductwork (~180 Pa duct loss + 50 Pa deltaP = 230 Pa)
    // In single injection points: stack effect and friction require higher head (~260 Pa duct loss + 50 Pa deltaP = 310 Pa)
    const ductFrictionPa = injectionType === 'single' ? 260 : 180;
    const fanStaticPressurePa = Math.round(designDeltaP + ductFrictionPa);

    // Code recommendation check: single injection is only suitable for <= 15m (approx 4-5 floors)
    const singleInjectionWarning = injectionType === 'single' && totalStairHeight > 15;

    // Fan Motor kW estimation: (CFM * SP in inches w.g.) / (6356 * fanEff)
    const spInchesWater = fanStaticPressurePa / 249.0889;
    const fanEfficiency = 0.65;
    const fanMotorHP = Math.max(3, Math.round(((totalFanCapacityCfm * spInchesWater) / (6356 * fanEfficiency)) * 1.25));
    const fanMotorKw = Math.round(fanMotorHP * 0.746 * 10) / 10;

    // Basement Parking Smoke Exhaust requirement (10 Air Changes per Hour - ACH)
    const safeBasementArea = Math.max(50, basementArea || 1200);
    const basementVolumeM3 = safeBasementArea * 3.0; // 3m clear height
    const smokeExhaustM3h = Math.round(basementVolumeM3 * 10);
    const smokeExhaustCfm = Math.round(smokeExhaustM3h / 1.69901);

    return {
      designDeltaP,
      targetDoorVelocityMps,
      totalStairHeight,
      singleInjectionWarning,
      totalOpenDoorAreaM2: totalOpenDoorAreaM2.toFixed(2),
      flowThroughDoorsCfm: Math.round(flowThroughDoorsCfm),
      totalClosedDoorsLeakageCfm: Math.round(totalClosedDoorsLeakageCfm),
      totalFanCapacityCfm,
      totalFanCapacityM3h,
      fanStaticPressurePa,
      fanMotorHP,
      fanMotorKw,
      smokeExhaustCfm,
      smokeExhaustM3h
    };
  }, [numStories, storyHeightMeters, numOpenDoors, doorWidthMeters, doorHeightMeters, injectionType, basementArea]);

  // Copy Calculation Sheet formatted for Egyptian official records
  const handleCopyNote = () => {
    let noteText = '';
    const dateStr = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US');

    if (activeCalc === 'tank_pump') {
      noteText = `نوتة حسابية هيدروليكية - سعة خزان مياه مكافحة الحريق ومجموعة الطلمبات
تاريخ الحساب: ${dateStr}
المرجعية: الكود المصري لحماية المنشآت من أخطار الحريق (كود ٣٠٥/٢) والقرار ٢٥٥ لسنة ٢٠٢٦
تصميم وتطوير: المهندس / أحمد فوزي (جميع الحقوق محفوظة © ٢٠٢٦)

١. معطيات الحساب:
- تصنيف الخطورة: ${hazardClass}
- مساحة الدور الأكثر حرجاً: ${floorArea} م²
- شبكة الرشاشات التلقائية: ${hasSprinklers ? 'نعم (مشمولة)' : 'غير مشمولة'}
- صناديق الحريق: ${hasHoseCabinets ? 'نعم (صناديق رطبة ٢٥٠ GPM)' : 'غير مشمولة'}
- زمن الاحتياطي المطلوب: ${durationMinutes} دقيقة
- ارتفاع المبنى الهيدروليكي: ${buildingHeadMeters} متراً

٢. نتائج الحسابات الهيدروليكية المعتمدة:
- تدفق الرشاشات التصميمي: ${tankPumpResults.sprinklerGpm} GPM
- تدفق صناديق الحريق: ${tankPumpResults.hoseGpm} GPM
- إجمالي تدفق المضخات: ${tankPumpResults.totalFlowGpm} GPM (${tankPumpResults.totalFlowLpm} لتر/دقيقة)
- سعة الخزان الصافية المطلوبة: ${tankPumpResults.totalVolumeM3} متر مكعب (${tankPumpResults.totalVolumeGallons.toLocaleString()} جالون)
- الأبعاد الخرسانية المقترحة للخزان: ${tankPumpResults.tankLength}م طول × ${tankPumpResults.tankWidth}م عرض × ${tankPumpResults.effectiveDepth}م عمق فعال (+ 0.5م فراغ هواء)
- ضغط الطرد التصميمي: ${tankPumpResults.totalHeadBar} بار (${tankPumpResults.totalHeadPsi} PSI)

٣. مواصفات مجموعة الطلمبات الثلاثية (Triplex Set):
- الطلمبة الكهربائية الرئيسية: ${tankPumpResults.totalFlowGpm} GPM @ ${tankPumpResults.totalHeadBar} بار | قدرة المحرك: ${tankPumpResults.pumpHP} حصان (${tankPumpResults.pumpKw} kW)
- طلمبة الديزل الاحتياطية (100% Standby): ${tankPumpResults.totalFlowGpm} GPM @ ${tankPumpResults.totalHeadBar} بار | خزان ديزل: ${tankPumpResults.dieselFuelGallons} جالون (٨ ساعات تشغيل)
- طلمبة الجوكي التعويضية (Jockey): ${tankPumpResults.jockeyGpm} GPM | قدرة: ${tankPumpResults.jockeyHP} حصان
`;
    } else if (activeCalc === 'egress_stairs') {
      noteText = `نوتة حسابية معمارية - استيعاب وعروض السلالم ومسالك الهروب
تاريخ الحساب: ${dateStr}
المرجعية: الكود المصري لحماية المنشآت من أخطار الحريق (كود ٣٠٥/١) والقرار ٢٥٥ لسنة ٢٠٢٦
تصميم وتطوير: المهندس / أحمد فوزي (جميع الحقوق محفوظة © ٢٠٢٦)

١. معطيات الحساب:
- حمولة الإشغال في الدور الأكثر كثافة: ${occupantLoad} شخص
- نوع الإشغال: ${occupancyType}
- حماية المبنى بالرشاشات: ${stairsProtectedWithSprinklers ? 'نعم (معامل ٥ مم/شخص للسلالم)' : 'لا (معامل ٧٫٦ مم/شخص للسلالم)'}
- عدد سلالم الهروب المتوفرة: ${numStairs} سلالم

٢. نتائج عروض السلالم ومسالك الهروب:
- إجمالي العرض النظري المطلوب للسلالم: ${egressResults.totalStairWidthMm} مليمتر
- العرض الصافي المطلوب لكل سلم: ${egressResults.finalStairWidthMm} مليمتر (${egressResults.finalStairWidthMeters} متراً)
- الحد الأدنى الكودي الإلزامي المعتمد: ${egressResults.minCodeWidthMm} مليمتر
- قدرة استيعاب كل سلم: ${egressResults.stairCapacityPersons} شخص
- العرض الصافي المطلوب للممرات والأبواب: ${egressResults.finalCorridorWidthMm} مليمتر (${egressResults.finalCorridorWidthMeters} متراً)
- مواصفات الدرجة: القائمة ${egressResults.riserHeightCm} سم × النائمة ${egressResults.treadDepthCm} سم (مع بسطة لا تقل عن عرض السلم)
`;
    } else {
      noteText = `نوتة حسابية ميكانيكية - مراوح ضغط السلالم وسحب الدخان
تاريخ الحساب: ${dateStr}
المرجعية: الكود المصري ٣٠٥/١ و ٣٠٥/٣ والقرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦
تصميم وتطوير: المهندس / أحمد فوزي (جميع الحقوق محفوظة © ٢٠٢٦)

١. معطيات الحساب:
- عدد طوابق المبنى: ${numStories} طوابق (ارتفاع الدور: ${storyHeightMeters} م)
- عدد الأبواب المفتوحة التصميمية أثناء الإخلاء: ${numOpenDoors} أبواب (مساحة الباب: ${doorWidthMeters}م × ${doorHeightMeters}م)
- نوع حقن الهواء: ${injectionType === 'multiple' ? 'حقن متعدد كل ٣ أدوار' : 'حقن نقطي واحد'}

٢. نتائج ضغط السلم وسحب الدخان:
- فرق الضغط الكودي الإلزامي (الأبواب مغلقة): ${smokeResults.designDeltaP} باسكال (بما يضمن عدم تجاوز قوة الدفع ١٣٣ نيوتن)
- سرعة الهواء الكودية عبر الأبواب المفتوحة: ${smokeResults.targetDoorVelocityMps} م/ث (لمنع ارتداد الدخان)
- تدفق الهواء عبر الأبواب المفتوحة: ${smokeResults.flowThroughDoorsCfm} CFM
- تسريب الأبواب المغلقة والعمود: ${smokeResults.totalClosedDoorsLeakageCfm} CFM
- سعة مروحة ضغط السلم المطلوبة (بمعامل أمان ٢٠٪): ${smokeResults.totalFanCapacityCfm.toLocaleString()} CFM (${smokeResults.totalFanCapacityM3h.toLocaleString()} م³/ساعة)
- الضغط الاستاتيكي الإجمالي للمروحة: ${smokeResults.fanStaticPressurePa} باسكال
- القدرة المقترحة لمحرك المروحة: ${smokeResults.fanMotorHP} حصان (${smokeResults.fanMotorKw} kW)
- معدل سحب دخان الجراج التقديري (١٠ مرات/ساعة): ${smokeResults.smokeExhaustCfm.toLocaleString()} CFM (${smokeResults.smokeExhaustM3h.toLocaleString()} م³/ساعة)
`;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(noteText).catch(() => {
          fallbackCopyText(noteText);
        });
      } else {
        fallbackCopyText(noteText);
      }
    } catch {
      fallbackCopyText(noteText);
    }
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2500);
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.warn("Fallback copy failed", e);
    }
  };

  // Sync inputs from active project if available
  const handleImportProjectData = () => {
    if (!selectedProject || !selectedProject.facts) return;
    const f = selectedProject.facts;
    if (f.floorArea) setFloorArea(f.floorArea);
    if (f.buildingHeight) {
      setBuildingHeadMeters(f.buildingHeight);
    }
    if (f.totalFloors) setNumStories(f.totalFloors);
  };

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
              }}>
                <Calculator size={22} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                  {isAr ? 'حاسبات الكود السريعة التفاعلية (Fire Engineering Calculators)' : 'Interactive Fire Code Calculators'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#fed7aa', marginTop: '3px' }}>
                  <span>{isAr ? 'كود رقم ٣٠٥ والقرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦' : 'Egyptian Fire Code 305 & Decree 255/2026'}</span>
                  <span>•</span>
                  <span>{isAr ? 'تصميم: م. أحمد فوزي' : 'By Eng. Ahmed Fawzy'}</span>
                </div>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
              {isAr 
                ? 'أدوات حسابية تفاعلية دقيقة بنظام الإدخال اللحظي والمخططات الهندسية المعتمدة لحساب سعات خزانات المياه، قدرات الطلمبات الثلاثية، عروض السلالم ومسالك الهروب، ومراوح ضغط السلالم وسحب الدخان.'
                : 'Real-time engineering calculators for sizing fire water tanks, pumps, egress stair widths, and stairwell pressurization systems.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {selectedProject && (
              <button
                type="button"
                onClick={handleImportProjectData}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fef08a',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                title={isAr ? 'استيراد مساحة وارتفاع المشروع النشط فوراً' : 'Import Project Data'}
              >
                <Building2 size={14} />
                <span>{isAr ? 'استيراد بيانات المشروع' : 'Import Project Data'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyNote}
              style={{
                background: copiedNote ? '#16a34a' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {copiedNote ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedNote ? (isAr ? 'تم نسخ النوتة الحسابية!' : 'Copied!') : (isAr ? 'نسخ النوتة الحسابية الرسمية' : 'Copy Official Calc Sheet')}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveCalc('tank_pump')}
            style={{
              background: activeCalc === 'tank_pump' ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: activeCalc === 'tank_pump' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: activeCalc === 'tank_pump' ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <span>💧</span>
            <span>{isAr ? '١. سعة خزان المياه ومجموعة الطلمبات' : '1. Water Tank & Fire Pumps'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCalc('egress_stairs')}
            style={{
              background: activeCalc === 'egress_stairs' ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: activeCalc === 'egress_stairs' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: activeCalc === 'egress_stairs' ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <span>🚪</span>
            <span>{isAr ? '٢. عروض السلالم ومسالك الهروب' : '2. Egress & Stair Sizing'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCalc('smoke_pressurization')}
            style={{
              background: activeCalc === 'smoke_pressurization' ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: activeCalc === 'smoke_pressurization' ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: activeCalc === 'smoke_pressurization' ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            <span>🌀</span>
            <span>{isAr ? '٣. مراوح ضغط السلالم وسحب الدخان' : '3. Pressurization & Smoke Control'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: WATER TANK & PUMPS CALCULATOR */}
      {/* ========================================================= */}
      {activeCalc === 'tank_pump' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.25fr)', gap: '20px' }}>
          {/* Inputs Column */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <Sliders size={18} color="#dc2626" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isAr ? 'معطيات التصميم الهيدروليكي (كود ٣٠٥/٢)' : 'Hydraulic Design Inputs'}
              </h2>
            </div>

            {/* Hazard Classification */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'تصنيف درجة الخطورة (Hazard Classification):' : 'Hazard Classification:'}
              </label>
              <select 
                value={hazardClass} 
                onChange={(e) => setHazardClass(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#ffffff', fontFamily: 'inherit' }}
              >
                <option value="light">{isAr ? 'خطورة خفيفة (Light Hazard) - مباني سكنية، مكاتب، مدارس' : 'Light Hazard (Residential, Offices, Schools)'}</option>
                <option value="ordinary_1">{isAr ? 'خطورة عادية مجموعة ١ (Ordinary Group 1) - مطاعم، صيدليات، مخابز' : 'Ordinary Group 1 (Bakeries, Rest. dining)'}</option>
                <option value="ordinary_2">{isAr ? 'خطورة عادية مجموعة ٢ (Ordinary Group 2) - مولات تجارية، ورش، جراجات' : 'Ordinary Group 2 (Malls, Workshops, Parking)'}</option>
                <option value="extra_1">{isAr ? 'خطورة عالية مجموعة ١ (Extra Hazard 1) - مصانع كيماويات وبلاستيك' : 'Extra Hazard 1 (Plastics, Chemical)'}</option>
                <option value="storage">{isAr ? 'مستودعات وتخزين عالي (High-Piled Storage)' : 'High-Piled Storage'}</option>
              </select>
            </div>

            {/* Floor Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isAr ? 'مساحة الدور الأكثر حرجاً (م²):' : 'Critical Floor Area (m²):'}</span>
                <span style={{ fontWeight: 800, color: '#dc2626' }}>{floorArea} م²</span>
              </div>
              <input 
                type="number" 
                value={floorArea}
                onChange={(e) => setFloorArea(Number(e.target.value))}
                min={100}
                max={50000}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
              />
            </div>

            {/* Building Head (Height) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isAr ? 'ارتفاع المبنى الهيدروليكي (متراً):' : 'Building Height (m):'}</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>{buildingHeadMeters} م</span>
              </div>
              <input 
                type="range" 
                min={6} 
                max={120} 
                step={2}
                value={buildingHeadMeters}
                onChange={(e) => setBuildingHeadMeters(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            {/* System Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasSprinklers} 
                  onChange={(e) => setHasSprinklers(e.target.checked)} 
                  style={{ accentColor: '#dc2626' }}
                />
                <span>{isAr ? 'شبكة رشاشات مائية تلقائية (Automatic Sprinklers)' : 'Automatic Sprinkler System'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasHoseCabinets} 
                  onChange={(e) => setHasHoseCabinets(e.target.checked)} 
                  style={{ accentColor: '#dc2626' }}
                />
                <span>{isAr ? 'صناديق حريق كودية رطبة (Fire Hose Cabinets ٢٥٠ GPM)' : 'Wet Fire Hose Cabinets (250 GPM)'}</span>
              </label>
            </div>

            {/* Reserve Duration */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'زمن الاحتياطي التشغيلي للخزان (بالدقيقة):' : 'Reserve Duration (Minutes):'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[30, 60, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDurationMinutes(dur)}
                    style={{
                      background: durationMinutes === dur ? '#0f172a' : '#f1f5f9',
                      color: durationMinutes === dur ? '#ffffff' : '#334155',
                      border: durationMinutes === dur ? '1px solid #0f172a' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {dur} {isAr ? 'دقيقة' : 'min'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {isAr ? '* الكود المصري يشترط ٦٠ - ٩٠ دقيقة للمباني التجارية والعامة و٣٠ دقيقة للخطورة الخفيفة.' : '* Code 305 specifies 60-90 mins for commercial/public buildings.'}
              </span>
            </div>
          </div>

          {/* Results Column with Diagrams */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #0284c7', borderRight: isAr ? '4px solid #0284c7' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'معدل التدفق الكلي' : 'Total Flow Rate'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                  {tankPumpResults.totalFlowGpm} <span style={{ fontSize: '0.75rem' }}>GPM</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({tankPumpResults.totalFlowLpm} L/min)</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #16a34a', borderRight: isAr ? '4px solid #16a34a' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'سعة الخزان الصافية' : 'Tank Net Volume'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                  {tankPumpResults.totalVolumeM3} <span style={{ fontSize: '0.8rem' }}>م³</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({tankPumpResults.totalVolumeGallons.toLocaleString()} Gallons)</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #dc2626', borderRight: isAr ? '4px solid #dc2626' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'قدرة الطلمبة الرئيسية' : 'Primary Pump HP'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>
                  {tankPumpResults.pumpHP} <span style={{ fontSize: '0.75rem' }}>HP</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({tankPumpResults.pumpKw} kW @ {tankPumpResults.totalHeadBar} Bar)</span>
              </div>
            </div>

            {/* Interactive Tank & Triplex Pump SVG Diagram */}
            <div className="card" style={{ padding: '16px', background: '#ffffff', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  📐 {isAr ? 'المخطط الهندسي التفاعلي للخزان ومجموعة الطلمبات الثلاثية' : 'Fire Tank & Triplex Pump Set Schematic'}
                </h3>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  كود ٣٠٥/٢ - الباب الثالث
                </span>
              </div>

              <div style={{ width: '100%', height: '240px', background: '#090d16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <svg viewBox="0 0 540 230" style={{ width: '100%', height: '100%' }}>
                  {/* Concrete Tank Box */}
                  <rect x="20" y="30" width="180" height="170" fill="#1e293b" stroke="#64748b" strokeWidth="3" rx="4" />
                  
                  {/* Water Fill with Animated Gradient */}
                  <defs>
                    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>
                  <rect x="25" y="65" width="170" height="130" fill="url(#waterGrad)" rx="2" />
                  
                  {/* Water Surface Wave / Label */}
                  <line x1="25" y1="65" x2="195" y2="65" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="110" y="55" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {tankPumpResults.totalVolumeM3} م³ (عمق فعال {tankPumpResults.effectiveDepth}م)
                  </text>
                  <text x="110" y="130" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" opacity="0.9">
                    خزان مياه الحريق المعتمد
                  </text>
                  <text x="110" y="150" fill="#e0f2fe" fontSize="10" textAnchor="middle">
                    {tankPumpResults.tankLength}م × {tankPumpResults.tankWidth}م
                  </text>

                  {/* Suction Pipe line */}
                  <path d="M 180,165 L 240,165 L 240,120 L 280,120" fill="none" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="210" cy="165" r="5" fill="#f59e0b" />
                  <text x="210" y="185" fill="#cbd5e1" fontSize="9" textAnchor="middle">OS&Y Valve</text>

                  {/* Three Pumps: Electric, Diesel, Jockey */}
                  {/* 1. Electric Pump */}
                  <g transform="translate(290, 60)">
                    <rect x="0" y="0" width="65" height="35" rx="4" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                    <text x="32" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">طلمبة كهرباء</text>
                    <text x="32" y="28" fill="#93c5fd" fontSize="8" textAnchor="middle">{tankPumpResults.pumpHP} HP</text>
                  </g>

                  {/* 2. Diesel Pump */}
                  <g transform="translate(290, 105)">
                    <rect x="0" y="0" width="65" height="35" rx="4" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
                    <text x="32" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">طلمبة ديزل</text>
                    <text x="32" y="28" fill="#fca5a5" fontSize="8" textAnchor="middle">{tankPumpResults.pumpHP} HP</text>
                  </g>

                  {/* 3. Jockey Pump */}
                  <g transform="translate(290, 150)">
                    <rect x="0" y="0" width="65" height="28" rx="4" fill="#14532d" stroke="#4ade80" strokeWidth="1.5" />
                    <text x="32" y="14" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">طلمبة جوكي</text>
                    <text x="32" y="24" fill="#86efac" fontSize="7" textAnchor="middle">{tankPumpResults.jockeyHP} HP</text>
                  </g>

                  {/* Discharge Manifold Header */}
                  <path d="M 355,77 L 410,77 L 410,120 L 470,120" fill="none" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 355,122 L 410,122" fill="none" stroke="#dc2626" strokeWidth="6" />
                  <path d="M 355,164 L 410,164 L 410,120" fill="none" stroke="#dc2626" strokeWidth="4" />

                  {/* Discharge Check Valves & Gauge */}
                  <circle cx="380" cy="77" r="4" fill="#22c55e" />
                  <circle cx="380" cy="122" r="4" fill="#22c55e" />
                  <circle cx="440" cy="120" r="7" fill="#f59e0b" />
                  <text x="440" y="105" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {tankPumpResults.totalHeadBar} Bar
                  </text>

                  {/* Outflow Arrow to Building Sprinklers & Standpipes */}
                  <polygon points="480,120 465,114 465,126" fill="#dc2626" />
                  <text x="500" y="124" fill="#ffffff" fontSize="10" fontWeight="bold">
                    إلى الشبكة
                  </text>
                </svg>
              </div>

              {/* Pump Set Specification Summary */}
              <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  📋 {isAr ? 'الاعتمادات الكودية لمجموعة الطلمبات (NFPA 20 & كود ٣٠٥/٢):' : 'Code Compliance Specifications:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#334155' }}>
                  <div>• طلمبة كهربائية رئيسية: {tankPumpResults.totalFlowGpm} GPM @ {tankPumpResults.totalHeadBar} بار ({tankPumpResults.pumpHP} حصان).</div>
                  <div>• طلمبة ديزل احتياطية كاملة: {tankPumpResults.totalFlowGpm} GPM مع خزان وقود يكفي ٨ ساعات ({tankPumpResults.dieselFuelGallons} جالون).</div>
                  <div>• طلمبة جوكي للحفاظ على ضغط الشبكة: {tankPumpResults.jockeyGpm} GPM بقدرة {tankPumpResults.jockeyHP} حصان.</div>
                  <div>• محابس سحب مراقبة (Tamper Switches) متصلة بلوحة الإنذار الرئيسية.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: EGRESS & STAIR SIZING CALCULATOR */}
      {/* ========================================================= */}
      {activeCalc === 'egress_stairs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.25fr)', gap: '20px' }}>
          {/* Inputs Column */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <Layers size={18} color="#dc2626" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isAr ? 'معطيات حمولة الإشغال ومسالك الهروب' : 'Occupant Load & Egress Inputs'}
              </h2>
            </div>

            {/* Occupant Load Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isAr ? 'حمولة الإشغال بالدور الأكثر كثافة (شخص):' : 'Occupant Load on Critical Floor:'}</span>
                <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1rem' }}>{occupantLoad} {isAr ? 'شخص' : 'persons'}</span>
              </div>
              <input 
                type="number" 
                value={occupantLoad}
                onChange={(e) => setOccupantLoad(Math.max(1, Number(e.target.value)))}
                min={10}
                max={5000}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
              />
            </div>

            {/* Occupancy Type Selection */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'نوع الإشغال (طبقاً لجدول ٢-١):' : 'Occupancy Classification:'}
              </label>
              <select 
                value={occupancyType} 
                onChange={(e) => setOccupancyType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#ffffff', fontFamily: 'inherit' }}
              >
                <option value="commercial">{isAr ? 'تجاري وإداري (Commercial & Business) - الحد الأدنى ١٫١٠م أو ١٫٢٠م' : 'Commercial & Business'}</option>
                <option value="residential">{isAr ? 'سكني (Residential) - الحد الأدنى ٠٫٩٠م أو ١٫١٠م' : 'Residential'}</option>
                <option value="assembly">{isAr ? 'صالات تجمعات ودور مناسبات (Assembly)' : 'Assembly'}</option>
                <option value="educational">{isAr ? 'تعليمي ومدارس (Educational)' : 'Educational'}</option>
                <option value="healthcare">{isAr ? 'رعاية صحية ومستشفيات (Healthcare - الحد الأدنى ١٫٨٠م للأسرة)' : 'Healthcare & Hospitals (Min 1.80m)'}</option>
              </select>
            </div>

            {/* Number of Stairs */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'عدد سلالم الهروب المتوفرة بالدور:' : 'Available Exit Stairways:'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumStairs(n)}
                    style={{
                      background: numStairs === n ? '#0f172a' : '#f1f5f9',
                      color: numStairs === n ? '#ffffff' : '#334155',
                      border: numStairs === n ? '1px solid #0f172a' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {n} {isAr ? 'سلالم' : 'stairs'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {isAr ? '* الكود المصري يلزم بمخرجين منفصلين ومحميين كحد أدنى لأي حمولة تتجاوز ٥٠ شخص.' : '* Min 2 remote exits required for occupant load > 50.'}
              </span>
            </div>

            {/* Sprinkler Factor Toggle */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={stairsProtectedWithSprinklers} 
                  onChange={(e) => setStairsProtectedWithSprinklers(e.target.checked)} 
                  style={{ accentColor: '#dc2626', marginTop: '2px' }}
                />
                <div>
                  <strong style={{ color: '#0f172a' }}>{isAr ? 'المبنى محمي بشبكة رشاشات مائية ونظام إنذار صوتي معتمد' : 'Protected by Automatic Sprinklers & Voice Alarm'}</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {isAr 
                      ? 'يمنح الكود المصري ميزة تخفيف عرض السلم إلى ٥٫٠ مم/شخص (بدلاً من ٧٫٦ مم/شخص بدون رشاشات).'
                      : 'Allows factor reduction to 5.0 mm/person instead of 7.6 mm/person.'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Results Column with Architectural Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #16a34a', borderRight: isAr ? '4px solid #16a34a' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'عرض السلم الصافي المعتمد' : 'Required Stair Width'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                  {egressResults.finalStairWidthMeters} <span style={{ fontSize: '0.8rem' }}>متر</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({egressResults.finalStairWidthMm} مليمتر)</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #f59e0b', borderRight: isAr ? '4px solid #f59e0b' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'الحد الأدنى الكودي' : 'Code Min Width'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                  {(egressResults.minCodeWidthMm / 1000).toFixed(2)} <span style={{ fontSize: '0.8rem' }}>متر</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({egressResults.minCodeWidthMm} مم إلزامي)</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #2563eb', borderRight: isAr ? '4px solid #2563eb' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'عرض الممرات والأبواب' : 'Corridor/Door Width'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                  {egressResults.finalCorridorWidthMeters} <span style={{ fontSize: '0.8rem' }}>متر</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({egressResults.finalCorridorWidthMm} مليمتر)</span>
              </div>
            </div>

            {/* Interactive Architectural Stair Section Diagram */}
            <div className="card" style={{ padding: '16px', background: '#ffffff', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  📐 {isAr ? 'القطاع المعماري المعتمد للسلم ومسلك الهروب' : 'Architectural Stair Section & Egress Plan'}
                </h3>
                <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  كود ٣٠٥/١ - الباب الثالث
                </span>
              </div>

              <div style={{ width: '100%', height: '240px', background: '#090d16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <svg viewBox="0 0 540 230" style={{ width: '100%', height: '100%' }}>
                  {/* Fire Protected Enclosure Wall */}
                  <rect x="30" y="25" width="480" height="180" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 3" rx="4" />
                  <text x="50" y="45" fill="#fca5a5" fontSize="10" fontWeight="bold">
                    بئر سلم محمي مقاوم للحريق (ساعتين) - 2-Hr Fire Rated Shaft
                  </text>

                  {/* Stair Landing 1 */}
                  <rect x="50" y="60" width="100" height="130" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="100" y="125" fill="#cbd5e1" fontSize="10" fontWeight="bold" textAnchor="middle">
                    بسطة السلم (Landing)
                  </text>
                  <text x="100" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    عرض ≥ {egressResults.finalStairWidthMeters}م
                  </text>

                  {/* Stair Flights (Steps) */}
                  <g transform="translate(150, 60)">
                    {/* Flight 1 Steps */}
                    {[0, 1, 2, 3, 4, 5, 6].map((st) => (
                      <rect 
                        key={st}
                        x={st * 28} 
                        y={0} 
                        width={28} 
                        height={55} 
                        fill={st % 2 === 0 ? "#334155" : "#1e293b"} 
                        stroke="#475569" 
                        strokeWidth="1" 
                      />
                    ))}
                    {/* Handrail line */}
                    <line x1="0" y1="55" x2="196" y2="55" stroke="#f59e0b" strokeWidth="3" />
                    <text x="98" y="32" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      قلبة السلم (Flight Width = {egressResults.finalStairWidthMeters}م)
                    </text>

                    {/* Flight 2 Steps */}
                    {[0, 1, 2, 3, 4, 5, 6].map((st) => (
                      <rect 
                        key={`b-${st}`}
                        x={st * 28} 
                        y={75} 
                        width={28} 
                        height={55} 
                        fill={st % 2 === 0 ? "#1e293b" : "#334155"} 
                        stroke="#475569" 
                        strokeWidth="1" 
                      />
                    ))}
                    <line x1="0" y1="75" x2="196" y2="75" stroke="#f59e0b" strokeWidth="3" />
                    <text x="98" y="108" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      القلبة العائدة ({egressResults.finalStairWidthMeters}م)
                    </text>
                  </g>

                  {/* Half Landing (Middle) */}
                  <rect x="346" y="60" width="90" height="130" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="391" y="125" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
                    بسطة متوسطة
                  </text>

                  {/* Fire Exit Door (with panic hardware swing) */}
                  <g transform="translate(436, 110)">
                    <rect x="0" y="0" width="12" height="70" fill="#dc2626" rx="2" />
                    {/* Door Swing Arc */}
                    <path d="M 12,70 A 50,50 0 0,0 60,30" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 2" />
                    <line x1="12" y1="70" x2="50" y2="30" stroke="#22c55e" strokeWidth="2.5" />
                    <text x="40" y="20" fill="#4ade80" fontSize="9" fontWeight="bold">
                      باب هروب يفتح للخارج
                    </text>
                    <text x="40" y="85" fill="#fca5a5" fontSize="8">
                      كالون ذعر (Panic Bar)
                    </text>
                  </g>
                </svg>
              </div>

              {/* Step & Riser Specification Summary */}
              <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  📋 {isAr ? 'الاشتراطات الهندسية المعتمدة لقطاع السلم (كود ٣٠٥/١):' : 'Stairway Engineering Provisions:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#334155' }}>
                  <div>• العرض الصافي المعتمد للدرج: {egressResults.finalStairWidthMeters}م (بين الحوائط والدرابزين).</div>
                  <div>• أبعاد الدرجة: القائمة {egressResults.riserHeightCm} سم (الحد الأقصى ١٨ سم) × النائمة {egressResults.treadDepthCm} سم (الحد الأدنى ٢٧ سم).</div>
                  <div>• عرض البسطات (Landings) لا يقل بأي حال عن عرض السلم المطلوب ({egressResults.finalStairWidthMeters}م).</div>
                  <div>• باب الهروب مزود بغالق هيدروليكي ذاتي الإغلاق (Self-Closing) ومقاوم للحريق ساعتين.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STAIRWELL PRESSURIZATION & SMOKE CONTROL */}
      {/* ========================================================= */}
      {activeCalc === 'smoke_pressurization' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.25fr)', gap: '20px' }}>
          {/* Inputs Column */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <Wind size={18} color="#dc2626" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {isAr ? 'معطيات ضغط السلالم وسحب الدخان' : 'Pressurization & Smoke Inputs'}
              </h2>
            </div>

            {/* Stories & Height */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'عدد طوابق المبنى:' : 'Stories:'}
                </label>
                <input 
                  type="number" 
                  value={numStories}
                  onChange={(e) => setNumStories(Math.max(2, Number(e.target.value)))}
                  min={2}
                  max={60}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'ارتفاع الطابق (م):' : 'Floor Height (m):'}
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={storyHeightMeters}
                  onChange={(e) => setStoryHeightMeters(Number(e.target.value))}
                  min={2.7}
                  max={6.0}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>
            </div>

            {/* Number of Design Open Doors */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{isAr ? 'عدد الأبواب المفتوحة التصميمية أثناء الإخلاء:' : 'Design Open Doors:'}</span>
                <span style={{ fontWeight: 800, color: '#dc2626' }}>{numOpenDoors} {isAr ? 'أبواب' : 'doors'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNumOpenDoors(d)}
                    style={{
                      background: numOpenDoors === d ? '#0f172a' : '#f1f5f9',
                      color: numOpenDoors === d ? '#ffffff' : '#334155',
                      border: numOpenDoors === d ? '1px solid #0f172a' : '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {d} {isAr ? (d === 1 ? 'باب' : (d === 2 ? 'بابين' : 'أبواب')) : 'Doors'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {isAr ? '* الكود المصري يفترض بابين مفتوحين (باب الطابق المحترق + باب الخروج النهائي بالأرضي).' : '* Code assumes 2 open doors during peak evacuation.'}
              </span>
            </div>

            {/* Door Dimensions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'عرض الباب (م):' : 'Door Width (m):'}
                </label>
                <input 
                  type="number" 
                  step="0.05"
                  value={doorWidthMeters}
                  onChange={(e) => setDoorWidthMeters(Number(e.target.value))}
                  min={0.9}
                  max={2.4}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'ارتفاع الباب (م):' : 'Door Height (m):'}
                </label>
                <input 
                  type="number" 
                  step="0.05"
                  value={doorHeightMeters}
                  onChange={(e) => setDoorHeightMeters(Number(e.target.value))}
                  min={1.9}
                  max={2.8}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>
            </div>

            {/* Air Injection System Type */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {isAr ? 'طريقة حقن الهواء في بئر السلم:' : 'Air Injection System:'}
              </label>
              <select 
                value={injectionType} 
                onChange={(e) => setInjectionType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#ffffff', fontFamily: 'inherit' }}
              >
                <option value="multiple">{isAr ? 'حقن متعدد عبر مجرى رأسي (موصى به للمباني > ٤ أدوار)' : 'Multiple Injection (Recommended > 4 floors)'}</option>
                <option value="single">{isAr ? 'حقن نقطي مباشر في أعلى أو أسفل السلم (للمباني الصغيرة ≤ ٤ أدوار)' : 'Single Injection (Small buildings ≤ 4 floors)'}</option>
              </select>
            </div>

            {/* Dedicated Basement Garage Floor Area Input */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                {isAr ? 'مسطح بدروم الجراج لسحب الدخان (م²):' : 'Basement Garage Floor Area (m²):'}
              </label>
              <input 
                type="number" 
                value={basementArea}
                onChange={(e) => setBasementArea(Math.max(50, Number(e.target.value) || 0))}
                min={50}
                max={50000}
                step={50}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {isAr ? '* الكود المصري يشترط ١٠ مرات تغيير هواء/ساعة لجراجات السيارات مع استقلالية تامة عن حسابات الخزان.' : '* 10 ACH exhaust required by Code 305/2, calculated independently from tank area.'}
              </span>
            </div>

            {/* Single injection warning if height > 15m */}
            {smokeResults.singleInjectionWarning && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.78rem', color: '#991b1b', lineHeight: 1.5 }}>
                ⚠️ <strong>{isAr ? 'تنبيه كودي (كود ٣٠٥/١ و ٣٠٥/٣): ' : 'Code Advisory: '}</strong>
                {isAr 
                  ? `ارتفاع السلم الإجمالي (${smokeResults.totalStairHeight} م) يتجاوز ١٥ متراً. يُلزم الكود باستخدام نظام الحقن المتعدد (Multiple Injection) لتفادي اختلال توزيع الضغط وانهياره بالأدوار العليا.`
                  : `Stair height (${smokeResults.totalStairHeight}m) exceeds 15m. Multiple injection points required by code to prevent pressure drop on upper floors.`}
              </div>
            )}
          </div>

          {/* Results Column with Pressurization Schematic */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #16a34a', borderRight: isAr ? '4px solid #16a34a' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'فرق الضغط الكودي' : 'Design Pressure Delta'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>
                  {smokeResults.designDeltaP} <span style={{ fontSize: '0.8rem' }}>Pa (باسكال)</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({isAr ? 'قوة الدفع ≤ ١٣٣ نيوتن' : 'Door force ≤ 133 N'})</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #0284c7', borderRight: isAr ? '4px solid #0284c7' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'سعة مروحة ضغط السلم' : 'Pressurization Fan'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                  {smokeResults.totalFanCapacityCfm.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>CFM</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({smokeResults.totalFanCapacityM3h.toLocaleString()} m³/h)</span>
              </div>

              <div className="card" style={{ padding: '14px', borderLeft: isAr ? 'none' : '4px solid #7c3aed', borderRight: isAr ? '4px solid #7c3aed' : 'none' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{isAr ? 'قدرة محرك المروحة' : 'Fan Motor Power'}</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
                  {smokeResults.fanMotorHP} <span style={{ fontSize: '0.75rem' }}>HP</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({smokeResults.fanMotorKw} kW @ {smokeResults.fanStaticPressurePa} Pa)</span>
              </div>
            </div>

            {/* Interactive Pressurization Shaft SVG Diagram */}
            <div className="card" style={{ padding: '16px', background: '#ffffff', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  📐 {isAr ? 'المخطط الهندسي التفاعلي لمنظومة ضغط السلم وسحب الدخان' : 'Stairwell Pressurization System Schematic'}
                </h3>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  كود ٣٠٥/٣ ص ٤-١٨
                </span>
              </div>

              <div style={{ width: '100%', height: '240px', background: '#090d16', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                <svg viewBox="0 0 540 230" style={{ width: '100%', height: '100%' }}>
                  {/* Building Outline */}
                  <rect x="50" y="40" width="440" height="175" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  
                  {/* Rooftop Fan Unit */}
                  <g transform="translate(180, 8)">
                    <rect x="0" y="0" width="75" height="32" rx="4" fill="#dc2626" stroke="#f87171" strokeWidth="1.5" />
                    <circle cx="20" cy="16" r="10" fill="#ffffff" opacity="0.2" />
                    <text x="48" y="16" fill="#ffffff" fontSize="9" fontWeight="bold">مروحة الضغط</text>
                    <text x="48" y="27" fill="#fed7aa" fontSize="8">{smokeResults.totalFanCapacityCfm.toLocaleString()} CFM</text>
                  </g>

                  {/* Vertical Air Duct */}
                  <rect x="195" y="40" width="22" height="165" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                  
                  {/* Air Injection Grilles */}
                  {[60, 110, 160].map((yPos, i) => (
                    <g key={i}>
                      <line x1="217" y1={yPos} x2="245" y2={yPos} stroke="#38bdf8" strokeWidth="4" />
                      <polygon points={`250,${yPos} 242,${yPos - 4} 242,${yPos + 4}`} fill="#38bdf8" />
                    </g>
                  ))}

                  {/* Protected Stairwell Shaft */}
                  <rect x="230" y="40" width="130" height="175" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="295" y="55" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    بئر السلم المضغوط (+50 Pa)
                  </text>

                  {/* Differential Pressure Sensor Box */}
                  <g transform="translate(245, 95)">
                    <rect x="0" y="0" width="55" height="24" rx="4" fill="#15803d" />
                    <text x="27" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      حساس 50 Pa
                    </text>
                  </g>

                  {/* Open Egress Door with Airflow Vector */}
                  <g transform="translate(360, 140)">
                    <rect x="0" y="0" width="8" height="65" fill="#22c55e" />
                    {/* Airflow arrows escaping through door */}
                    <path d="M 12,25 L 50,25" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow)" />
                    <polygon points="55,25 46,21 46,29" fill="#38bdf8" />
                    <text x="60" y="28" fill="#4ade80" fontSize="10" fontWeight="bold">
                      سرعة الهواء ١٫٠ م/ث
                    </text>
                    <text x="60" y="42" fill="#cbd5e1" fontSize="8">
                      (لمنع تسرب الدخان للداخل)
                    </text>
                  </g>

                  {/* Smoke Layer Outside in Corridor */}
                  <rect x="380" y="40" width="105" height="85" fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeDasharray="3 3" />
                  <text x="432" y="65" fill="#fdba74" fontSize="10" fontWeight="bold" textAnchor="middle">
                    منطقة الدخان (الحريق)
                  </text>
                  <text x="432" y="80" fill="#fed7aa" fontSize="8" textAnchor="middle">
                    سحب الدخان: {smokeResults.smokeExhaustCfm.toLocaleString()} CFM
                  </text>
                </svg>
              </div>

              {/* Smoke Control Specification Summary */}
              <div style={{ marginTop: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  📋 {isAr ? 'الاشتراطات الكودية لمنظومة الضغط وسحب الدخان (كود ٣٠٥/٣):' : 'Pressurization & Smoke Extraction Provisions:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#334155' }}>
                  <div>• فرق الضغط التصميمي الإلزامي ٥٠ باسكال مع إغلاق الأبواب (ولا تتجاوز قوة فتح الباب ١٣٣ نيوتن).</div>
                  <div>• سرعة تدفق الهواء عبر الأبواب المفتوحة ١٫٠ م/ث لمنع ارتداد الغازات السامة لبئر الهروب.</div>
                  <div>• ربط مروحة الضغط بنظام إنذار الحريق للعمل تلقائياً فور تحسس أول كاشف دخان بالمبنى.</div>
                  <div>• سحب دخان الجراج التلقائي بمعدل ١٠ مرات تغيير هواء في الساعة (ACH) بمراوح مقاومة لحرارة ٤٠٠°م لمدة ساعتين.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
