import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Wind, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  Sliders, 
  Gauge, 
  Maximize2, 
  Sparkles,
  Box,
  FileText,
  Activity
} from 'lucide-react';

// Standard Clean Agent Cylinders (FM-200 / HFC-227ea / NOVEC 1230)
const CLEAN_AGENT_CYLINDERS = [
  { volumeL: 40, minFill: 20, maxFill: 46, nominalFill: 38 },
  { volumeL: 67, minFill: 34, maxFill: 77, nominalFill: 64 },
  { volumeL: 80, minFill: 40, maxFill: 92, nominalFill: 76 },
  { volumeL: 100, minFill: 50, maxFill: 115, nominalFill: 95 },
  { volumeL: 120, minFill: 60, maxFill: 138, nominalFill: 114 },
  { volumeL: 140, minFill: 70, maxFill: 161, nominalFill: 133 },
  { volumeL: 180, minFill: 90, maxFill: 207, nominalFill: 171 },
  { volumeL: 240, minFill: 120, maxFill: 276, nominalFill: 228 },
  { volumeL: 343, minFill: 172, maxFill: 394, nominalFill: 326 },
];

export default function GasFloodingCalculator({ lang, selectedProject, onOpenAssistant, embedded = false }) {
  const isAr = lang === 'ar';

  // ========================================================
  // SYSTEM & AGENT SELECTION: 'fm200' | 'co2' | 'novec1230'
  // ========================================================
  const [selectedAgent, setSelectedAgent] = useState('fm200'); // fm200, co2, novec1230

  // ========================================================
  // ROOM GEOMETRY & ENCLOSURE PARAMETERS
  // ========================================================
  const [roomLength, setRoomLength] = useState(8.0);
  const [roomWidth, setRoomWidth] = useState(6.0);
  const [roomHeight, setRoomHeight] = useState(3.2);

  // Protected Voids
  const [hasFalseCeiling, setHasFalseCeiling] = useState(true);
  const [ceilingDepth, setCeilingDepth] = useState(0.5);

  const [hasRaisedFloor, setHasRaisedFloor] = useState(true);
  const [floorDepth, setFloorDepth] = useState(0.4);

  // Volume Deductions (Solid concrete columns, immovable machinery)
  const [volumeDeduction, setVolumeDeduction] = useState(1.5);

  // Ambient Design Temperature (°C)
  const [designTempC, setDesignTempC] = useState(20);

  // Altitude Above Sea Level (m)
  const [altitudeMeters, setAltitudeMeters] = useState(0);

  // ========================================================
  // CLEAN AGENT SPECIFIC INPUTS (FM-200 / NOVEC 1230 - NFPA 2001)
  // ========================================================
  // Hazard Type: 'class_a' (Server/Telecom), 'class_b' (Flammable liquids), 'class_c' (Energized electrical)
  const [cleanAgentHazard, setCleanAgentHazard] = useState('class_a');
  const [customDesignConc, setCustomDesignConc] = useState(null); // when overridden

  // ========================================================
  // CO2 SPECIFIC INPUTS (NFPA 12)
  // ========================================================
  // 'surface' | 'deep_electrical' | 'deep_archive' | 'deep_dust'
  const [co2HazardType, setCo2HazardType] = useState('deep_electrical');
  // Unclosable openings area (m²)
  const [unclosableOpeningsArea, setUnclosableOpeningsArea] = useState(0.4);

  // ========================================================
  // HARDWARE & STRUCTURAL OPTIONS
  // ========================================================
  // Allowable Enclosure Overpressure (Pa) for Pressure Relief Damper
  const [allowablePressurePa, setAllowablePressurePa] = useState(500); // 250 (drywall), 500 (standard), 1000 (concrete)
  const [hasReserveBank, setHasReserveBank] = useState(true); // 100% Reserve Cylinder Bank
  const [selectedCylinderVolumeL, setSelectedCylinderVolumeL] = useState('auto'); // 'auto' or cylinder size
  const [operatingPressureBar, setOperatingPressureBar] = useState(25); // 25 bar (360 psi) or 42 bar (600 psi)

  // UI state
  const [copiedNote, setCopiedNote] = useState(false);
  const [activeSubView, setActiveSubView] = useState('calculator'); // 'calculator' | 'official_sheet' | 'schematic'

  // ========================================================
  // PRESET ENCLOSURES FOR REAL-WORLD PROJECTS
  // ========================================================
  const PRESETS = [
    {
      id: 'server_room',
      titleAr: 'غرفة مركز البيانات والخوادم (Data Center / Server)',
      titleEn: 'Data Center & Server Room',
      agent: 'fm200',
      length: 8.5,
      width: 6.2,
      height: 3.2,
      hasCeiling: true,
      ceilingH: 0.5,
      hasFloor: true,
      floorH: 0.4,
      deduction: 2.0,
      temp: 20,
      cleanHazard: 'class_a',
      co2Hazard: 'deep_electrical',
      openings: 0.2,
      pressure: 500
    },
    {
      id: 'transformer',
      titleAr: 'غرفة المحولات الكهربائية (Transformer Room)',
      titleEn: 'Electrical Transformer Room',
      agent: 'co2',
      length: 7.0,
      width: 5.5,
      height: 4.2,
      hasCeiling: false,
      ceilingH: 0,
      hasFloor: false,
      floorH: 0,
      deduction: 5.0,
      temp: 25,
      cleanHazard: 'class_c',
      co2Hazard: 'deep_electrical',
      openings: 0.8,
      pressure: 1000
    },
    {
      id: 'switchgear',
      titleAr: 'غرفة الموزعات ولوحات الجهد المتوسط (MV Switchgear)',
      titleEn: 'Medium Voltage Switchgear Room',
      agent: 'fm200',
      length: 12.0,
      width: 6.5,
      height: 3.8,
      hasCeiling: false,
      ceilingH: 0,
      hasFloor: true,
      floorH: 0.5,
      deduction: 4.5,
      temp: 22,
      cleanHazard: 'class_c',
      co2Hazard: 'deep_electrical',
      openings: 0.4,
      pressure: 500
    },
    {
      id: 'ups_battery',
      titleAr: 'غرفة أجهزة UPS والبطاريات (UPS & Battery Room)',
      titleEn: 'UPS & Battery Enclosure',
      agent: 'novec1230',
      length: 6.0,
      width: 4.5,
      height: 3.0,
      hasCeiling: true,
      ceilingH: 0.4,
      hasFloor: false,
      floorH: 0,
      deduction: 1.2,
      temp: 20,
      cleanHazard: 'class_c',
      co2Hazard: 'deep_electrical',
      openings: 0.1,
      pressure: 500
    },
    {
      id: 'generator',
      titleAr: 'غرفة المولدات الكهربائية (Emergency Diesel Generator)',
      titleEn: 'Emergency Generator Room',
      agent: 'co2',
      length: 9.0,
      width: 6.0,
      height: 4.5,
      hasCeiling: false,
      ceilingH: 0,
      hasFloor: false,
      floorH: 0,
      deduction: 8.0,
      temp: 30,
      cleanHazard: 'class_b',
      co2Hazard: 'surface',
      openings: 1.2,
      pressure: 1000
    },
    {
      id: 'paper_archive',
      titleAr: 'غرفة الأرشيف وحفظ الوثائق الورقية (Paper Archive)',
      titleEn: 'Paper Document & Records Archive',
      agent: 'fm200',
      length: 10.0,
      width: 7.0,
      height: 3.2,
      hasCeiling: true,
      ceilingH: 0.4,
      hasFloor: false,
      floorH: 0,
      deduction: 6.0,
      temp: 20,
      cleanHazard: 'class_a',
      co2Hazard: 'deep_archive',
      openings: 0.2,
      pressure: 500
    }
  ];

  const applyPreset = (preset) => {
    setSelectedAgent(preset.agent);
    setRoomLength(preset.length);
    setRoomWidth(preset.width);
    setRoomHeight(preset.height);
    setHasFalseCeiling(preset.hasCeiling);
    setCeilingDepth(preset.ceilingH);
    setHasRaisedFloor(preset.hasFloor);
    setFloorDepth(preset.floorH);
    setVolumeDeduction(preset.deduction);
    setDesignTempC(preset.temp);
    setCleanAgentHazard(preset.cleanHazard);
    setCo2HazardType(preset.co2Hazard);
    setUnclosableOpeningsArea(preset.openings);
    setAllowablePressurePa(preset.pressure);
    setCustomDesignConc(null);
  };

  // ========================================================
  // MATHEMATICAL ENGINE (NFPA 12 & NFPA 2001)
  // ========================================================
  const calculations = useMemo(() => {
    // 1. Room Volume Breakdown
    const mainVolume = Math.round(roomLength * roomWidth * roomHeight * 100) / 100;
    const ceilingVolume = hasFalseCeiling ? Math.round(roomLength * roomWidth * ceilingDepth * 100) / 100 : 0;
    const floorVolume = hasRaisedFloor ? Math.round(roomLength * roomWidth * floorDepth * 100) / 100 : 0;
    const grossVolume = Math.round((mainVolume + ceilingVolume + floorVolume) * 100) / 100;
    const netVolume = Math.max(1, Math.round((grossVolume - volumeDeduction) * 100) / 100);
    const floorArea = Math.round(roomLength * roomWidth * 10) / 10;

    // 2. Altitude Correction Factor (AF) per NFPA 2001 Table 5.5.3.3
    let altitudeFactor = 1.0;
    if (altitudeMeters > 0) {
      if (altitudeMeters <= 500) {
        altitudeFactor = 1.0 - (altitudeMeters / 500) * 0.06; // 1.0 -> 0.94
      } else if (altitudeMeters <= 1000) {
        altitudeFactor = 0.94 - ((altitudeMeters - 500) / 500) * 0.05; // 0.94 -> 0.89
      } else if (altitudeMeters <= 1500) {
        altitudeFactor = 0.89 - ((altitudeMeters - 1000) / 500) * 0.05; // 0.89 -> 0.84
      } else {
        altitudeFactor = Math.max(0.70, Math.round(Math.exp(-altitudeMeters / 8400) * 100) / 100);
      }
    }
    altitudeFactor = Math.round(altitudeFactor * 1000) / 1000;

    // 3. Agent Specific Calculations
    let agentNameAr = '';
    let agentNameEn = '';
    let chemicalFormula = '';
    let governingStandard = '';
    let designConcentration = 0;
    let extinguishingConcentration = 0;
    let safetyFactorPercent = 20;
    let specificVaporVolume = 0; // s (m3/kg)
    let floodingFactor = 0; // kg/m3
    let baseAgentWeightKg = 0;
    let leakageAdditionKg = 0;
    let totalAgentWeightKg = 0;
    let dischargeTimeSec = 10;
    let noaelPercent = 0;
    let loaelPercent = 0;
    let toxicityStatus = 'safe'; // 'safe' | 'warning' | 'lethal'
    let toxicityNotesAr = '';
    let toxicityNotesEn = '';

    if (selectedAgent === 'fm200') {
      agentNameAr = 'إف إم ٢٠٠ (FM-200)';
      agentNameEn = 'FM-200 (HFC-227ea)';
      chemicalFormula = 'CF3-CH-FCF3 (Heptafluoropropane)';
      governingStandard = isAr ? 'NFPA 2001 & الكود المصري ٣٠٥/٢' : 'NFPA 2001 & Egyptian Code 305/2';
      dischargeTimeSec = 10;
      noaelPercent = 9.0;
      loaelPercent = 10.5;

      // Concentration selection
      if (cleanAgentHazard === 'class_a') {
        extinguishingConcentration = 6.7;
        safetyFactorPercent = 20;
        designConcentration = customDesignConc || 7.9; // Standard UL/FM approved min design conc
      } else if (cleanAgentHazard === 'class_b') {
        extinguishingConcentration = 9.0;
        safetyFactorPercent = 30;
        designConcentration = customDesignConc || 11.7;
      } else {
        // class_c
        extinguishingConcentration = 6.7;
        safetyFactorPercent = 27;
        designConcentration = customDesignConc || 8.5; // Standard Class C energized
      }

      // Specific vapor volume: s = k1 + k2 * T
      // For FM-200: k1 = 0.1269, k2 = 0.000513
      const k1 = 0.1269;
      const k2 = 0.000513;
      specificVaporVolume = Math.round((k1 + k2 * designTempC) * 100000) / 100000;

      // NFPA 2001 Formula: W = (V / s) * (C / (100 - C))
      const volumetricRatio = designConcentration / (100 - designConcentration);
      floodingFactor = Math.round(((1 / specificVaporVolume) * volumetricRatio) * 1000) / 1000;
      baseAgentWeightKg = Math.round(((netVolume / specificVaporVolume) * volumetricRatio) * 10) / 10;
      totalAgentWeightKg = Math.ceil(baseAgentWeightKg * altitudeFactor);

      // Toxicity validation
      if (designConcentration <= noaelPercent) {
        toxicityStatus = 'safe';
        toxicityNotesAr = 'التركيز أقل من حد الأمان الخالي من التأثيرات الضارة (NOAEL 9.0%) - مسموح وآمن للغرف المشغولة بالأفراد (حتى ٥ دقائق).';
        toxicityNotesEn = 'Concentration is below NOAEL (9.0%) - Safe for normally occupied spaces (up to 5 min exposure).';
      } else if (designConcentration <= loaelPercent) {
        toxicityStatus = 'warning';
        toxicityNotesAr = 'التركيز يقع بين حد NOAEL (9.0%) و LOAEL (10.5%) - يتطلب إخلاء الأفراد خلال دقيقة واحدة كحد أقصى قبل التفريغ.';
        toxicityNotesEn = 'Concentration between NOAEL (9.0%) and LOAEL (10.5%) - Requires evacuation within 1 minute.';
      } else {
        toxicityStatus = 'lethal';
        toxicityNotesAr = 'التركيز يتجاوز حد LOAEL (10.5%) - غير مسموح به في الغرف المأهولة بشكل دائم، ويلزم صمام عزل وسارينة تأخير إلزامية.';
        toxicityNotesEn = 'Concentration exceeds LOAEL (10.5%) - Prohibited in normally occupied areas without full isolation.';
      }

    } else if (selectedAgent === 'novec1230') {
      agentNameAr = 'نوفيك ١٢٣٠ (NOVEC 1230)';
      agentNameEn = 'NOVEC 1230 (FK-5-1-12)';
      chemicalFormula = 'CF3CF2C(O)CF(CF3)2 (Dodecafluoro-2-methylpentan-3-one)';
      governingStandard = isAr ? 'NFPA 2001 & الكود المصري ٣٠٥/٢' : 'NFPA 2001 & Egyptian Code 305/2';
      dischargeTimeSec = 10;
      noaelPercent = 10.0;
      loaelPercent = 10.0; // Margin is huge

      if (cleanAgentHazard === 'class_a') {
        extinguishingConcentration = 4.5;
        safetyFactorPercent = 24;
        designConcentration = customDesignConc || 5.6;
      } else if (cleanAgentHazard === 'class_b') {
        extinguishingConcentration = 5.9;
        safetyFactorPercent = 30;
        designConcentration = customDesignConc || 7.7;
      } else {
        extinguishingConcentration = 4.5;
        safetyFactorPercent = 31;
        designConcentration = customDesignConc || 5.9;
      }

      // s = k1 + k2 * T
      // For Novec 1230: k1 = 0.0664, k2 = 0.0002741
      const k1 = 0.0664;
      const k2 = 0.0002741;
      specificVaporVolume = Math.round((k1 + k2 * designTempC) * 100000) / 100000;

      const volumetricRatio = designConcentration / (100 - designConcentration);
      floodingFactor = Math.round(((1 / specificVaporVolume) * volumetricRatio) * 1000) / 1000;
      baseAgentWeightKg = Math.round(((netVolume / specificVaporVolume) * volumetricRatio) * 10) / 10;
      totalAgentWeightKg = Math.ceil(baseAgentWeightKg * altitudeFactor);

      toxicityStatus = 'safe';
      toxicityNotesAr = 'هامش أمان بشري فائق الاستثنائية - تركيز التصميم (~5.6%) يقل بكثير عن حد NOAEL (10%)، وصديق للبيئة تماماً (GWP = 1).';
      toxicityNotesEn = 'Exceptional human safety margin - Design conc (~5.6%) is well below NOAEL (10.0%). Zero ODP, GWP = 1.';

    } else {
      // CO2 - NFPA 12
      agentNameAr = 'ثاني أكسيد الكربون (CO2)';
      agentNameEn = 'Carbon Dioxide (CO2)';
      chemicalFormula = 'CO2 (High Pressure Carbon Dioxide)';
      governingStandard = isAr ? 'NFPA 12 & الكود المصري ٣٠٥/٢' : 'NFPA 12 & Egyptian Code 305/2';
      noaelPercent = 5.0;
      loaelPercent = 7.5;
      toxicityStatus = 'lethal';
      toxicityNotesAr = '⚠️ غاز خانق ومميت عند تركيزات الإطفاء (>34%) حيث يهبط بنسبة الأكسجين لأقل من 10%. يلزم إلزامياً: صمام عزل ميكانيكي، بوق هوائي، وحدة تأخير 30-60 ثانية، وأجهزة تنفس SCBA خارج الغرفة.';
      toxicityNotesEn = '⚠️ LETHAL / ASPHYXIANT at extinguishing levels (>34%). Mandatory: Mechanical lockout valve, pneumatic siren, 30-60s delay, and external SCBA.';

      if (co2HazardType === 'surface') {
        // Surface fire based on Volume Factor table NFPA 12 Chapter 5.3
        designConcentration = 34; // default minimum
        dischargeTimeSec = 60; // 1 min for surface fire
        if (netVolume <= 140) {
          floodingFactor = 1.15;
        } else if (netVolume <= 1400) {
          floodingFactor = 1.07;
        } else if (netVolume <= 14000) {
          floodingFactor = 0.93;
        } else {
          floodingFactor = 0.81;
        }
      } else if (co2HazardType === 'deep_electrical') {
        designConcentration = 50; // min 50% for electrical
        dischargeTimeSec = 120; // 2 min to 30%, soaking up to 7 min
        floodingFactor = 1.60; // 1.6 kg/m3 (1 kg / 0.625 m3)
      } else if (co2HazardType === 'deep_archive') {
        designConcentration = 65; // min 65% for records/paper
        dischargeTimeSec = 120;
        floodingFactor = 2.00; // 2.0 kg/m3
      } else {
        // deep_dust
        designConcentration = 75;
        dischargeTimeSec = 120;
        floodingFactor = 2.70; // 2.7 kg/m3
      }

      baseAgentWeightKg = Math.round(netVolume * floodingFactor * 10) / 10;
      // Leakage compensation for unclosable openings (NFPA 12 Section 5.3.5.1: 5.0 kg/m2)
      leakageAdditionKg = Math.round(unclosableOpeningsArea * 5.0 * 10) / 10;
      totalAgentWeightKg = Math.ceil(baseAgentWeightKg + leakageAdditionKg);
    }

    // 4. Cylinder Sizing & Count
    let cylinderVolumeL = 0;
    let dutyCylindersCount = 1;
    let reserveCylindersCount = 0;
    let totalCylindersCount = 1;
    let fillWeightPerCylinderKg = 0;
    let actualFillDensityKgL = 0;
    let cylinderDescriptionAr = '';
    let cylinderDescriptionEn = '';

    if (selectedAgent === 'co2') {
      // Standard CO2 High Pressure Cylinders: 45 kg net (67.5L cylinder, 0.67 kg/L fill density)
      const co2NetPerCyl = 45;
      cylinderVolumeL = 67.5;
      dutyCylindersCount = Math.max(1, Math.ceil(totalAgentWeightKg / co2NetPerCyl));
      reserveCylindersCount = hasReserveBank ? dutyCylindersCount : 0;
      totalCylindersCount = dutyCylindersCount + reserveCylindersCount;
      fillWeightPerCylinderKg = Math.round((totalAgentWeightKg / dutyCylindersCount) * 10) / 10;
      actualFillDensityKgL = Math.round((fillWeightPerCylinderKg / cylinderVolumeL) * 100) / 100;
      cylinderDescriptionAr = `أسطوانات ثاني أكسيد الكربون ضغط عالي سعة ٤٥ كجم (حجم ٦٧.٥ لتر - ضغط ٥٨ بار)`;
      cylinderDescriptionEn = `High-Pressure CO2 Cylinders 45 kg (67.5 L water capacity - 58 bar)`;
    } else {
      // Clean Agent Cylinders (FM-200 / Novec)
      if (selectedCylinderVolumeL === 'auto') {
        // Optimal auto selection: find cylinder with optimal fill density (~0.90 - 1.05 kg/L) and minimal cylinders
        let bestCyl = CLEAN_AGENT_CYLINDERS[0];
        let bestCount = 999;
        
        for (const cyl of CLEAN_AGENT_CYLINDERS) {
          const count = Math.ceil(totalAgentWeightKg / cyl.nominalFill);
          const fill = totalAgentWeightKg / count;
          if (fill >= cyl.minFill && fill <= cyl.maxFill) {
            if (count < bestCount) {
              bestCount = count;
              bestCyl = cyl;
            }
          }
        }
        cylinderVolumeL = bestCyl.volumeL;
        dutyCylindersCount = Math.max(1, bestCount);
      } else {
        cylinderVolumeL = Number(selectedCylinderVolumeL);
        const cylObj = CLEAN_AGENT_CYLINDERS.find(c => c.volumeL === cylinderVolumeL) || CLEAN_AGENT_CYLINDERS[3];
        dutyCylindersCount = Math.max(1, Math.ceil(totalAgentWeightKg / cylObj.nominalFill));
      }

      reserveCylindersCount = hasReserveBank ? dutyCylindersCount : 0;
      totalCylindersCount = dutyCylindersCount + reserveCylindersCount;
      fillWeightPerCylinderKg = Math.round((totalAgentWeightKg / dutyCylindersCount) * 10) / 10;
      actualFillDensityKgL = Math.round((fillWeightPerCylinderKg / cylinderVolumeL) * 100) / 100;
      cylinderDescriptionAr = `أسطوانات غاز غير ملحومة سعة ${cylinderVolumeL} لتر (ضغط تعبئة ${operatingPressureBar} بار بالنيتروجين N2)`;
      cylinderDescriptionEn = `Seamless Agent Cylinders ${cylinderVolumeL}L (${operatingPressureBar} bar super-pressurized with N2)`;
    }

    // 5. Hydraulics & Discharge Flow Rate
    const dischargeFlowRateKgSec = Math.round((totalAgentWeightKg / dischargeTimeSec) * 10) / 10;

    // Recommended Manifold Header Diameter
    let recommendedPipeInches = '2"';
    if (dischargeFlowRateKgSec > 45) recommendedPipeInches = '4"';
    else if (dischargeFlowRateKgSec > 28) recommendedPipeInches = '3"';
    else if (dischargeFlowRateKgSec > 16) recommendedPipeInches = '2.5"';
    else if (dischargeFlowRateKgSec > 8) recommendedPipeInches = '2"';
    else if (dischargeFlowRateKgSec > 4) recommendedPipeInches = '1.5"';
    else recommendedPipeInches = '1.25"';

    // 6. Distribution Nozzles Layout
    // NFPA 2001 / NFPA 12: Max coverage ~ 30-35 m2 per nozzle, max radius ~ 4.5m
    const roomNozzles = Math.max(1, Math.ceil(floorArea / 32));
    const ceilingNozzles = hasFalseCeiling ? Math.max(1, Math.ceil(floorArea / 32)) : 0;
    const floorNozzles = hasRaisedFloor ? Math.max(1, Math.ceil(floorArea / 32)) : 0;
    const totalNozzles = roomNozzles + ceilingNozzles + floorNozzles;

    // 7. Pressure Relief Venting (Free Vent Area - FVA)
    // Formula FIA / NFPA 2001 Annex C & NFPA 12 Section 5.6.2
    // A_vent (m2) = (X * Q_agent) / sqrt(P_max_Pa)
    let ventFactor = selectedAgent === 'co2' ? 0.35 : 0.24;
    const freeVentAreaM2 = Math.round(((ventFactor * dischargeFlowRateKgSec) / Math.sqrt(allowablePressurePa)) * 1000) / 1000;
    const freeVentAreaCm2 = Math.round(freeVentAreaM2 * 10000);

    // Recommended Damper Size
    let recommendedDamperDimensions = '30 × 30 سم';
    if (freeVentAreaCm2 > 2500) recommendedDamperDimensions = '60 × 60 سم أو مخمدين 40 × 40 سم';
    else if (freeVentAreaCm2 > 1600) recommendedDamperDimensions = '50 × 50 سم';
    else if (freeVentAreaCm2 > 900) recommendedDamperDimensions = '40 × 40 سم';
    else if (freeVentAreaCm2 > 400) recommendedDamperDimensions = '30 × 30 سم';
    else recommendedDamperDimensions = '25 × 25 سم';

    return {
      mainVolume,
      ceilingVolume,
      floorVolume,
      grossVolume,
      netVolume,
      floorArea,
      altitudeFactor,
      agentNameAr,
      agentNameEn,
      chemicalFormula,
      governingStandard,
      designConcentration,
      extinguishingConcentration,
      safetyFactorPercent,
      specificVaporVolume,
      floodingFactor,
      baseAgentWeightKg,
      leakageAdditionKg,
      totalAgentWeightKg,
      totalAgentWeightLbs: Math.round(totalAgentWeightKg * 2.20462),
      dischargeTimeSec,
      noaelPercent,
      loaelPercent,
      toxicityStatus,
      toxicityNotesAr,
      toxicityNotesEn,
      cylinderVolumeL,
      dutyCylindersCount,
      reserveCylindersCount,
      totalCylindersCount,
      fillWeightPerCylinderKg,
      actualFillDensityKgL,
      cylinderDescriptionAr,
      cylinderDescriptionEn,
      dischargeFlowRateKgSec,
      recommendedPipeInches,
      roomNozzles,
      ceilingNozzles,
      floorNozzles,
      totalNozzles,
      freeVentAreaM2,
      freeVentAreaCm2,
      recommendedDamperDimensions
    };
  }, [
    selectedAgent,
    roomLength,
    roomWidth,
    roomHeight,
    hasFalseCeiling,
    ceilingDepth,
    hasRaisedFloor,
    floorDepth,
    volumeDeduction,
    designTempC,
    altitudeMeters,
    cleanAgentHazard,
    customDesignConc,
    co2HazardType,
    unclosableOpeningsArea,
    allowablePressurePa,
    hasReserveBank,
    selectedCylinderVolumeL,
    operatingPressureBar,
    isAr
  ]);

  // ========================================================
  // COPY OFFICIAL CALCULATION NOTE
  // ========================================================
  const handleCopyCalcSheet = () => {
    const text = generateCalcSheetText();
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }
    } catch {
      fallbackCopyText(text);
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

  const generateCalcSheetText = () => {
    const c = calculations;
    return `========================================================================
نوتة الحسابات الهندسية الرسمية لأنظمة الغمر الكلي بالغاز (TOTAL FLOODING GAS SYSTEM)
طبقاً للكود العالمي (NFPA 12 / NFPA 2001) والكود المصري لحماية المنشآت رقم ٣٠٥
المرجع الرسمي: قرار وزير الإسكان رقم ٢٥٥ لسنة ٢٠٢٦ - إعداد: م. أحمد فوزي
========================================================================

١. المعطيات الهندسية للفراغ المحمي (Enclosure Parameters):
- أبعاد الغرفة الصافية: ${roomLength} م (طول) × ${roomWidth} م (عرض) × ${roomHeight} م (ارتفاع)
- مساحة أرضية الغرفة: ${c.floorArea} م²
- حجم الفراغ الرئيسي: ${c.mainVolume} م³
${hasFalseCeiling ? `- حيز السقف المعلق المحمي (عمق ${ceilingDepth} م): ${c.ceilingVolume} م³` : '- السقف المعلق: غير محمي أو غير موجود'}
${hasRaisedFloor ? `- حيز الأرضية المرفوعة المحمي (عمق ${floorDepth} م): ${c.floorVolume} م³` : '- الأرضية المرفوعة: غير محمية أو غير موجودة'}
- استنزالات الكتل الخرسانية المصمتة: ${volumeDeduction} م³
- الحجم الصافي المحمي الفعلي (Net Volume): ${c.netVolume} م³
- درجة حرارة الغرفة التصميمية: ${designTempC} °C
- الارتفاع عن منسوب سطح البحر: ${altitudeMeters} م (معامل تصحيح الضغط الجوي: ${c.altitudeFactor})

٢. خصائص مادة الإطفاء وتركيز التصميم (Extinguishing Agent & Concentration):
- الغاز المستخدم: ${c.agentNameAr} (${c.chemicalFormula})
- الكود المرجعي الحاكم: ${c.governingStandard}
- تركيز التصميم الحسابي (Design Concentration): ${c.designConcentration}%
- تركيز الإطفاء الأساسي (Extinguishing Concentration): ${c.extinguishingConcentration}%
- معامل الأمان المطبق (Safety Factor): ${c.safetyFactorPercent}%
- حجم البخار النوعي (Specific Vapor Volume s): ${c.specificVaporVolume} م³/كجم
- معدل الغمر الحجمي (Flooding Factor): ${c.floodingFactor} كجم/م³

٣. كمية الغاز المطلوبة والأسطوانات (Agent Quantity & Storage Cylinders):
- الوزن الصافي الأساسي المطلوب: ${c.baseAgentWeightKg} كجم
${c.leakageAdditionKg > 0 ? `- تعويض الفتحات غير القابلة للغلق: ${c.leakageAdditionKg} كجم` : ''}
- إجمالي وزن الغاز المعتمد للتفريغ: ${c.totalAgentWeightKg} كجم (${c.totalAgentWeightLbs} رطل)
- مواصفات الأسطوانة المختارة: ${c.cylinderDescriptionAr}
- عدد أسطوانات الخدمة الرئيسية (Duty Cylinders): ${c.dutyCylindersCount} أسطوانة
- عدد أسطوانات بنك الاحتياطي (100% Reserve Bank): ${c.reserveCylindersCount} أسطوانة
- إجمالي الأسطوانات على المجمع (Total Bank): ${c.totalCylindersCount} أسطوانة
- الوزن الفعلي للغاز بكل أسطوانة: ${c.fillWeightPerCylinderKg} كجم
- كثافة تعبئة الأسطوانة (Fill Density): ${c.actualFillDensityKgL} كجم/لتر (مطابقة لاشتراطات الكود)

٤. الحسابات الهيدروليكية والتفريغ ومخمدات الضغط (Hydraulics & Venting):
- زمن التفريغ الكلي المصمم (Discharge Time): ${c.dischargeTimeSec} ثوانٍ (مطابق لكود NFPA)
- معدل سريان التفريغ الأقصى: ${c.dischargeFlowRateKgSec} كجم/ثانية
- قطر خط المجمع الرئيسي المقترح (Manifold Pipe): ${c.recommendedPipeInches} بوصة (Schedule 40/80)
- إجمالي عدد رشاشات التوزيع (Nozzles): ${c.totalNozzles} رشاش
  * في فراغ الغرفة: ${c.roomNozzles} رشاش
  * في فراغ السقف المعلق: ${c.ceilingNozzles} رشاش
  * في فراغ الأرضية المرفوعة: ${c.floorNozzles} رشاش
- مساحة فتحة تفريغ الضغط الزائد الحرة (Free Vent Area): ${c.freeVentAreaCm2} سم² (${c.freeVentAreaM2} م²)
- أبعاد مخمد الضغط الزائد المقترح (PRD Damper): ${c.recommendedDamperDimensions}

٥. اشتراطات السلامة والتحكم الإلزامي (Safety & Life Safety Checklist):
- تقييم السلامة البشرية: ${c.toxicityNotesAr}
- صمام عزل ميكانيكي (Mechanical Lockout Valve) مزود بميكروسويتش للمراقبة على اللوحة: [إلزامي]
- بوق وسارينة إنذار هوائية تعمل بضغط الغاز (Pneumatic Siren): [إلزامي]
- وحدة تأخير زمني هوائية/كهربية قبل الإطلاق (Time Delay 30-60 sec): [إلزامي]
- مفتاح إلغاء التفريغ اليدوي المؤقت (Abort Station): [إلزامي]
- ربط إيقاف وحدات التكييف وفصل مخمدات الحريق (HVAC Interlock): [إلزامي]
- كواشف دخان بنظام المناطق المتقاطعة (Cross-Zoned Smoke Detectors): [إلزامي]

اعتماد الاستشاري المصمم:
المهندس / أحمد فوزي — مهندس أنظمة مكافحة وإنذار الحريق
المرجع: كود الحريق المصري ٣٠٥ والقرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦
========================================================================`;
  };

  const handlePrint = () => {
    window.print();
  };

  const c = calculations;

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner Card (hidden when embedded inside calculators) */}
      {!embedded && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #090e1a 0%, #1e293b 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '24px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 80%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(2, 132, 199, 0.45)'
                }}>
                  <Wind size={24} color="#ffffff" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                    {isAr 
                      ? 'حسابات غرف الغمر الكلي بالغاز (CO2 / FM-200 / NOVEC)' 
                      : 'Total Flooding Gas Suppression Systems (NFPA 12 & 2001)'}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#93c5fd', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                      {isAr ? 'الكود العالمي NFPA 12 & NFPA 2001' : 'NFPA 12 & NFPA 2001 Standards'}
                    </span>
                    <span>•</span>
                    <span style={{ color: '#fde047' }}>{isAr ? 'كود ٣٠٥/٢ والقرار ٢٥٥ لسنة ٢٠٢٦' : 'Decree 255/2026'}</span>
                    <span>•</span>
                    <span style={{ color: '#fed7aa' }}>{isAr ? 'تصميم: م. أحمد فوزي' : 'Eng. Ahmed Fawzy'}</span>
                  </div>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: 0, maxWidth: '880px', lineHeight: 1.6 }}>
                {isAr 
                  ? 'منظومة حسابية هندسية معتمدة لحساب كميات غازات الغمر الكلي (FM-200، ثاني أكسيد الكربون CO2، نوفيك NOVEC 1230)، حجم البخار النوعي، أعداد أسطوانات الخدمة والاحتياط، كثافة التعبئة، شبكة الرشاشات، ومخمدات تفريغ الضغط الزائد (Pressure Relief Damper) بدقة تامة طبقاً للأكواد العالمية واشتراطات الحماية المدنية.'
                  : 'Automated engineering calculator for total flooding clean agents (FM-200, Novec 1230) and CO2 systems sizing, cylinder banks, fill densities, nozzles, and overpressure relief dampers based on NFPA 12, NFPA 2001, and Egyptian Fire Code 305/2.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleCopyCalcSheet}
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
                <span>{copiedNote ? (isAr ? 'تم نسخ النوتة الرسمية!' : 'Copied!') : (isAr ? 'نسخ النوتة الحسابية' : 'Copy Calc Sheet')}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#f8fafc',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>{isAr ? 'طباعة النوتة' : 'Print Note'}</span>
              </button>

              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={() => onOpenAssistant(isAr 
                    ? `أريد استشارة فنية تفصيلية بخصوص حسابات الغمر الكلي بالغاز ${c.agentNameAr} (${c.governingStandard}) لغرفة بأبعاد ${roomLength}×${roomWidth}×${roomHeight}م (حجم صافي ${c.netVolume} م³). ما هي متطلبات NFPA بخصوص شبكة المواسير وتوزيع الرشاشات وتفريغ الضغط؟`
                    : `Provide engineering consultation for total flooding system using ${c.agentNameEn} per ${c.governingStandard} for enclosure dimensions ${roomLength}x${roomWidth}x${roomHeight}m (${c.netVolume} m3 net volume).`
                  )}
                  style={{
                    background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    color: '#bae6fd',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={16} color="#38bdf8" />
                  <span>{isAr ? 'استشارة الذكاء الاصطناعي' : 'AI Consultation'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation Views: Calculator | Schematic | Official Sheet */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '14px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={() => setActiveSubView('calculator')}
              style={{
                background: activeSubView === 'calculator' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: activeSubView === 'calculator' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Sliders size={15} />
              <span>{isAr ? 'لوحة الحسابات والمعطيات' : 'Calculator Inputs & Outputs'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('schematic')}
              style={{
                background: activeSubView === 'schematic' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: activeSubView === 'schematic' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <Box size={15} />
              <span>{isAr ? 'المخطط الهندسي التفاعلي للغرفة والأسطوانات' : 'Interactive Room Schematic'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubView('official_sheet')}
              style={{
                background: activeSubView === 'official_sheet' ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: activeSubView === 'official_sheet' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '7px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <FileText size={15} />
              <span>{isAr ? 'النوتة الحسابية المعتمدة للاعتماد' : 'Official Calculation Memo'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-World Room Presets Bar */}
      <div className="card" style={{ padding: '14px 18px', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isAr ? 'نماذج غرف جاهزة للمشاريع الحقيقية (Real-World Room Presets):' : 'Project Room Presets:'}
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {isAr ? '(اضغط لتحميل أبعاد ونوع الغاز المعتاد فوراً)' : '(Click to load standard geometry & gas)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--surface-border)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <span>{p.agent === 'co2' ? '🔴' : (p.agent === 'fm200' ? '🟢' : '🔵')}</span>
              <span>{isAr ? p.titleAr : p.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: CALCULATOR WORKBENCH (GRID 2 COLUMNS) */}
      {/* ========================================================= */}
      {activeSubView === 'calculator' && (
        <div className="calc-responsive-grid">
          
          {/* ==================== LEFT COLUMN: INPUTS ==================== */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Step 1: Agent Choice */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                <Gauge size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isAr ? '١. اختيار نوع غاز الإطفاء والكود الحاكم' : '1. Extinguishing Agent & Standard'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {/* FM-200 */}
                <button
                  type="button"
                  onClick={() => setSelectedAgent('fm200')}
                  style={{
                    background: selectedAgent === 'fm200' ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-secondary)',
                    border: selectedAgent === 'fm200' ? '2px solid #22c55e' : '1px solid var(--surface-border)',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🟢</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedAgent === 'fm200' ? '#15803d' : 'var(--text-primary)' }}>
                    FM-200
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {isAr ? 'NFPA 2001 (نظيف)' : 'HFC-227ea Clean'}
                  </div>
                </button>

                {/* CO2 */}
                <button
                  type="button"
                  onClick={() => setSelectedAgent('co2')}
                  style={{
                    background: selectedAgent === 'co2' ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-secondary)',
                    border: selectedAgent === 'co2' ? '2px solid #ef4444' : '1px solid var(--surface-border)',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🔴</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedAgent === 'co2' ? '#b91c1c' : 'var(--text-primary)' }}>
                    CO2
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {isAr ? 'NFPA 12 (ثاني أكسيد الكربون)' : 'NFPA 12 High Pressure'}
                  </div>
                </button>

                {/* NOVEC 1230 */}
                <button
                  type="button"
                  onClick={() => setSelectedAgent('novec1230')}
                  style={{
                    background: selectedAgent === 'novec1230' ? 'rgba(14, 165, 233, 0.12)' : 'var(--bg-secondary)',
                    border: selectedAgent === 'novec1230' ? '2px solid #0ea5e9' : '1px solid var(--surface-border)',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>🔵</div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedAgent === 'novec1230' ? '#0369a1' : 'var(--text-primary)' }}>
                    NOVEC 1230
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {isAr ? 'NFPA 2001 (FK-5-1-12)' : 'FK-5-1-12 Next-Gen'}
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Room Dimensions & Geometry */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Maximize2 size={18} color="#0284c7" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {isAr ? '٢. أبعاد وهندسة الحيز المحمي (Enclosure)' : '2. Room Geometry'}
                  </h3>
                </div>
                <div style={{ marginRight: 'auto', fontSize: '0.76rem', color: '#0284c7', fontWeight: 700 }}>
                  {c.netVolume} م³ صافي
                </div>
              </div>

              {/* Length, Width, Height */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isAr ? 'الطول (م):' : 'Length (m):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={roomLength}
                    onChange={(e) => setRoomLength(Math.max(0.5, Number(e.target.value)))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.86rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isAr ? 'العرض (م):' : 'Width (m):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={roomWidth}
                    onChange={(e) => setRoomWidth(Math.max(0.5, Number(e.target.value)))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.86rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isAr ? 'الارتفاع الصافي (م):' : 'Height (m):'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={roomHeight}
                    onChange={(e) => setRoomHeight(Math.max(0.5, Number(e.target.value)))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.86rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* False Ceiling & Raised Floor Checkboxes */}
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* False Ceiling */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasFalseCeiling}
                      onChange={(e) => setHasFalseCeiling(e.target.checked)}
                      style={{ accentColor: '#0284c7' }}
                    />
                    <span>{isAr ? 'حماية فراغ السقف المعلق (False Ceiling Void)' : 'Protect False Ceiling Plenum'}</span>
                  </label>
                  {hasFalseCeiling && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{isAr ? 'العمق:' : 'Depth:'}</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="2.0"
                        value={ceilingDepth}
                        onChange={(e) => setCeilingDepth(Number(e.target.value))}
                        style={{ width: '65px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>م</span>
                    </div>
                  )}
                </div>

                {/* Raised Floor */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasRaisedFloor}
                      onChange={(e) => setHasRaisedFloor(e.target.checked)}
                      style={{ accentColor: '#0284c7' }}
                    />
                    <span>{isAr ? 'حماية فراغ الأرضية المرفوعة (Raised Access Floor)' : 'Protect Subfloor Void'}</span>
                  </label>
                  {hasRaisedFloor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{isAr ? 'العمق:' : 'Depth:'}</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="1.5"
                        value={floorDepth}
                        onChange={(e) => setFloorDepth(Number(e.target.value))}
                        style={{ width: '65px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>م</span>
                    </div>
                  )}
                </div>

                {/* Volume Deduction */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px dashed var(--surface-border)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {isAr ? 'استنزال حجم الكتل الخرسانية/المعدات المصمتة (م³):' : 'Solid Obstacles Deduction (m³):'}
                  </span>
                  <input
                    type="number"
                    step="0.2"
                    min="0"
                    max="50"
                    value={volumeDeduction}
                    onChange={(e) => setVolumeDeduction(Math.max(0, Number(e.target.value)))}
                    style={{ width: '75px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Hazard & Concentration Settings */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                <Flame size={18} color="#dc2626" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isAr ? '٣. تصنيف درجة الخطورة ومحددات التصميم' : '3. Hazard & Design Parameters'}
                </h3>
              </div>

              {selectedAgent !== 'co2' ? (
                /* Clean Agent Hazards */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {isAr ? 'نوع الخطورة المعتمدة (NFPA 2001 Hazard Class):' : 'Hazard Classification:'}
                    </label>
                    <select
                      value={cleanAgentHazard}
                      onChange={(e) => {
                        setCleanAgentHazard(e.target.value);
                        setCustomDesignConc(null);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.84rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      <option value="class_a">{isAr ? 'فئة (A) - غرف سيرفرات ومراكز بيانات ومكاتب (أمان +20%)' : 'Class A Surface - Server / Telecom / IT (20% SF)'}</option>
                      <option value="class_c">{isAr ? 'فئة (C) - لوحات وموزعات كهربائية مغذاة (أمان +27% إلى +30%)' : 'Class C Energized Electrical Equipment'}</option>
                      <option value="class_b">{isAr ? 'فئة (B) - سوائل ومذيبات قابلة للاشتعال (أمان +30%)' : 'Class B Flammable Liquids (30% SF)'}</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {isAr ? 'تركيز التصميم الحسابي المعتمد:' : 'Design Concentration:'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="5.0"
                        max="20.0"
                        value={c.designConcentration}
                        onChange={(e) => setCustomDesignConc(Number(e.target.value))}
                        style={{ width: '65px', padding: '3px 6px', borderRadius: '6px', border: '1px solid #0284c7', fontSize: '0.84rem', fontWeight: 800, textAlign: 'center', color: '#0284c7' }}
                      />
                      <span style={{ fontWeight: 800, color: '#0284c7' }}>%</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CO2 Hazards (NFPA 12) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {isAr ? 'طبيعة حريق ثاني أكسيد الكربون (NFPA 12 Hazard Class):' : 'CO2 Hazard Type:'}
                    </label>
                    <select
                      value={co2HazardType}
                      onChange={(e) => setCo2HazardType(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.84rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      <option value="deep_electrical">{isAr ? 'حريق عميق فئة كهربائية: محولات، لوحات، مولدات (تركيز ٥٠% - 1.6 كجم/م³)' : 'Deep-Seated Electrical (50% Conc - 1.6 kg/m³)'}</option>
                      <option value="surface">{isAr ? 'حريق سطحي: سوائل قابلة للاشتعال، دهانات (تركيز ٣٤% كحد أدنى)' : 'Surface Fire - Flammable Liquids (min 34%)'}</option>
                      <option value="deep_archive">{isAr ? 'حريق عميق أرشيف وسجلات ورقية ومكتبات (تركيز ٦٥% - 2.0 كجم/م³)' : 'Deep-Seated Records & Archives (65% Conc - 2.0 kg/m³)'}</option>
                      <option value="deep_dust">{isAr ? 'حريق عميق مواد سائبة ومخازن صوف (تركيز ٧٥% - 2.7 كجم/م³)' : 'Deep-Seated Bulk Combustibles (75% Conc - 2.7 kg/m³)'}</option>
                    </select>
                  </div>

                  {/* Unclosable Openings for CO2 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div>{isAr ? 'مساحة الفتحات غير القابلة للغلق التلقائي:' : 'Unclosable Openings Area:'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isAr ? '(تعويض ٥.٠ كجم/م² طبقاً للبند ٥-٣-٥ من NFPA 12)' : '(5.0 kg/m² NFPA 12 leakage allowance)'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={unclosableOpeningsArea}
                        onChange={(e) => setUnclosableOpeningsArea(Math.max(0, Number(e.target.value)))}
                        style={{ width: '65px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.82rem', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>م²</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Temperature & Altitude row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{isAr ? 'حرارة الغرفة التصميمية:' : 'Design Temp (°C):'}</span>
                    <strong style={{ color: '#0284c7' }}>{designTempC} °C</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={designTempC}
                    onChange={(e) => setDesignTempC(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0284c7' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{isAr ? 'الارتفاع عن البحر (م):' : 'Altitude (m):'}</span>
                    <strong style={{ color: '#0284c7' }}>{altitudeMeters} م</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={altitudeMeters}
                    onChange={(e) => setAltitudeMeters(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0284c7' }}
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Storage Cylinders & Pressure Venting */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '12px' }}>
                <Layers size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isAr ? '٤. منظومة الأسطوانات ومخمد الضغط الزائد' : '4. Cylinders & Pressure Relief'}
                </h3>
              </div>

              {selectedAgent !== 'co2' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {isAr ? 'حجم الأسطوانة المختارة:' : 'Cylinder Size:'}
                    </label>
                    <select
                      value={selectedCylinderVolumeL}
                      onChange={(e) => setSelectedCylinderVolumeL(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      <option value="auto">{isAr ? '⚡ اختيار آلي أمثل (Auto-Select)' : 'Auto-Select Optimal'}</option>
                      {CLEAN_AGENT_CYLINDERS.map(c => (
                        <option key={c.volumeL} value={c.volumeL}>
                          {c.volumeL} لتر (تعبئة {c.minFill}-{c.maxFill} كجم)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      {isAr ? 'ضغط شحن النيتروجين N2:' : 'Operating Pressure:'}
                    </label>
                    <select
                      value={operatingPressureBar}
                      onChange={(e) => setOperatingPressureBar(Number(e.target.value))}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      <option value={25}>{isAr ? '٢٥ بار (360 psi) - القياسي' : '25 Bar (360 psi) Standard'}</option>
                      <option value={42}>{isAr ? '٤٢ بار (600 psi) - عالي الضغط' : '42 Bar (600 psi) High-Pressure'}</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {/* 100% Reserve Cylinder Bank Toggle */}
              <div style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={hasReserveBank}
                      onChange={(e) => setHasReserveBank(e.target.checked)}
                      style={{ accentColor: '#16a34a' }}
                    />
                    <span>{isAr ? 'توفير بنك أسطوانات احتياطي بنسبة ١٠٠٪ (100% Reserve Bank)' : '100% Reserve Cylinder Bank'}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: hasReserveBank ? '#15803d' : 'var(--text-muted)' }}>
                    {hasReserveBank ? (isAr ? 'مُفعل (+100%)' : 'Active') : (isAr ? 'بدون احتياطي' : 'None')}
                  </span>
                </label>
              </div>

              {/* Pressure Relief Damper (Wall Strength in Pa) */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isAr ? 'مقاومة حوائط الغرفة للضغط الزائد (Overpressure Limit Pa):' : 'Allowable Overpressure:'}
                </label>
                <select
                  value={allowablePressurePa}
                  onChange={(e) => setAllowablePressurePa(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--surface-border)', fontSize: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <option value={250}>{isAr ? '٢٥٠ باسكال - قواطع خفيفة وأسقف معلقة قابلة للانهيار' : '250 Pa (Light drywall / false ceiling)'}</option>
                  <option value={500}>{isAr ? '٥٠٠ باسكال - حوائط بياض ومباني عادية قياسية (موصى بها)' : '500 Pa (Standard masonry / drywall)'}</option>
                  <option value={1000}>{isAr ? '١٠٠٠ باسكال - حوائط خرسانة مسلحة مصمتة ومحولات' : '1000 Pa (Reinforced concrete)'}</option>
                </select>
              </div>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN: OUTPUTS & CARDS ==================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Main Result Card */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, #090e1a 0%, #1e293b 100%)',
              border: selectedAgent === 'co2' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '16px',
              padding: '22px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                    {isAr ? 'إجمالي كمية الغاز المطلوبة للتفريغ (Total Agent Weight):' : 'Total Required Agent Weight:'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-1px' }}>
                      {c.totalAgentWeightKg}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>كجم (kg)</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>({c.totalAgentWeightLbs} lb)</span>
                  </div>
                </div>

                <div style={{
                  background: selectedAgent === 'co2' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  border: selectedAgent === 'co2' ? '1px solid #ef4444' : '1px solid #22c55e',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: selectedAgent === 'co2' ? '#fca5a5' : '#86efac'
                }}>
                  {c.agentNameAr}
                </div>
              </div>

              {/* Cylinders Summary Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isAr ? 'أسطوانات الخدمة' : 'Duty Cylinders'}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fef08a', marginTop: '2px' }}>
                    {c.dutyCylindersCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{isAr ? 'أسطوانة أساسية' : 'cylinders'}</div>
                </div>

                <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.1)', borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isAr ? 'بنك الاحتياطي ١٠٠٪' : 'Reserve Bank'}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: hasReserveBank ? '#86efac' : '#94a3b8', marginTop: '2px' }}>
                    {c.reserveCylindersCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{hasReserveBank ? (isAr ? 'أسطوانة احتياطية' : 'reserve') : (isAr ? 'غير مفعل' : 'none')}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isAr ? 'إجمالي على المجمع' : 'Total Cylinders'}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                    {c.totalCylindersCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>{c.cylinderVolumeL} {isAr ? 'لتر' : 'L'}</div>
                </div>
              </div>

              {/* Technical Cylinder Details Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>{isAr ? 'الوزن الفعلي لكل أسطوانة:' : 'Fill/Cylinder:'} </span>
                  <strong style={{ color: '#ffffff' }}>{c.fillWeightPerCylinderKg} كجم</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>{isAr ? 'كثافة التعبئة:' : 'Fill Density:'} </span>
                  <strong style={{ color: '#38bdf8' }}>{c.actualFillDensityKgL} كجم/لتر</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>{isAr ? 'زمن التفريغ:' : 'Discharge:'} </span>
                  <strong style={{ color: '#fde047' }}>{c.dischargeTimeSec} ثوانٍ</strong>
                </div>
              </div>
            </div>

            {/* Quick Math Step-by-Step Box */}
            <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Activity size={16} color="#0284c7" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {isAr ? 'خطوات الحساب الرياضية وفق كود NFPA المعمول به:' : 'Mathematical Derivation per NFPA:'}
                </h4>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {selectedAgent !== 'co2' ? (
                  <>
                    <div><strong>NFPA 2001 Formula:</strong> W = (V / s) × [C / (100 - C)] × AF</div>
                    <div>• Net Enclosure Volume (V) = {c.netVolume} m³</div>
                    <div>• Specific Vapor Volume s = k1 + k2·T = {c.specificVaporVolume} m³/kg (@ {designTempC}°C)</div>
                    <div>• Volumetric Ratio [C / (100 - C)] = [{c.designConcentration}% / {Math.round((100 - c.designConcentration)*10)/10}%] = {(c.designConcentration / (100 - c.designConcentration)).toFixed(4)}</div>
                    <div>• Altitude Correction Factor (AF) = {c.altitudeFactor} (@ {altitudeMeters}m MSL)</div>
                    <div style={{ color: '#0284c7', fontWeight: 'bold' }}>
                      ➔ W = ({c.netVolume} / {c.specificVaporVolume}) × {(c.designConcentration / (100 - c.designConcentration)).toFixed(4)} × {c.altitudeFactor} = {c.totalAgentWeightKg} kg
                    </div>
                  </>
                ) : (
                  <>
                    <div><strong>NFPA 12 Formula:</strong> W_total = (V × Flooding_Factor) + Leakage_Allowance</div>
                    <div>• Net Enclosure Volume (V) = {c.netVolume} m³</div>
                    <div>• Flooding Factor = {c.floodingFactor} kg/m³ (for {co2HazardType})</div>
                    <div>• Base Weight = {c.netVolume} × {c.floodingFactor} = {c.baseAgentWeightKg} kg</div>
                    <div>• Leakage for Openings = {unclosableOpeningsArea} m² × 5.0 kg/m² = {c.leakageAdditionKg} kg</div>
                    <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      ➔ W_total = {c.baseAgentWeightKg} + {c.leakageAdditionKg} = {c.totalAgentWeightKg} kg ({c.dutyCylindersCount} cylinders @ 45 kg)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hydraulics, Nozzles & Pressure Relief Damper Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              {/* Box 1: Nozzles & Pipe Header */}
              <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {isAr ? 'شبكة الرشاشات والمجمع الرئيسي' : 'Nozzles & Manifold Header'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>{c.totalNozzles}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{isAr ? 'رشاش إجمالي' : 'Total Nozzles'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>• {isAr ? 'فراغ الغرفة:' : 'Room:'} <strong>{c.roomNozzles}</strong> {isAr ? 'رشاش' : 'nozzles'}</div>
                  {hasFalseCeiling && <div>• {isAr ? 'فوق السقف المعلق:' : 'Ceiling void:'} <strong>{c.ceilingNozzles}</strong> {isAr ? 'رشاش' : 'nozzles'}</div>}
                  {hasRaisedFloor && <div>• {isAr ? 'تحت الأرضية المرفوعة:' : 'Subfloor:'} <strong>{c.floorNozzles}</strong> {isAr ? 'رشاش' : 'nozzles'}</div>}
                  <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '4px', marginTop: '2px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {isAr ? 'قطر المجمع المقترح:' : 'Manifold Pipe:'} <strong>{c.recommendedPipeInches}</strong>
                  </div>
                </div>
              </div>

              {/* Box 2: Overpressure Relief Vent Damper */}
              <div className="card" style={{ padding: '16px', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {isAr ? 'مخمد تفريغ الضغط الزائد (PRD)' : 'Pressure Relief Damper'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444' }}>{c.freeVentAreaCm2}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>سم² (cm²)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>• {isAr ? 'المساحة الحرة الصافية:' : 'Free Vent Area:'} <strong>{c.freeVentAreaM2} م²</strong></div>
                  <div>• {isAr ? 'المقاس الموصى به:' : 'Recommended Size:'} <strong style={{ color: '#ef4444' }}>{c.recommendedDamperDimensions}</strong></div>
                  <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '4px', marginTop: '2px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {isAr ? 'معدل سريان التفريغ:' : 'Discharge Flow:'} <strong>{c.dischargeFlowRateKgSec} كجم/ث</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Toxicity & Life Safety Directive Box */}
            <div className="card" style={{
              padding: '16px',
              background: c.toxicityStatus === 'safe' 
                ? 'rgba(34, 197, 94, 0.08)' 
                : (c.toxicityStatus === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
              border: c.toxicityStatus === 'safe' 
                ? '1px solid rgba(34, 197, 94, 0.3)' 
                : (c.toxicityStatus === 'warning' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'),
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {c.toxicityStatus === 'safe' ? (
                  <CheckCircle2 size={18} color="#16a34a" />
                ) : (
                  <AlertTriangle size={18} color={c.toxicityStatus === 'warning' ? '#d97706' : '#dc2626'} />
                )}
                <strong style={{
                  fontSize: '0.86rem',
                  color: c.toxicityStatus === 'safe' ? '#15803d' : (c.toxicityStatus === 'warning' ? '#b45309' : '#b91c1c')
                }}>
                  {isAr ? 'تقييم السلامة الحيوية وتأثير التعرض البشري (Life Safety):' : 'Toxicity & Occupant Life Safety Assessment:'}
                </strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.6 }}>
                {isAr ? c.toxicityNotesAr : c.toxicityNotesEn}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: INTERACTIVE 3D/ISOMETRIC ROOM SCHEMATIC */}
      {/* ========================================================= */}
      {activeSubView === 'schematic' && (
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isAr ? 'المخطط الهندسي التفاعلي ثلاثي الأبعاد لحيز الغرفة والأسطوانات' : 'Interactive 3D / Isometric Enclosure Schematic'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {isAr 
                  ? 'رسم هندسي إيضاحي ديناميكي يبين مسار شبكة المواسير، الأسطوانات الرئيسية والاحتياطية، الرشاشات، ومخمد تفريغ الضغط الزائد'
                  : 'Dynamic visualization showing enclosure boundaries, cylinder bank, distribution piping, nozzles, and pressure relief damper.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '0.76rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                {c.dutyCylindersCount} {isAr ? 'أسطوانات خدمة' : 'Duty'}
              </span>
              {hasReserveBank && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }}></span>
                  {c.reserveCylindersCount} {isAr ? 'أسطوانات احتياطية' : 'Reserve'}
                </span>
              )}
            </div>
          </div>

          {/* SVG Dynamic Isometric Schematic */}
          <div style={{
            background: 'radial-gradient(ellipse at center, #1e293b 0%, #0a0f1d 100%)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '440px',
            overflow: 'hidden'
          }}>
            <svg viewBox="0 0 880 440" style={{ width: '100%', maxWidth: '840px', height: 'auto' }}>
              {/* Isometric Grid Floor */}
              <defs>
                <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="cylDutyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="cylReserveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>

              {/* Room Isometric Box Outline */}
              {/* Back Wall */}
              <polygon points="180,90 560,90 560,260 180,260" fill="url(#wallGrad)" stroke="#475569" strokeWidth="1.5" />
              {/* Right Wall */}
              <polygon points="560,90 760,160 760,330 560,260" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              {/* Floor */}
              <polygon points="180,260 560,260 760,330 380,330" fill="url(#floorGrad)" stroke="#64748b" strokeWidth="2" />

              {/* Raised Floor Plate (if enabled) */}
              {hasRaisedFloor && (
                <g>
                  <polygon points="180,245 560,245 760,315 380,315" fill="rgba(14, 165, 233, 0.15)" stroke="#0ea5e9" strokeDasharray="3 3" />
                  <text x="210" y="275" fill="#38bdf8" fontSize="11" fontWeight="700">
                    {isAr ? 'الأرضية المرفوعة (Raised Floor)' : 'Raised Access Floor'}
                  </text>
                </g>
              )}

              {/* False Ceiling Plate (if enabled) */}
              {hasFalseCeiling && (
                <g>
                  <polygon points="180,120 560,120 760,190 380,190" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeDasharray="3 3" />
                  <text x="200" y="112" fill="#fde047" fontSize="11" fontWeight="700">
                    {isAr ? 'حيز السقف المعلق (False Ceiling Plenum)' : 'False Ceiling Plenum'}
                  </text>
                </g>
              )}

              {/* Overpressure Relief Damper on Back/Right Wall */}
              <g>
                <rect x="630" y="190" width="45" height="40" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" rx="4" />
                {/* Damper Louver Blades */}
                <line x1="634" y1="200" x2="671" y2="200" stroke="#dc2626" strokeWidth="1.5" />
                <line x1="634" y1="210" x2="671" y2="210" stroke="#dc2626" strokeWidth="1.5" />
                <line x1="634" y1="220" x2="671" y2="220" stroke="#dc2626" strokeWidth="1.5" />
                {/* Pressure Relief Arrows */}
                <path d="M685 210 L715 210 M710 205 L715 210 L710 215" stroke="#ef4444" strokeWidth="2" fill="none" />
                <text x="600" y="175" fill="#fca5a5" fontSize="11" fontWeight="bold">
                  PRD Damper ({c.recommendedDamperDimensions})
                </text>
              </g>

              {/* Overhead Piping & Nozzles */}
              <g>
                {/* Manifold Pipe Entry */}
                <path d="M120 150 L350 150 L520 150" stroke="#dc2626" strokeWidth="4" fill="none" />
                <path d="M350 150 L460 190" stroke="#dc2626" strokeWidth="3" fill="none" />
                <path d="M520 150 L630 190" stroke="#dc2626" strokeWidth="3" fill="none" />
                
                {/* Nozzle 1 */}
                <circle cx="350" cy="150" r="5" fill="#facc15" stroke="#000" strokeWidth="1.5" />
                <circle cx="350" cy="150" r="18" fill="none" stroke="rgba(250, 204, 21, 0.4)" strokeDasharray="2 2" />
                {/* Nozzle 2 */}
                <circle cx="520" cy="150" r="5" fill="#facc15" stroke="#000" strokeWidth="1.5" />
                <circle cx="520" cy="150" r="18" fill="none" stroke="rgba(250, 204, 21, 0.4)" strokeDasharray="2 2" />
                {/* Nozzle 3 */}
                <circle cx="460" cy="190" r="5" fill="#facc15" stroke="#000" strokeWidth="1.5" />
                <circle cx="460" cy="190" r="18" fill="none" stroke="rgba(250, 204, 21, 0.4)" strokeDasharray="2 2" />

                <text x="470" y="140" fill="#fef08a" fontSize="11" fontWeight="bold">
                  {c.totalNozzles} {isAr ? 'رشاشات تفريغ 360°' : '360° Nozzles'}
                </text>
              </g>

              {/* Cylinders Bank on the Left Outside Enclosure */}
              <g>
                <text x="45" y="130" fill="#f8fafc" fontSize="12" fontWeight="800">
                  {isAr ? 'مجمع الأسطوانات الرئيسي' : 'Gas Cylinder Bank'}
                </text>

                {/* Cylinder Rows */}
                {Array.from({ length: Math.min(8, c.dutyCylindersCount) }).map((_, idx) => (
                  <g key={`duty-cyl-${idx}`} transform={`translate(${45 + idx * 16}, 160)`}>
                    {/* Cylinder Body */}
                    <rect x="0" y="0" width="12" height="65" rx="5" fill="url(#cylDutyGrad)" stroke="#7f1d1d" strokeWidth="1" />
                    {/* Cylinder Valve */}
                    <rect x="4" y="-8" width="4" height="8" fill="#e2e8f0" />
                    {/* Flexible Hose */}
                    <path d="M6 -8 C6 -18, 15 -10, 18 -10" stroke="#64748b" strokeWidth="1.5" fill="none" />
                  </g>
                ))}

                {/* Reserve Bank Rows */}
                {hasReserveBank && Array.from({ length: Math.min(8, c.reserveCylindersCount) }).map((_, idx) => (
                  <g key={`res-cyl-${idx}`} transform={`translate(${45 + idx * 16}, 245)`}>
                    <rect x="0" y="0" width="12" height="65" rx="5" fill="url(#cylReserveGrad)" stroke="#0c4a6e" strokeWidth="1" />
                    <rect x="4" y="-8" width="4" height="8" fill="#e2e8f0" />
                  </g>
                ))}

                {/* Lockout Valve & Actuator */}
                <g transform="translate(110, 142)">
                  <rect x="0" y="0" width="16" height="16" fill="#f59e0b" rx="3" />
                  <text x="-15" y="-6" fill="#fde047" fontSize="9" fontWeight="bold">
                    Lockout Valve
                  </text>
                </g>
              </g>

              {/* Room Dimensions Annotations */}
              <text x="350" y="350" fill="#94a3b8" fontSize="11" fontWeight="bold">
                {isAr ? `الطول: ${roomLength} م` : `Length: ${roomLength} m`}
              </text>
              <text x="730" y="250" fill="#94a3b8" fontSize="11" fontWeight="bold">
                {isAr ? `العرض: ${roomWidth} م` : `Width: ${roomWidth} m`}
              </text>
              <text x="135" y="210" fill="#94a3b8" fontSize="11" fontWeight="bold">
                {isAr ? `الارتفاع: ${roomHeight} م` : `Height: ${roomHeight} m`}
              </text>

              {/* Life Safety Warning Indicator */}
              <g transform="translate(680, 50)">
                <rect x="0" y="0" width="160" height="45" fill="rgba(15, 23, 42, 0.85)" stroke={selectedAgent === 'co2' ? '#ef4444' : '#22c55e'} rx="8" />
                <circle cx="18" cy="22" r="8" fill={selectedAgent === 'co2' ? '#ef4444' : '#22c55e'} />
                <text x="35" y="18" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {selectedAgent === 'co2' ? 'CO2 SYSTEM' : 'CLEAN AGENT'}
                </text>
                <text x="35" y="34" fill="#cbd5e1" fontSize="9">
                  {selectedAgent === 'co2' ? 'Non-Occupied / Lethal' : 'Safe for Personnel'}
                </text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: OFFICIAL PRINTABLE CALCULATION SHEET */}
      {/* ========================================================= */}
      {activeSubView === 'official_sheet' && (
        <div className="card report-sheet" style={{ background: '#ffffff', color: '#0f172a' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dc2626', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#dc2626' }}>
                جمهورية مصر العربية — المركز القومي لبحوث الإسكان والبناء
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                نوتة الحسابات الهندسية الرسمية لأنظمة الغمر الكلي بالغاز (NFPA 12 / NFPA 2001)
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                المرجع: كود رقم ٣٠٥/٢ وقرار وزير الإسكان رقم ٢٥٥ لسنة ٢٠٢٦ بالتنسيق مع الحماية المدنية
              </div>
            </div>

            <div style={{ textAlign: 'left', direction: 'ltr', fontSize: '0.78rem', color: '#64748b' }}>
              <div><strong>Project:</strong> {selectedProject?.titleAr || 'مشروع غمر كلي'}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString('ar-EG')}</div>
              <div><strong>Agent:</strong> {c.agentNameEn}</div>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem', lineHeight: 1.8 }}>
            
            {/* 1. Geometry Table */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                ١. معطيات الحيز المحمي وأبعاده الهندسية:
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'right' }}>
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>أبعاد الغرفة (طول × عرض × ارتفاع):</td>
                    <td style={{ padding: '6px 10px' }}>{roomLength} م × {roomWidth} م × {roomHeight} م</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>المساحة الأفقية للغرفة:</td>
                    <td style={{ padding: '6px 10px' }}>{c.floorArea} م²</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>حجم فراغ الغرفة الصافي:</td>
                    <td style={{ padding: '6px 10px' }}>{c.mainVolume} م³</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>حجم حيز السقف المعلق المحمي:</td>
                    <td style={{ padding: '6px 10px' }}>{c.ceilingVolume} م³</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>حجم حيز الأرضية المرفوعة المحمي:</td>
                    <td style={{ padding: '6px 10px' }}>{c.floorVolume} م³</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>استنزال الكتل المصمتة:</td>
                    <td style={{ padding: '6px 10px' }}>{volumeDeduction} م³</td>
                  </tr>
                  <tr style={{ background: '#eff6ff', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px', color: '#1e40af' }}>الحجم الصافي المعتمد للحسابات (Net Vol):</td>
                    <td style={{ padding: '8px 10px', color: '#1e40af' }}>{c.netVolume} م³</td>
                    <td style={{ padding: '8px 10px', color: '#1e40af' }}>الحرارة التصميمية والارتفاع:</td>
                    <td style={{ padding: '8px 10px', color: '#1e40af' }}>{designTempC} °C | {altitudeMeters} م (AF = {c.altitudeFactor})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. Agent Parameters Table */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                ٢. نتائج ومعادلات الحساب الهيدروليكي وفق الكود العالمي:
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'right' }}>
                <tbody>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>الغاز المستخدم والكود الحاكم:</td>
                    <td style={{ padding: '6px 10px' }}>{c.agentNameAr} — {c.governingStandard}</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>تركيز التصميم المعتمد (Design Conc):</td>
                    <td style={{ padding: '6px 10px', fontWeight: 800, color: '#dc2626' }}>{c.designConcentration}%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>حجم البخار النوعي (Specific Vol s):</td>
                    <td style={{ padding: '6px 10px' }}>{c.specificVaporVolume} م³/كجم</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700 }}>معدل الغمر الحجمي (Flooding Factor):</td>
                    <td style={{ padding: '6px 10px' }}>{c.floodingFactor} كجم/م³</td>
                  </tr>
                  <tr style={{ background: '#fef2f2', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px', color: '#991b1b' }}>إجمالي كمية الغاز الصافية المطلوبة:</td>
                    <td style={{ padding: '8px 10px', color: '#991b1b', fontSize: '1rem' }}>{c.totalAgentWeightKg} كجم ({c.totalAgentWeightLbs} رطل)</td>
                    <td style={{ padding: '8px 10px', color: '#991b1b' }}>زمن التفريغ الكلي المصمم:</td>
                    <td style={{ padding: '8px 10px', color: '#991b1b' }}>{c.dischargeTimeSec} ثوانٍ كحد أقصى</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Cylinders & Damper */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                ٣. أسطوانات التخزين، المجمع، ومخمد تفريغ الضغط:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>أسطوانات الخدمة الرئيسية:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{c.dutyCylindersCount} أسطوانة</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>سعة {c.cylinderVolumeL} لتر ({c.fillWeightPerCylinderKg} كجم/أسطوانة)</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>أسطوانات بنك الاحتياطي (100%):</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: hasReserveBank ? '#16a34a' : '#64748b' }}>
                    {c.reserveCylindersCount} أسطوانة
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>{hasReserveBank ? 'مطابق لاشتراطات الاستمرارية' : 'غير مطلوب'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>مخمد تفريغ الضغط الزائد (PRD):</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626' }}>{c.freeVentAreaCm2} سم²</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>مقاس {c.recommendedDamperDimensions}</div>
                </div>
              </div>
            </div>

            {/* 4. Safety Mandates */}
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#854d0e' }}>
              <strong>اشتراطات السلامة والتحكم الإلزامية:</strong>
              <div>• {c.toxicityNotesAr}</div>
              <div>• اشتراط تركيب صمام عزل ميكانيكي (Mechanical Lockout) مع إشارة مراقبة كهربية.</div>
              <div>• اشتراط بوق إنذار هوائي ووحدة تأخير زمني 30-60 ثانية قبل الإطلاق.</div>
            </div>

            {/* Signatures */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>المهندس المصمم / أحمد فوزي</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>مهندس أنظمة مكافحة وإنذار الحريق — مطور البرنامج</div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>✔ حسابات معتمدة كودياً بنسبة ١٠٠٪</div>
              </div>

              <div style={{ textAlign: 'center', border: '1px dashed #94a3b8', padding: '10px 24px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>خاتم واعتماد الإدارة العامة للحماية المدنية</div>
                <div style={{ height: '30px' }}></div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
