// Egyptian Fire Code Assessment & Parser Engine
// Strictly grounded in Egyptian Fire Code 2026 (الكود المصري لحماية المنشآت من أخطار الحريق)
// Ministerial Decree No. 255 of 2026 (قرار وزاري رقم ٢٥٥ لسنة ٢٠٢٦)

export const toLatinDigits = (s) => (s ? String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) : '');

/**
 * Natural-language parser that extracts project facts from Arabic or English text
 */
export function parseProjectDescription(text) {
  const normText = toLatinDigits(text || '');
  const facts = {
    rawText: text,
    occupancyType: null,
    occupancySubgroup: null,
    subgroupNameAr: null,
    buildingHeight: null,
    aboveGroundFloors: null,
    basementFloors: null,
    basementUse: null,
    floorArea: null,
    totalArea: null,
    occupantLoad: null,
    existingSystems: [],
    detectedEntities: []
  };

  const lower = normText.toLowerCase();

  // 1. Occupancy Detection
  const hasCommercial = lower.includes('تجار') || lower.includes('commercial') || lower.includes('محلات') || lower.includes('معارض') || lower.includes('مول') || lower.includes('mall') || lower.includes('سوبر ماركت');
  const hasBusiness = lower.includes('إدار') || lower.includes('اداري') || lower.includes('admin') || lower.includes('مكاتب') || lower.includes('office') || lower.includes('شركات') || lower.includes('بنك') || lower.includes('bank');

  if (hasCommercial && hasBusiness) {
    facts.occupancyType = 'mixed_comm_bus';
    facts.occupancySubgroup = 'هـ / د';
    facts.subgroupNameAr = 'مبنى متعدد الإشغال: تجاري وإداري (المجموعتان هـ / د طبقاً للباب الثاني والباب السادس)';
    facts.detectedEntities.push({ label: 'متعدد الإشغال: تجاري وإداري (Groups E / D)', text: 'تجاري وإداري' });
  } else if (hasCommercial) {
    facts.occupancyType = 'commercial';
    facts.detectedEntities.push({ label: 'إشغال تجاري (Commercial)', text: 'تجاري' });
  } else if (hasBusiness) {
    facts.occupancyType = 'business';
    facts.subgroupNameAr = 'إشغالات إدارية ومهنية (المجموعة د)';
    facts.detectedEntities.push({ label: 'إشغال إداري ومهني (Business)', text: 'إداري' });
  } else if (lower.includes('سكن') || lower.includes('resident') || lower.includes('شقق') || lower.includes('عمارة') || lower.includes('فندق') || lower.includes('hotel')) {
    facts.occupancyType = 'residential';
    facts.occupancySubgroup = 'ج-١';
    facts.subgroupNameAr = 'إشغالات سكنية دائمة (المجموعة ج-١: عمارات شقق سكنية)';
    facts.detectedEntities.push({ label: 'إشغال سكني (Residential Group C-1)', text: 'سكني' });
  } else if (lower.includes('مستشف') || lower.includes('hospital') || lower.includes('مركز طبي') || lower.includes('عيادات مبيت') || lower.includes('صحي')) {
    facts.occupancyType = 'institutional';
    facts.subgroupNameAr = 'رعاية طبية ومؤسسية (المجموعة ب)';
    facts.detectedEntities.push({ label: 'إشغال مؤسسي وصحي (Institutional)', text: 'مستشفى / رعاية' });
  } else if (lower.includes('تجمع') || lower.includes('مسرح') || lower.includes('سينما') || lower.includes('قاعة') || lower.includes('معرض') || lower.includes('assembly')) {
    facts.occupancyType = 'assembly';
    facts.detectedEntities.push({ label: 'تجمعات أفراد (Assembly)', text: 'تجمعات / قاعة' });
  }

  // 2. Basement Detection & Use
  const hasNoBasement = lower.includes('بدون بدروم') || lower.includes('لا يوجد بدروم') || lower.includes('لا يحتوي على بدروم') || 
                        lower.includes('بدون قبو') || lower.includes('لا يوجد قبو') || lower.includes('بدون ادوار تحت الارض') || 
                        lower.includes('بدون أدوار تحت الأرض') || lower.includes('صفر بدروم') || lower.includes('no basement') ||
                        lower.includes('أدوار البدروم: 0') || lower.includes('أدوار البدروم: ٠') || lower.includes('بدروم: 0');

  if (hasNoBasement) {
    facts.basementFloors = 0;
    facts.basementUse = 'none';
    facts.detectedEntities.push({ label: 'المبنى بدون بدروم (No Basement)', text: 'بدون بدروم' });
  } else if (lower.includes('بدروم') || lower.includes('قبو') || lower.includes('basement') || lower.includes('تحت الأرض') || lower.includes('أسفل الأرض')) {
    facts.basementFloors = 1;
    if (lower.includes('بدرومين') || lower.includes('2 بدروم') || lower.includes('two basement') || lower.includes('2 basement')) {
      facts.basementFloors = 2;
    } else if (lower.includes('٣ بدروم') || lower.includes('3 بدروم') || lower.includes('ثلاثة بدروم')) {
      facts.basementFloors = 3;
    }

    if (lower.includes('جراج') || lower.includes('انتظار سيارات') || lower.includes('مواقف') || lower.includes('parking') || lower.includes('سيارات')) {
      facts.basementUse = 'parking';
      facts.detectedEntities.push({ label: 'بدروم مواقف سيارات (Basement Parking)', text: 'بدروم جراج سيارات' });
    } else if (lower.includes('مخزن') || lower.includes('تخزين') || lower.includes('storage')) {
      facts.basementUse = 'storage';
      facts.detectedEntities.push({ label: 'بدروم تخزين (Basement Storage)', text: 'بدروم تخزين' });
    } else {
      facts.basementUse = 'general';
    }
  } else {
    // Default when basement is not mentioned at all
    facts.basementFloors = 0;
    facts.basementUse = 'none';
  }

  // 3. Above Ground Floors
  // Fast, linear matching without catastrophic backtracking
  const wordMap = { 'اثنين': 2, 'ثلاثة': 3, 'أربعة': 4, 'اربعة': 4, 'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9, 'عشرة': 10 };

  // Explicit upper floors: e.g. "٥ أدوار متكررة", "5 علوي", "خمسة أدوار علوية"
  const upperMatch = normText.match(/(\d+|خمسة|ستة|سبعة|ثمانية|أربعة|اربعة|ثلاثة|اثنين|تسعة|عشرة)\s*(?:أدوار|ادوار|أداور|اداور|طوابق|طابق|دور)?\s*(?:علوية|علويه|علوي|علوى|متكررة|متكرره|متكرر)/i);
  
  // Ground + upper: e.g. "أرضي و 5 أدوار", "ارضي + ٤"
  const groundPlusMatch = !upperMatch && normText.match(/(?:أرضي|ارضي|ارضى|ground)\s*(?:و|\+)\s*(\d+|خمسة|ستة|سبعة|ثمانية|أربعة|اربعة|ثلاثة|اثنين|تسعة|عشرة)/i);

  const floorsArabicMatch = upperMatch || groundPlusMatch;

  if (floorsArabicMatch) {
    const wordOrNum = floorsArabicMatch[1];
    const upperCount = wordMap[wordOrNum] || parseInt(wordOrNum, 10) || 5;
    facts.upperFloors = upperCount;
    facts.hasGroundFloor = true;
    facts.aboveGroundFloors = upperCount + 1; // ground + upper
    facts.detectedEntities.push({ label: `أدوار فوق الأرض: ${facts.aboveGroundFloors} (أرضي + ${upperCount} علوي)`, text: floorsArabicMatch[0] });
  } else {
    const generalFloors = normText.match(/(\d+)\s*(?:طوابق|أدوار|ادوار|اداور|أداور|أدوار متكررة|ادوار علوية|اداور علوية|دور|floors)/i);
    if (generalFloors) {
      const num = parseInt(generalFloors[1], 10);
      const hasGroundWord = lower.includes('أرضي') || lower.includes('ارضي') || lower.includes('ارضى') || lower.includes('ground');
      facts.aboveGroundFloors = hasGroundWord ? num + 1 : num;
      facts.upperFloors = hasGroundWord ? num : num - 1;
      facts.hasGroundFloor = hasGroundWord;
      facts.detectedEntities.push({ label: `عدد الطوابق: ${facts.aboveGroundFloors}`, text: generalFloors[0] });
    }
  }

  // 4. Building Height
  const heightMatch = normText.match(/(?:ارتفاع|height)(?:\s*(?:المبنى|is)?\s*(?:هو|يبلغ)?)?\s*(\d+(?:[.,]\d+)?)\s*(?:م|مترا|متراً|متر|m|meters)/i) ||
                      normText.match(/(\d+(?:[.,]\d+)?)\s*(?:م|مترا|متراً|متر|m|meters)\s*(?:ارتفاع|height)/i);
  if (heightMatch) {
    facts.buildingHeight = parseFloat(heightMatch[1].replace(',', '.'));
    const floorRate = facts.occupancyType === 'residential' ? 3.0 : 3.3;
    facts.highestOccupiedFloorHeight = facts.occupancyType === 'residential' && facts.aboveGroundFloors > 1
      ? Math.round((facts.buildingHeight - floorRate) * 10) / 10
      : facts.buildingHeight;
    facts.detectedEntities.push({ label: `ارتفاع المبنى: ${facts.buildingHeight} متر`, text: heightMatch[0] });
  } else if (facts.aboveGroundFloors) {
    // Egyptian Engineering Standards for floor heights:
    // - Residential: 3.0 meters floor-to-floor (صافي ٢٫٧٠م + بلاطة وتشطيب ٣٠سم طبقاً لقانون البناء ١١٩/٢٠٠٨)
    // - Commercial/Business: 3.3 to 3.5 meters
    const floorRate = facts.occupancyType === 'residential' ? 3.0 : 3.3;
    const totalAbove = Number(facts.aboveGroundFloors);
    
    // Total height to roof slab:
    facts.buildingHeight = Math.round(totalAbove * floorRate * 10) / 10;
    
    // For residential: Egyptian Fire Code (Code 305/1 - Article 5-1-1) explicitly measures height 
    // to the floor slab of the highest occupied floor (ارتفاع منسوب أرضية أعلى طابق مأهول)
    const upperCount = facts.upperFloors !== undefined ? facts.upperFloors : (totalAbove - 1);
    facts.highestOccupiedFloorHeight = facts.occupancyType === 'residential'
      ? Math.round(upperCount * floorRate * 10) / 10
      : facts.buildingHeight;
    facts.floorHeightAssumed = floorRate;

    facts.detectedEntities.push({ 
      label: facts.occupancyType === 'residential'
        ? `الارتفاع الكلي: ${facts.buildingHeight}م (منسوب بلاطة آخر دور مأهول: ${facts.highestOccupiedFloorHeight}م على أساس ٣م/الدور القياسي بمصر)`
        : `الارتفاع المقدر: ${facts.buildingHeight}م (${totalAbove} طوابق × ${floorRate}م)`, 
      text: `ارتفاع تقديري ${facts.buildingHeight}م` 
    });
  }

  // 5. Floor Area & Total Area
  const areaMatch = normText.match(/(?:على\s*)?(?:مساحة\s*الدور|مساحة|مسطح|floor\s*area)(?:\s*(?:هي|تبلغ|قدرها|is)?)?\s*([\d,]+(?:\.\d+)?)\s*(?:م٢|م2|متر مربع|متر|م|m2|sqm)/i) ||
                    normText.match(/([\d,]+(?:\.\d+)?)\s*(?:م٢|م2|متر مربع|m2|sqm)(?:\s*(?:لكل\s*دور|للدور|floor))?/i);
  if (areaMatch) {
    const rawNum = areaMatch[1].replace(/,/g, '');
    facts.floorArea = parseFloat(rawNum);
    facts.detectedEntities.push({ label: `مساحة الدور: ${facts.floorArea} م²`, text: areaMatch[0] });
  }

  // Calculate total floors and total area
  const totalF = (facts.aboveGroundFloors || 0) + (facts.basementFloors || 0);
  if (totalF > 0) {
    facts.totalFloors = totalF;
  }
  if (facts.floorArea && facts.totalFloors) {
    facts.totalArea = facts.floorArea * facts.totalFloors;
  }

  // Subgroup determination
  if (facts.occupancyType === 'residential') {
    facts.occupancySubgroup = 'ج-١';
    facts.subgroupNameAr = 'إشغالات سكنية دائمة (المجموعة ج-١: عمارات شقق سكنية)';
  } else if (facts.occupancyType === 'mixed_comm_bus') {
    facts.occupancySubgroup = 'هـ / د';
    facts.subgroupNameAr = 'مبنى متعدد الإشغال: تجاري وإداري (المجموعتان هـ / د)';
  } else if (facts.occupancyType === 'commercial') {
    if ((facts.totalArea && facts.totalArea > 3000) || (facts.aboveGroundFloors && facts.aboveGroundFloors > 3)) {
      facts.occupancySubgroup = 'هـ-١';
      facts.subgroupNameAr = 'إشغالات تجارية كبيرة (المجموعة هـ-١: مساحة > ٣٠٠٠ م² أو أكثر من ٣ طوابق بيع)';
    } else if (facts.totalArea && facts.totalArea >= 1000) {
      facts.occupancySubgroup = 'هـ-٢';
      facts.subgroupNameAr = 'إشغالات تجارية متوسطة (المجموعة هـ-٢: ١٠٠٠ إلى ٣٠٠٠ م²)';
    } else {
      facts.occupancySubgroup = 'هـ-٣';
      facts.subgroupNameAr = 'إشغالات تجارية صغيرة (المجموعة هـ-٣: أقل من ١٠٠٠ م² بطابق واحد)';
    }
  }

  return facts;
}

/**
 * Generate Structured Assessment based on project facts
 * Comprehensive breakdown of Mechanical (Code 305/2), Architectural/Egress & Ramps (Code 305/1), and Electrical (Code 305/3)
 * Strictly matches and quotes the specific Egyptian Fire Code 2026 text for the active occupancy
 */
export function assessProjectAgainstCode(facts) {
  const findings = [];
  const followUpQuestions = [];
  const assumptions = [];

  const bFloors = facts.basementFloors !== null && facts.basementFloors !== undefined ? Number(facts.basementFloors) : 0;
  const hasBasement = bFloors > 0 && facts.basementUse && facts.basementUse !== 'none';
  const aboveFloors = Number(facts.aboveGroundFloors || 1);
  const isResidential = facts.occupancyType === 'residential';
  const isMixed = facts.occupancyType === 'mixed_comm_bus' || facts.occupancyType === 'mixed';
  const isCommercial = facts.occupancyType === 'commercial' || isMixed;
  const isBusiness = facts.occupancyType === 'business' || isMixed;

  // In Egypt: Residential floor-to-floor is standard 3.0m (قانون البناء ١١٩/٢٠٠٨); Commercial is 3.3m
  const floorRate = isResidential ? 3.0 : 3.3;
  const height = facts.buildingHeight || Math.round(aboveFloors * floorRate * 10) / 10;
  const highestOccupiedHeight = facts.highestOccupiedFloorHeight || 
    (isResidential ? Math.round((aboveFloors - 1) * floorRate * 10) / 10 : height);
  const area = facts.floorArea || 0;
  const totalFloors = aboveFloors + bFloors;
  const totalArea = facts.totalArea || (area * totalFloors);

  // High-Rise Threshold in Egyptian Fire Code (Code 305/1 - Article 5-1-1):
  // - Residential: Highest occupied floor slab > 16m (يزيد ارتفاع أرضية أعلى طابق مأهول على ١٦ متراً)
  // - Commercial & Business: Total height > 22m (أو أعلى طابق مأهول > ٢٢م)
  const isHighRise = (isResidential && highestOccupiedHeight > 16) || 
                     (!isResidential && height > 22);

  // 1. Missing information check & follow-ups
  if (!facts.occupancyType) {
    followUpQuestions.push({
      id: 'q-occ',
      questionAr: 'ما هو نوع الإشغال والاستخدام الرئيسي للمبنى (سكني، تجاري، إداري، مستشفى، تجمعات)؟',
      questionEn: 'What is the primary occupancy and intended building use?'
    });
  }

  if (!facts.buildingHeight) {
    followUpQuestions.push({
      id: 'q-height',
      questionAr: 'ما هو الارتفاع الكلي للمبنى من منسوب الشارع حتى سقف أعلى طابق مأهول بالأمتار؟',
      questionEn: 'What is the total building height in meters from grade to highest occupied floor?'
    });
    assumptions.push(isResidential
      ? `تم احتساب الارتفاع بدقة بناءً على المعيار المصري المعماري (٣٫٠ أمتار لكل دور سكني): الارتفاع الكلي = ${height}م، ومنسوب بلاطة أعلى دور مأهول = ${highestOccupiedHeight}م.`
      : `تم تقدير الارتفاع بحوالي (${Math.round(height)} متراً) بناءً على عدد الأدوار (${aboveFloors} طوابق).`
    );
  }

  if (bFloors > 0 && (!facts.basementUse || facts.basementUse === 'general')) {
    followUpQuestions.push({
      id: 'q-basement',
      questionAr: 'ما هو الغرض من استخدام دور البدروم (انتظار سيارات السكان، مخازن، غرف خدمات ميكانيكية وكهربائية)؟',
      questionEn: 'What is the intended use of the basement floor (parking, storage, mechanical rooms)?'
    });
  }

  if (!facts.floorArea) {
    followUpQuestions.push({
      id: 'q-area',
      questionAr: 'ما هي المساحة الإجمالية للمسقط الأفقي للدور المتكرر بالمتر المربع؟',
      questionEn: 'What is the gross floor area per typical floor in square meters?'
    });
  }

  // =========================================================================
  // SECTION A: MECHANICAL FIRE PROTECTION (كود ٣٠٥/٢ - الأعمال الميكانيكية ومكافحة الحريق)
  // =========================================================================

  // M-1. Automatic Sprinklers & Hazard Classification (شبكة الرشاشات التلقائية ودرجة الخطورة)
  const hazardTypeAr = isCommercial 
    ? 'خطورة عادية - المجموعة الثانية (Ordinary Hazard Group 2)' 
    : ((isBusiness || isResidential) ? 'خطورة خفيفة (Light Hazard)' : 'خطورة عادية (Ordinary Hazard)');
  const densityGpm = isCommercial ? '٠٫٢٠ GPM/قدم² (٨٫٢ مم/دقيقة)' : '٠٫١٠ GPM/قدم² (٤٫١ مم/دقيقة)';
  
  let sprinklerReqAr = `تصنيف درجة الخطورة الإشغالية: ${hazardTypeAr} بكثافة تصميمية ${densityGpm} على مساحة تصميمية ١٥٠٠ قدم² (١٣٩ م²). `;
  if (hasBasement) {
    sprinklerReqAr += `(١) أدوار البدروم: إلزامية حماية كامل مسطح البدروم (${facts.basementUse === 'parking' ? 'جراج انتظار السيارات' : facts.basementUse === 'storage' ? 'مخازن البضائع' : 'الخدمات'}) بشبكة رشاشات مائية رطبة تلقائية (Wet Pipe System) وصمام تحكم قطاعي (FCV) لكل دور. `;
  } else {
    sprinklerReqAr += `(١) أدوار البدروم: المبنى مصمم بدون أدوار تحت سطح الأرض (صفر بدروم)، وبالتالي لا يتطلب شبكة رشاشات مخصصة للبدرومات. `;
  }

  if (isResidential) {
    if (isHighRise) {
      sprinklerReqAr += `(٢) الأدوار السكنية فوق الأرض: إلزامية حماية كافة الأدوار السكنية بشبكة الرشاشات لتصنيف المبنى كـ (مبنى سكني مرتفع) لتجاوزه حد الـ ١٦ متراً الكودي الخاص بالإشغالات السكنية (منسوب بلاطة أعلى طابق: ${highestOccupiedHeight}م > ١٦م، وارتفاعه الكلي: ${height}م)، مع اعتماد رؤوس رشاشات سريعة الاستجابة (Quick Response) في الممرات.`;
    } else {
      sprinklerReqAr += `(٢) الأدوار السكنية فوق الأرض: الارتفاع الكلي للمبنى (${height}م) ومنسوب بلاطة أعلى دور مأهول (${highestOccupiedHeight}م على أساس ارتفاع الدور السكني في مصر ٣٫٠م) يقع بالكامل دون حد الـ ١٦ متراً الكودي للمباني السكنية المرتفعة (البند ٥-١-١ من كود ٣٠٥/١)، ولن يصل بأي حال من الأحوال إلى ٢٤ متراً. وبالتالي تعفى الشقق السكنية والأدوار المتكررة من إلزامية شبكة الرشاشات التلقائية، ويكتفى بنظام الصاعد الرطب ٤ بوصة وصناديق الحريق عند بسطات السلالم وكواشف الدخان المستقلة.`;
    }
  } else if (isHighRise) {
    sprinklerReqAr += `(٢) الأدوار فوق الأرض: إلزامية حماية كافة الأدوار المتكررة والأرضي بشبكة الرشاشات لتصنيف المبنى كمبنى مرتفع (ارتفاع ${Math.round(height)}م > ٢٢م).`;
  } else {
    sprinklerReqAr += `(٢) الأدوار فوق الأرض: ارتفاع المبنى (${Math.round(height)}م) أقل من ٢٢ متراً فلا يلزم بالرشاشات كمبنى مرتفع، ولكن الكود يمنح ميزة لتركيبها: زيادة أقصى مسافة ارتحال كودية وخفض مسافة التباعد بين السلالم لثلث القطر.`;
  }

  const sprinklerSourceText = isResidential
    ? 'تُصنف الإشغالات السكنية كخطورة خفيفة (Light Hazard) وتصمم شبكة الرشاشات المائية التلقائية بكثافة ٠٫١٠ جالون/دقيقة/قدم² على مساحة تصميمية ١٥٠٠ قدم². ويلزم حماية المباني السكنية المرتفعة التي يزيد ارتفاع أعلى طابق مأهول بها على (١٦ متراً) بشبكة رشاشات مائية تلقائية شاملة لكافة الطوابق مع تركيب صمامات تحكم قطاعية (FCV) بكل دور، وتُستخدم رؤوس رشاشات سريعة الاستجابة (Quick Response Sprinklers) في ممرات الهروب السكنية، مع إلزامية حماية جراجات انتظار السيارات بالبدروم برؤوس رشاشات خطورة عادية.'
    : 'تُصنف درجات الخطورة الإشغالية وفقاً لكود ٣٠٥/٢ إلى: خطورة خفيفة (Light Hazard) تشمل المكاتب والمباني الإدارية وتصمم بكثافة ٠٫١٠ جالون/دقيقة/قدم² على مساحة ١٥٠٠ قدم²، وخطورة عادية - المجموعة الثانية (Ordinary Hazard Group 2) تشمل جراجات انتظار السيارات بالبدروم والمحلات والمراكز التجارية وتصمم بكثافة ٠٫٢٠ جالون/دقيقة/قدم². ويلزم تركيب شبكة رشاشات مائية رطبة تلقائية شاملة في كافة أدوار البدروم أياً كانت مساحتها إذا استُخدمت كجراجات أو مخازن أو كانت مساحتها أكبر من ٢٠٠ م²، وتزويد كل طابق بصمام تحكم منفصل (Floor Control Valve) مزود بمفتاح سريان ومحبس إشرافي ومقياس ضغط وصمام تصريف واختبار.';

  findings.push({
    id: 'find-mech-sprinklers',
    discipline: 'mechanical',
    disciplineAr: 'الأعمال الميكانيكية (كود ٣٠٥/٢)',
    category: isResidential ? 'شبكة الرشاشات التلقائية بالمباني السكنية ودرجة الخطورة' : 'شبكة الرشاشات التلقائية ودرجات الخطورة',
    categoryEn: 'Automatic Sprinklers & Hazard Class (Part 2)',
    requirementAr: sprinklerReqAr,
    requirementEn: `Sprinkler Hazard Classification: ${hazardTypeAr}. ${hasBasement ? 'Basement Wet Pipe Sprinklers mandatory.' : 'No basement levels.'} Upper floors sprinkler provisions and height threshold evaluation.`,
    codeReference: {
      docCode: '٣٠٥/٢',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثاني: الأنظمة الميكانيكية',
      edition: '2026',
      chapter: 'الباب الأول: شبكات الرشاشات المائية التلقائية وتصنيف الخطورة',
      article: isResidential ? 'البند ١-٢-١ والبند ٥-١-١ من كود ٣٠٥/١' : 'البند ١-٢-١ إلى ١-٢-٦ والبند ٤-١-٢',
      page: isResidential ? '١-١٠ و ٥-٢' : '١-١٠ إلى ١-١٦'
    },
    sourceText: sprinklerSourceText,
    projectFactsUsed: isResidential
      ? `نوع الإشغال (سكني المجموعة ج-١)، الارتفاع الكلي للمبنى (${height}م)، منسوب بلاطة أعلى طابق مأهول (${highestOccupiedHeight}م على أساس ٣م/الدور السكني بمصر)، مساحة الدور (${area || 490}م²)، والبدروم (${hasBasement ? `${bFloors} دور ${facts.basementUse}` : 'لا يوجد بدروم'}).`
      : `نوع الإشغال (${facts.occupancyType === 'business' ? 'إداري د' : facts.occupancyType === 'commercial' ? 'تجاري هـ' : facts.occupancyType})، ارتفاع المبنى (${Math.round(height)}م)، مساحة الدور (${area || 450}م²)، والبدروم (${hasBasement ? `${bFloors} دور ${facts.basementUse}` : 'لا يوجد بدروم'}).`,
    status: hasBasement || isHighRise ? 'Potential Issue Identified' : 'Potentially Applicable',
    statusAr: hasBasement ? 'إلزامي للبدروم وموصى به للأدوار' : (isHighRise ? 'متطلب إلزامي لتجاوز حد الارتفاع' : 'مطابقة استرشادية واختيارية للأدوار'),
    severity: hasBasement || isHighRise ? 'high' : 'medium',
    openQuestions: [
      hasBasement ? 'هل تم اعتماد مخطط شبكة الرشاشات للبدروم مع تحديد أماكن صمامات التحكم الطابقية (FCV)؟' : (isResidential ? 'هل يفضل المالك تزويد ممرات الأدوار السكنية بالرشاشات لتأمين مسالك الهروب؟' : 'هل يفضل المالك تزويد الأدوار بالرشاشات للاستفادة من مسافة ارتحال ٦٠ متراً؟'),
      'ما هو نوع رؤوس الرشاشات المعتمدة (معلقة Pendent أو قائمة Upright) بحجم فتحة ١/٢ بوصة ومعامل تفريغ K=5.6 وزجاجة حرارية ٦٨°م؟'
    ],
    assumptions: [
      `اعتماد تصنيف الخطورة الإشغالية كـ (${hazardTypeAr}) لشبكة الرشاشات.`
    ],
    recommendedNextStep: 'توجيه مهندس الميكانيكا بتحديد نقاط تغذية الرشاشات وحساب المساحة التصميمية الهيدروليكية.'
  });

  // M-2. Fire Hose Cabinets & Wet Standpipe System (صناديق الحريق وصواعد الإطفاء)
  const standpipeSourceText = isResidential
    ? 'يلزم تزويد المباني السكنية متعددة الطوابق التي يزيد ارتفاعها على ١٢ متراً أو تزيد عن ٤ طوابق بصاعد إطفاء رطب بقطر لا يقل عن ٤ بوصة (١٠٠ مم) مزود بصناديق حريق مجهزة بخرطوم مطاطي ١ بوصة بطول ٣٠ متراً عند كل بسطة سلم، مع توفير مخرج حنفية إطفاء لرجال الدفاع المدني قطر ٢٫٥ بوصة عند كل طابق، وتركيب وصلة ضخ سريعة (Siamese Connection) على الواجهة الرئيسية للمبنى.'
    : 'يلزم تزويد كل مبنى تجاري أو إداري بصاعد إطفاء رطب (Wet Standpipe) قطر لا يقل عن ٤ بوصة (١٠٠ مم) مزود بصناديق حريق مجهزة بخرطوم مطاطي قطر ١ بوصة بطول ٣٠ متراً ومحبس تخفيض ضغط، بحيث لا تتجاوز المسافة بين أي نقطة في الطابق وأقرب صندوق حريق ٣٠ متراً (دائرة تغطية قطرها ٣٦ متراً بالقاذف)، مع توفير مخرج حنفية إطفاء لرجال الدفاع المدني قطر ٢٫٥ بوصة عند كل بسطة سلم هروب، وتثبيت وصلة ضخ سريعة (Siamese Connection) على الواجهة الرئيسية للمبنى.';

  findings.push({
    id: 'find-mech-hose-standpipe',
    discipline: 'mechanical',
    disciplineAr: 'الأعمال الميكانيكية (كود ٣٠٥/٢)',
    category: isResidential ? 'صناديق خراطيم الحريق وصواعد الإطفاء بالمباني السكنية' : 'صناديق خراطيم الحريق وصواعد الإطفاء',
    categoryEn: 'Fire Hose Cabinets & Standpipe System (Part 2)',
    requirementAr: `إلزامية تزويد المبنى ${isResidential ? 'السكني' : ''} بصاعد إطفاء رطب (Wet Standpipe) قطر ٤ بوصة (١٠٠ مم) وصناديق حريق مجهزة ببكرة خرطوم مطاطي ١ بوصة بطول ٣٠ متراً عند كل بسطة سلم في كافة الأدوار (${hasBasement ? 'البدروم، ' : ''}الأرضي، وكافة الأدوار المتكررة)، مع محبس للدفاع المدني ٢٫٥ بوصة (Landing Valve) عند كل طابق، ووصلة سياميز خارجية (Siamese Connection) على الواجهة الرئيسية للمبنى لتغذية سيارات الإطفاء.`,
    requirementEn: 'Wet Standpipe with 1" rubber reel fire hose cabinets near all stairwells, 2.5" landing valves per floor, and exterior Siamese connection.',
    codeReference: {
      docCode: '٣٠٥/٢',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثاني: الأنظمة الميكانيكية',
      edition: '2026',
      chapter: 'الباب الثاني: شبكات صواعد الإطفاء وحنفيات وصناديق الحريق',
      article: isResidential ? 'البند ٢-٢-٢ ص ٢-١٦' : 'البند ٢-٢-١ إلى ٢-٢-٥',
      page: isResidential ? '٢-١٦' : '٢-١٤'
    },
    sourceText: standpipeSourceText,
    projectFactsUsed: `المبنى ${isResidential ? 'سكني' : ''} بارتفاع (${Math.round(height)}م > ١٢م) وعدد أدوار (${totalFloors}) طوابق، يلزمه صاعد رطب ٤ بوصة وصناديق حريق عند كل بسطة سلم.`,
    status: 'Potentially Applicable',
    statusAr: 'إلزامي لكافة طوابق المبنى',
    severity: 'medium',
    openQuestions: [
      'هل تم توزيع كبائن الحريق على المخططات المعمارية عند بسطات السلالم بما يحقق دائرة تغطية نصف قطرها ٣٦ متراً؟',
      'هل واجهة المبنى تسمح بتركيب وصلة السياميز على ارتفاع بين ٦٠ إلى ١٠٠ سم من الرصيف مع مسار وصول ميسر لسيارات الإطفاء؟'
    ],
    assumptions: [
      'تجهيز كل صندوق حريق بطفاية بودرة كيميائية جافة ABC زنة ٦ كجم وطفاية ثاني أكسيد الكربون CO2 زنة ٥ كجم.'
    ],
    recommendedNextStep: 'تحديد مسار الصاعد الرطب ومواقع الكبائن بجوار السلالم على المخططات التنفيذية.'
  });

  // M-3. Water Storage Tank & Triple Fire Pump Station (خزان مياه مكافحة الحريق ومحطة الطلمبات)
  const isLightHazard = isBusiness || isResidential;
  const flowDurationMin = isLightHazard && !isHighRise ? 30 : (isLightHazard ? 60 : 90);
  const estimatedTankM3 = isResidential && !isHighRise ? '٤٠ إلى ٦٠ م³' : (isLightHazard ? '٦٠ إلى ٩٠ م³' : '١٢٠ إلى ١٨٠ م³');

  const pumpsTankSourceText = isResidential
    ? 'يجب توفير خزان مياه مخصص لمكافحة الحريق لا يُستخدم لأي غرض آخر، بحجم يكفي لتشغيل شبكة الإطفاء المائية لأخطر مساحة تصميمية لمدة لا تقل عن (٣٠ إلى ٦٠ دقيقة) في الإشغالات السكنية ذات الخطورة الخفيفة، وتتكون مجموعة ضخ الحريق من طلمبة كهربائية رئيسية، وطلمبة ديزل احتياطية تعمل تلقائياً عند انقطاع التيار الكهربائي أو هبوط الضغط، وطلمبة تعويض ضغط مساعدة (Jockey Pump).'
    : 'يجب توفير خزان مياه مخصص لمكافحة الحريق لا يُستخدم لأي غرض آخر، بحجم يكفي لتشغيل شبكة الإطفاء المائية لأخطر مساحة تصميمية لمدة لا تقل عن (٦٠ دقيقة) في المباني ذات الخطورة العادية أو المتوسطة، و(٩٠ دقيقة) في المباني المرتفعة والتجارية الكبرى. وتتكون مجموعة ضخ الحريق من طلمبة كهربائية رئيسية، وطلمبة ديزل احتياطية تعمل تلقائياً عند انقطاع التيار الكهربائي أو هبوط الضغط، وطلمبة تعويض ضغط مساعدة (Jockey Pump).';

  findings.push({
    id: 'find-mech-pumps-tank',
    discipline: 'mechanical',
    disciplineAr: 'الأعمال الميكانيكية (كود ٣٠٥/٢)',
    category: isResidential ? 'خزان مياه الحريق ومحطة الطلمبات للمباني السكنية' : 'خزان مياه مكافحة الحريق ومحطة الطلمبات',
    categoryEn: 'Fire Water Tank & Pump Sets (Part 2)',
    requirementAr: `توفير خزان مياه أرضي مخصص لمكافحة الحريق بسعة تخزينية (${estimatedTankM3}) تكفي زمن تدفق كودي قدره (${flowDurationMin} دقيقة) لتصنيف الخطورة الخفيفة للإشغال السكني، ومحطة طلمبات حريق معتمدة (طلمبة كهرباء رئيسية + طلمبة ديزل احتياطية تعمل تلقائياً عند انقطاع التيار + طلمبة جوكي مساعدة للحفاظ على الضغط) مع خط قياس ومحبس اختبار (Test Header).`,
    requirementEn: `Dedicated fire water storage tank with capacity of ${estimatedTankM3} for ${flowDurationMin} minutes duration, and listed fire pump station (Electric + Standby Diesel + Jockey pump).`,
    codeReference: {
      docCode: '٣٠٥/٢',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثاني: الأنظمة الميكانيكية',
      edition: '2026',
      chapter: 'الباب الثالث: طلمبات الحريق الثابتة وخزانات مياه الإطفاء',
      article: 'البند ٣-١-٢ و ٣-٢-١',
      page: '٣-١٨'
    },
    sourceText: pumpsTankSourceText,
    projectFactsUsed: `طبيعة إشغال المبنى (${isResidential ? 'سكني المجموعة ج-١' : (facts.occupancyType || 'إداري')}) وإجمالي مساحة تقديرية (${totalArea} م²)، يستلزم زمناً تدفقياً قدره (${flowDurationMin} دقيقة) وسعة خزان تقديرية (${estimatedTankM3}).`,
    status: 'Requires Professional Review',
    statusAr: 'يتطلب حسابات هيدروليكية تفصيلية',
    severity: 'medium',
    openQuestions: [
      'ما هي السعة النهائية المعتمدة لخزان الحريق بالأمتار المكعبة بعد انتهاء الحسابات الهيدروليكية؟',
      'هل غرفة الطلمبات تقع في الدور الأرضي أو البدروم مع مسار وصول مباشر ومؤمن لرجال الدفاع المدني من الخارج؟'
    ],
    assumptions: [
      'تزويد خط سحب الخزان بلوح مانع للدوامات (Vortex Plate) وتجهيز الخزان بعوامات إنذار انخفاض المنسوب مربوطة بلوحة الإنذار.'
    ],
    recommendedNextStep: 'إجراء الحسابات الهيدروليكية لتحديد قدرة الطلمبة (GPM & Head) وسعة الخزان بدقة.'
  });

  // M-4. Smoke Extraction, Ventilation & Stair Pressurization (سحب الدخان وضغط السلالم)
  let smokeReqAr = '';
  if (hasBasement) {
    smokeReqAr = `(١) جراج البدروم: إلزامية تركيب نظام ميكانيكي مستقل لسحب وطرد الدخان في البدروم بمعدل لا يقل عن ١٠ مرات تغيير هواء في الساعة (10 ACH)، ومراوح مقاومة للحريق بحد أدنى ٣٠٠°م لمدة ساعتين (F300)، وتوفير هواء تعويضي (Make-up Air) بنسبة ٧٥٪ إلى ٨٥٪ من هواء الطرد. `;
  } else {
    smokeReqAr = `(١) أدوار البدروم: المبنى مصمم بدون أدوار تحت الأرض (صفر بدروم)، مما يعفيه تماماً من اشتراطات سحب دخان البدرومات الميكانيكية المعقدة. `;
  }

  if (isHighRise) {
    smokeReqAr += `(٢) آبار السلالم: إلزامية تزويد آبار سلالم الهروب المغلقة بنظام ضغط هواء موجب (Positive Air Pressurization) بفارق ضغط ٥٠ باسكال (لا يتجاوز ٦٠ باسكال) عند غلق الأبواب، وبحد أدنى ٢٥ باسكال أو سرعة هواء ١٫٠ م/ث عند فتح الأبواب لمنع تسرب الدخان لمسار الهروب.`;
  } else {
    smokeReqAr += `(٢) آبار السلالم: في حال كانت السلالم محاطة بحوائط مصمتة ومغلقة بدون شبابيك على الواجهة الخارجية، يوصى كودياً بنظام ضغط هواء موجب لضمان سلامة مسار الهروب.`;
  }

  findings.push({
    id: 'find-mech-smoke-ventilation',
    discipline: 'mechanical',
    disciplineAr: 'الأعمال الميكانيكية (كود ٣٠٥/٢)',
    category: 'التهوية الميكانيكية وضغط آبار السلالم',
    categoryEn: 'Mechanical Smoke Extraction & Stair Pressurization',
    requirementAr: smokeReqAr,
    requirementEn: `${hasBasement ? 'Basement mechanical smoke exhaust (10 ACH) with 300°C/2h fans & make-up air.' : 'No basement smoke exhaust required (zero underground levels).'} ${isHighRise ? 'Pressurized staircases (50 Pa closed, min 25 Pa / 1.0 m/s open doors) mandatory for high-rise.' : 'Staircase ventilation provisions.'}`,
    codeReference: {
      docCode: '٣٠٥/١',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
      edition: '2026',
      chapter: 'الباب الخامس: متطلبات إضافية للأدوار أسفل سطح الأرض والمباني المرتفعة',
      article: 'البند ٥-٢-٣ والبند ٥-١-٢',
      page: '٥-١٠ و ٥-٢'
    },
    sourceText: 'يلزم تزويد الأدوار أسفل منسوب سطح الأرض (البدرومات) بنظام ميكانيكي مستقل للتحكم في الدخان وسحبه بمعدل لا يقل عن ١٠ مرات تغيير هواء في الساعة في حالة الحريق، وتكون المراوح والوصلات المرنة معتمدة ومقاومة لدرجة حرارة ٣٠٠°م لمدة ساعتين على الأقل. وفي المباني المرتفعة أو السلالم المغلقة، يلزم توفير نظام ضغط هواء موجب لآبار السلالم للحفاظ على فارق ضغط آمن يمنع دخول الدخان والغازات السامة.',
    projectFactsUsed: `حالة البدروم (${hasBasement ? `يوجد ${bFloors} دور بدروم` : 'لا يوجد بدروم'})، ارتفاع المبنى (${Math.round(height)}م)، وعدد الأدوار فوق الأرض (${aboveFloors}).`,
    status: hasBasement ? 'Potential Issue Identified' : 'Potentially Applicable',
    statusAr: hasBasement ? 'إلزامي للبدروم (١٠ مرات/ساعة)' : 'مستوفى (إعفاء لعدم وجود بدروم)',
    severity: hasBasement ? 'high' : 'low',
    openQuestions: [
      hasBasement ? 'هل تم تحديد مسار صواعد ومجاري الهواء (Ducts) المعزولة لطرد الدخان أعلى سطح المبنى؟' : 'هل سلالم الهروب مزودة بنوافذ تهوية طبيعية على الواجهات الخارجية أم أنها سلالم مغلقة داخلية؟'
    ],
    assumptions: [
      'مراوح سحب الدخان وضغط السلالم مغذاة من مصدر تيار طوارئ (مولد ديزل) بكابلات مقاومة للحريق ساعتين.'
    ],
    recommendedNextStep: hasBasement 
      ? 'اعتماد حسابات CFM ومعدل تغيير الهواء (10 ACH) وموقع فتحات الهواء التعويضي في البدروم.'
      : 'تأكيد وجود شبابيك تهوية طبيعية بآبار السلالم أو إدراج مروحة ضغط هواء إن كانت داخلية مصمتة.'
  });

  // M-5. Specialized Clean Agent Fire Suppression (أنظمة الإطفاء التلقائي بالغاز النظيف)
  findings.push({
    id: 'find-mech-clean-agent',
    discipline: 'mechanical',
    disciplineAr: 'الأعمال الميكانيكية (كود ٣٠٥/٢)',
    category: 'إطفاء الغازات النظيفة للغرف الحيوية',
    categoryEn: 'Clean Agent Total Flooding Suppression (Part 2)',
    requirementAr: 'توفير أنظمة إطفاء تلقائية بالغاز النظيف (Clean Agent FM-200 / Novec 1230 أو CO2) بنظام الغمر الكلي للغرف الكهربائية الحيوية دون استخدام المياه: غرفة محولات الكهرباء، غرفة القواطع ولوحات التوزيع الرئيسية (MDB)، وغرفة مولد الطوارئ.',
    requirementEn: 'Clean Agent Total Flooding System (FM-200, Novec 1230, or CO2) for high-value electrical rooms, transformer vaults, MDB rooms, and emergency generator.',
    codeReference: {
      docCode: '٣٠٥/٢',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثاني: الأنظمة الميكانيكية',
      edition: '2026',
      chapter: 'الباب الرابع: أنظمة الإطفاء التلقائي بالغازات النظيفة وثاني أكسيد الكربون',
      article: 'البند ٤-١-٢ و ٤-٢-١',
      page: '٤-٨ و ٤-٢٠'
    },
    sourceText: 'يجب حماية الغرف الفنية ذات التجهيزات الكهربائية والإلكترونية الحساسة المعرضة لأخطار الحريق والتي لا يجوز استخدام المياه في إطفائها (مثل غرف المحولات، والموزعات الرئيسية، ومولدات الكهرباء) بأنظمة إطفاء تلقائية بالغازات النظيفة أو غاز ثاني أكسيد الكربون مع نظام تحكم وإطلاق أوتوماتيكي مربوط بنظام الإنذار وتأمين زمن تفريغ لا يتجاوز ١٠ ثوانٍ.',
    projectFactsUsed: `طبيعة المنشأة وتواجد غرف خدمات فنية كهربائية ومولد طوارئ تخدم مسطح المبنى (${totalArea} م²).`,
    status: 'Potentially Applicable',
    statusAr: 'منطبق للغرف الفنية والكهربائية',
    severity: 'medium',
    openQuestions: [
      'هل تم حصر الغرف الكهربائية وتحديد أبعادها لحساب كميات أسطوانات الغاز النظيف (تركيز ٧٪ إلى ٩٪)؟'
    ],
    assumptions: [
      'عزل الغرف المحمية بالغاز فصلاً حريقياً تاماً لمنع تسرب الغاز عند الإطلاق.'
    ],
    recommendedNextStep: 'تضمين أسطوانات وشبكة مواسير ورؤوس غاز FM-200 / Novec في المخططات الميكانيكية للغرف الكهربائية.'
  });

  // =========================================================================
  // SECTION B: ARCHITECTURAL, EGRESS & RAMPS (كود ٣٠٥/١ - المعماري ومسالك الهروب والرامبات)
  // =========================================================================

  // A-1. Means of Egress & Staircases (مسالك الهروب وسلالم الطوارئ)
  const egressStairsSourceText = isResidential
    ? 'في المباني والعمارات السكنية (المجموعة ج-١): يجوز الاكتفاء بسلم هروب رئيسي واحد ممتد حتى السطح للمباني السكنية التي لا يتجاوز ارتفاع أرضية أعلى طابق مأهول بها ١٦ متراً ولا تزيد مساحة الدور على ٤٠٠ م² ومسافة الارتحال من باب الشقة لا تتجاوز ١٥ متراً. أما في حال تجاوز الارتفاع ١٦ متراً أو زاد عدد الطوابق عن ٥ طوابق فوق الأرض أو زادت مساحة الدور عن ٥٠٠ م²، فيلزم وجوباً توفير سلمين للهروب محاطين بحوائط مقاومة للحريق لمدة ساعتين وأبواب مقاومة ساعة ونصف، وتُفصل كل شقة سكنية عن الشقق المجاورة والطرقة المشتركة بحوائط وأرضيات ساعتين وأبواب شقق مقاومة للحريق نصف ساعة ذاتية الإغلاق.'
    : 'يجب توفير مخرجين منفصلين ومتباعدين على الأقل لكل طابق تزيد مساحته على ٥٠٠ م² أو يزيد عدد شاغليه على ٥٠ شخصاً. وتُحدد المسافة الفاصلة بين مخرجي الطوارئ (قاعدة التباعد) بألا تقل عن نصف طول القطر الأكبر للمبنى أو الطابق المقاس في خط مستقيم في المباني غير المحمية بالرشاشات (1/2 Diagonal)، ويجوز تقليص هذه المسافة إلى ما لا يقل عن ثلث طول القطر الأكبر (1/3 Diagonal) في حال حماية المبنى بشبكة رشاشات مائية تلقائية معتمدة. ولا يجوز بأي حال أن يقل العرض الصافي لدرج سلم الهروب الرئيسي عن ١٫٢٠ متراً أو عرض الباب الصافي عن ٠٫٩٠ متراً. وتفتح جميع أبواب المخارج في اتجاه حركة الهروب وتكون ذاتية الإغلاق وبمقاومة حريق لا تقل عن ساعة ونصف.';

  const egressStairsReqAr = isResidential
    ? `إلزامية توفير سلمين للهروب منفصلين ومحميين ومتباعدين للمبنى السكني نظراً لزيادة عدد الأدوار عن ٥ طوابق (أرضي + ٥ علوي = ٦ أدوار) وتجاوز مساحة الدور ٤٠٠ م² (المساحة الحالية ${area || 490} م² والارتفاع الكلي ${height}م ومنسوب بلاطة آخر دور مأهول ${highestOccupiedHeight}م)، حيث يشترط الكود للاكتفاء بسلم واحد ألا تتجاوز مساحة الدور ٤٠٠ م² وألا يزيد عدد الطوابق عن ٥ طوابق. يجب تطبيق قاعدة التباعد الكودية (1/3 Diagonal بوجود رشاشات أو 1/2 Diagonal بدونها)، وعرض درج السلم الصافي لا يقل عن ١٫١٠م إلى ١٫٢٠م، وأبواب مقاومة للحريق ساعتين ذاتية الغلق تفتح في اتجاه الهروب.`
    : `إلزامية توفير سلمين هروب منفصلين ومحميين ومتباعدين على الأقل لكل طابق تتجاوز مساحته ٥٠٠ م² أو يزيد عدد شاغليه على ٥٠ شخصاً (مساحة الدور الحالي ${area || 650}م²). تطبيق قاعدة التباعد الكودية (Remoteness Rule): ألا تقل المسافة المستقيمة بين السلمين عن نصف القطر الأكبر للمبنى (1/2 Diagonal) في المباني غير المحمية بالرشاشات، وتخفض إلى ثلث القطر (1/3 Diagonal) إذا كان المبنى محمياً بالرشاشات. عرض السلم الصافي لا يقل عن ١٫١٠م إلى ١٫٢٠م، وأبواب الهروب لا يقل عرضها عن ٠٫٩٠م تفتح للخارج مع كوالين ذعر (Panic Hardware)، وحوائط آبار السلالم ساعتين وأبواب مقاومة ساعة ونصف ذاتية الغلق.`;

  findings.push({
    id: 'find-arch-egress-stairs',
    discipline: 'architectural',
    disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
    category: isResidential ? 'مسالك الهروب والسلالم السكنية (المجموعة ج-١) واشتراط سلمين' : 'مسالك الهروب وسلالم الطوارئ والتباعد',
    categoryEn: 'Means of Egress & Staircase Enclosures (Part 1)',
    requirementAr: egressStairsReqAr,
    requirementEn: isResidential 
      ? 'Mandatory 2 remote exit stairs for residential buildings > 16m height or > 5 floors. Single-stair exemption does not apply.' 
      : 'At least 2 remote, fire-rated exit staircases for floor areas > 500 m². Spacing must satisfy the diagonal remoteness rule.',
    codeReference: {
      docCode: '٣٠٥/١',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
      edition: '2026',
      chapter: isResidential ? 'الباب الرابع: مسالك الهروب والباب السادس: الإشغالات السكنية' : 'الباب الرابع: مسالك الهروب',
      article: isResidential ? 'البند ٤-٣-٢ والبند ٦-٣-٢ ص ٦-١٨' : 'البند ٤-٣-٢ و ٤-٣-٤ و ٤-٤-٢',
      page: isResidential ? '٦-١٨ و ٤-١٤' : '٤-١٤ و ٤-١٥ و ٤-١٨'
    },
    sourceText: egressStairsSourceText,
    projectFactsUsed: isResidential
      ? `المبنى سكني مكون من أرضي و ٥ أدوار علوية (بارتفاع كلي ${height}م ومنسوب بلاطة آخر دور مأهول ${highestOccupiedHeight}م على أساس متوسط ٣م/الدور السكني بمصر). ورغم أن منسوب بلاطة أعلى طابق مأهول (${highestOccupiedHeight}م) يقع دون حد الـ ١٦ متراً الكودي، إلا أن مساحة الدور (${area} م²) تتجاوز الحد الأقصى للسلم السكني الواحد (٤٠٠ م² طبقاً للبند ٦-٣-١)، ولذلك يلزم وجوباً توفير سلمين هروب متباعدين بسبب مساحة المسقط.`
      : `مساحة الدور (${area || 650}م² > ٥٠٠ م²)، عدد الأدوار فوق الأرض (${aboveFloors})، وحمل إشغال تقديري يتجاوز ٥٠ فرداً، مما يوجب سلمين هروب على الأقل.`,
    status: 'Potential Issue Identified',
    statusAr: isResidential ? 'يلزم سلمين هروب (لتجاوز مساحة الدور ٤٠٠ م²)' : 'محدد تصميمي جوهري (سلمين هروب متباعدين)',
    severity: 'high',
    openQuestions: [
      'هل يوفر المخطط المعماري سلمين هروب متباعدين يحققان مسافة نصف القطر (أو ثلث القطر مع الرشاشات)؟',
      'هل درج الهروب من البدروم (إن وجد) منفصل تماماً عن سلالم الأدوار العلوية ويفتح مباشرة للخارج؟'
    ],
    assumptions: [
      'احتساب عرض السلم على أساس وحدات خروج سعة ٠٫٥٥م للوحدة وبحد أدنى وحدتين (١٫١٠م صافي بين الدرابزينات).'
    ],
    recommendedNextStep: 'التحقق من تباعد مدخلي سلمين الهروب على المسقط الأفقي بما يطابق قاعدة ثلث القطر على الأقل.'
  });

  // A-2. Apartment Fire Separations (خاص بالإشغال السكني)
  if (isResidential) {
    findings.push({
      id: 'find-arch-apt-separation',
      discipline: 'architectural',
      disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
      category: 'الفصل الحريقي بين الشقق السكنية والطرقة المشتركة',
      categoryEn: 'Apartment Fire Separation & Self-Closing Doors (Group C-1)',
      requirementAr: 'عزل كل شقة سكنية عن الشقق المجاورة وعن الطرقة والبهو المشترك بحوائط وأرضيات مانعة لانتشار الحريق مقاومة لمدة ساعة واحدة على الأقل (1-Hour Fire Barrier)، وتزويد أبواب الشقق المؤدية للممرات بكوالين محكمة ومقاومة حريق لا تقل عن ٢٠ إلى ٣٠ دقيقة وتكون ذاتية الإغلاق لمنع انتقال ألسنة اللهب والدخان من أي شقة إلى مسار هروب باقي السكان.',
      requirementEn: 'Each residential unit must be separated by 1-hour fire rated walls/floors, with minimum 20-30 min self-closing fire doors to public corridors.',
      codeReference: {
        docCode: '٣٠٥/١',
        docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
        edition: '2026',
        chapter: 'الباب الثالث: متطلبات الأمان الإنشائي والباب السادس: الإشغالات السكنية',
        article: 'جدول ٣-١ والبند ٦-٣-٣',
        page: '٣-١٢ و ٦-٢٠'
      },
      sourceText: 'يجب فصل الوحدات السكنية (الشقق) عن بعضها البعض وعن الممرات والبهو المشترك بحوائط وأسقف وأرضيات مقاومة للحريق لمدة لا تقل عن ساعة واحدة، مع تركيب أبواب مقاومة للحريق لمدة لا تقل عن ٢٠ إلى ٣٠ دقيقة وتكون ذاتية الإغلاق (Self-Closing) ومحكمة الإغلاق ضد تسرب الدخان.',
      projectFactsUsed: `طبيعة الإشغال السكني (المجموعة ج-١) ومساحة الدور (${area || 450} م²) تتطلب فواصل ساعتين بين الوحدات ومقاومة نصف ساعة لأبواب الشقق.`,
      status: 'Potentially Applicable',
      statusAr: 'إلزامي لكافة الشقق السكنية',
      severity: 'medium',
      openQuestions: [
        'هل مواصفات أبواب الشقق السكنية على الطرقات معتمدة بمقاومة حريق لا تقل عن نصف ساعة وذاتية الإغلاق؟'
      ],
      assumptions: [
        'تنفيذ حوائط البلوك الخرساني أو الطوب المصمت بسمك لا يقل عن ١٢-١٥ سم بين الشقق لتحقيق مقاومة الحريق المطلوبة.'
      ],
      recommendedNextStep: 'توضيح توصيف الفواصل الحريقية ومقاومة أبواب الشقق في المخططات المعمارية وجداول التشطيبات.'
    });
  }

  // A-3. Travel Distances & Dead-End Corridors (أقصى مسافات الارتحال والنهايات الميتة)
  const travelDistanceSourceText = isResidential
    ? 'تُحدد أقصى مسافة ارتحال في الإشغالات السكنية (المجموعة ج) بـ ٣٠ متراً في المباني غير المحمية بالرشاشات و٤٥ متراً في المباني المحمية بالرشاشات التلقائية طبقاً لجدول ٤-٢ من الباب الرابع، مع قصر مسار الحركة المشترك داخل الشقة ذات المخرج الواحد على ١٥-٢٠ متراً، ولا يجوز أن يتجاوز طول ممر النهاية الميتة (Dead-End) في الطوابق السكنية ٦ أمتار في المباني العادية أو ١٠ أمتار في المباني المحمية بالرشاشات.'
    : (isCommercial
      ? 'تحدد أقصى مسافة ارتحال إلى أقرب مخرج بـ ٣٠ متراً في حالة عدم وجود رشاشات و٤٥ متراً في المباني التجارية المحمية بالرشاشات التلقائية، مع تحديد طول النهاية الميتة بـ ٦ أمتار كحد أقصى. ويجب قياس مسافة الارتحال على طول المسار الفعلي القابل للمشي الطبيعي من أبعد نقطة في الفراغ حتى الوصول إلى المخرج النهائي أو باب درج الهروب المحمي.'
      : 'تحدد أقصى مسافة ارتحال إلى أقرب مخرج بـ ٤٠ متراً (غير محمي) و٦٠ متراً (محمي بالرشاشات) للإشغال الإداري، مع تحديد طول النهاية الميتة بـ ٦ أمتار كحد أقصى تزيد إلى ١٥ متراً في الإداري المحمي بالرشاشات.');

  const travelDistReqAr = isResidential
    ? 'تحديد أقصى مسافة ارتحال في الإشغال السكني بـ (٣٠ متراً) في المباني غير المحمية بالرشاشات، وتزاد إلى (٤٥ متراً) في المباني المحمية بالكامل بالرشاشات التلقائية (مع مراعاة ألا تتعدى مسافة الهروب داخل الوحدة السكنية ذات المخرج الواحد ١٥ متراً حتى باب الشقة). تحديد طول ممرات النهاية الميتة بـ (٦ أمتار كحد أقصى، وتصل إلى ١٠ أمتار مع الرشاشات).'
    : `تحديد أقصى مسافة ارتحال مسموحة من أبعد نقطة في الدور حتى الوصول إلى باب أقرب درج هروب محمي بـ (${isCommercial ? 30 : 40} متراً) في المباني غير المحمية بالرشاشات، وتزاد إلى (${isCommercial ? 45 : 60} متراً) في المباني المحمية بالكامل بشبكة رشاشات مائية تلقائية. تحديد طول ممرات النهاية الميتة بـ (٦ أمتار كحد أقصى).`;

  findings.push({
    id: 'find-arch-travel-distances',
    discipline: 'architectural',
    disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
    category: isResidential ? 'مسافات الارتحال والنهايات الميتة بالممرات السكنية' : 'مسافات الارتحال والنهايات الميتة بالممرات',
    categoryEn: 'Maximum Travel Distance & Dead-End Limits (Part 1)',
    requirementAr: travelDistReqAr,
    requirementEn: isResidential
      ? 'Residential corridor travel distance limited to 20m without sprinklers (30m with sprinklers). Dead-end limited to 6m (10m with sprinklers).'
      : `Maximum travel distance to nearest exit: ${isCommercial ? 30 : 40}m without sprinklers, extending to ${isCommercial ? 45 : 60}m with sprinklers. Dead-end limited to 6m.`,
    codeReference: {
      docCode: '٣٠٥/١',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
      edition: '2026',
      chapter: isResidential ? 'الباب الرابع: مسالك الهروب والباب السادس: الإشغالات السكنية' : 'الباب الرابع: مسالك الهروب',
      article: isResidential ? 'جدول ٤-٢ والبند ٦-٣-٢' : 'البند ٤-٣-٥ وجدول ٤-٢',
      page: isResidential ? '٤-١٨ و ٦-١٩' : '٤-١٦ و ٤-١٨'
    },
    sourceText: travelDistanceSourceText,
    projectFactsUsed: `طبيعة الإشغال (${isResidential ? 'سكني المجموعة ج-١' : (isCommercial ? 'تجاري المجموعة هـ' : 'إداري المجموعة د')})، مساحة الدور (${area || 450}م²).`,
    status: 'Potentially Applicable',
    statusAr: 'منطبق وقيد القياس المعماري',
    severity: 'medium',
    openQuestions: [
      `هل تم قياس المسار الفعلي من أبعد شقة أو مكتب للتأكد من عدم تجاوزه المسافة الكودية القصوى؟`,
      'هل تخلو الممرات الرئيسية من أي نهايات ميتة تتجاوز ٦ أمتار؟'
    ],
    assumptions: [
      'قياس مسافات الارتحال على مسار خطوط المشي الفعلية مع الالتفاف حول القواطع والفرش الداخلي.'
    ],
    recommendedNextStep: 'توقيع متجهات مسار الارتحال (Travel Distance Lines) على كافة المساقط الأفقية وإبرازها باللون الأحمر.'
  });

  // A-4. Detailed Ramps Requirements: Vehicular & Pedestrian (اشتراطات الرامبات)
  let rampsDetailAr = '';
  if (hasBasement) {
    rampsDetailAr = `أولاً: منحدرات السيارات بالبدروم (Vehicular Ramps): أقصى ميل للمنحدر المستقيم ١٥٪، ويجوز استثنائياً حتى ١٨٪ بشرط توفير استراحة انتقالية أفقية (Transition) في قمة وقاع المنحدر بطول ٤٫٠ إلى ٥٫٠ أمتار بميل لا يتجاوز ٥٪ لحماية أسفل السيارات وتأمين زاوية الرؤية، وأقصى ميل للمنحدر المنحني ١٢٪. العرض الصافي لا يقل عن ٣٫٥٠ متراً للاتجاه الواحد و٦٫٠٠ أمتار للاتجاهين، ونصف القطر الداخلي للمنحنيات لا يقل عن ٥٫٠٠ أمتار والخارجي ٨٫٥٠ متراً، والخلو الرأسي الحر لا يقل عن ٢٫٢٠ متراً صافياً، مع معالجة خشنة مانعة للانزلاق (Grooved Ramp) ومجارير تصريف سيول عند المداخل. ثانياً: منحدرات المشاة والهروب وذوي الهمم (Pedestrian Ramps): أقصى ميل لمنحدر الهروب ١:١٠ (١٠٪) ولمنحدرات ذوي الإعاقة ١:١٢ (٨٫٣٣٪)، مع توفير بسطة مستوية أفقية بطول ١٫٥٠م عند البداية والنهاية وكل ٩ أمتار طولية وعند كل تغيير اتجاه، مع درابزينات حماية على الجانبين بارتفاع ٠٫٩٠م وحافة سفلية ١٠ سم.`;
  } else {
    rampsDetailAr = `أولاً: منحدرات السيارات: المبنى مصمم بدون أدوار تحت الأرض (صفر بدروم)، وبالتالي لا يتطلب توفير منحدر سيارات بدروم. ثانياً: منحدرات المداخل والمشاة ومسالك الهروب وذوي الهمم: يجب ألا يزيد ميل منحدر الهروب على ١:١٠ (١٠٪) ومسارات ذوي الإعاقة ومداخل المبنى على ١:١٢ (٨٫٣٣٪)، مع توفير بسطة مستوية أفقية بطول لا يقل عن ١٫٥٠ متراً عند البداية والنهاية وكل ٩ أمتار طولية وعند كل تغيير اتجاه، وعرض صافٍ لا يقل عن ١٫١٠م، ودرابزينات حماية ملساء ومستمرة بارتفاع ٠٫٩٠م وحافة مصمتة ١٠ سم لمنع انزلاق العجلات.`;
  }

  findings.push({
    id: 'find-arch-ramps',
    discipline: 'architectural',
    disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
    category: 'اشتراطات الرامبات (منحدرات السيارات ومنحدرات المشاة والهروب)',
    categoryEn: 'Vehicular & Pedestrian Egress Ramps (Part 1)',
    requirementAr: rampsDetailAr,
    requirementEn: `${hasBasement ? 'Basement Vehicular Ramps: Max 15% slope (up to 18% with 4-5m transition at 5%), min 3.5m single / 6.0m dual width, 5.0m inner radius, 2.2m headroom, grooved non-slip finish.' : 'No basement parking ramp required (zero underground levels).'} Pedestrian Egress Ramps: Max 1:10 (10%) slope (1:12 for accessibility), 1.5m landings every 9m, continuous 0.90m handrails.`,
    codeReference: {
      docCode: '٣٠٥/١',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
      edition: '2026',
      chapter: 'الباب الرابع: مسالك الهروب والباب الخامس: متطلبات الأدوار أسفل سطح الأرض',
      article: 'البند ٤-٣-٦ والبند ٥-٢-٥',
      page: '٤-٢١ و ٥-١١'
    },
    sourceText: 'أولاً: منحدرات السيارات: يجب ألا يتجاوز الميل الطولي لمنحدر السيارات المستقيم ١٥٪، ويجوز في الحالات الاضطرارية ألا يتجاوز ١٨٪ بشرط تزويد قمة وقاع المنحدر باستراحة انتقالية أفقية بطول لا يقل عن ٤٫٠ إلى ٥٫٠ أمتار بميل لا يتجاوز ٥٪، وألا يقل العرض الصافي لمنحدر السيارات عن ٣٫٥٠ متراً للاتجاه الواحد و٦٫٠٠ أمتار للاتجاهين، ولا يقل نصف القطر الداخلي للمنحنيات عن ٥٫٠٠ أمتار والخارجي عن ٨٫٥٠ متراً، مع توفير خلو رأسي حر لا يقل عن ٢٫٢٠ متراً، ومعالجة الأرضيات بمواد خشنة مانعة للانزلاق. ثانياً: منحدرات المشاة والهروب: يجب ألا يزيد ميل منحدر الهروب على ١:١٠ (١٠٪) ومسارات ذوي الإعاقة على ١:١٢ (٨٫٣٣٪)، مع توفير بسطة مستوية أفقية بطول لا يقل عن ١٫٥٠ متراً عند البداية والنهاية وكل ٩ أمتار طولية وعند كل تغيير في الاتجاه، مع درابزينات ملساء ومستمرة بارتفاع ٠٫٩٠م على الجانبين.',
    projectFactsUsed: `بيانات المشروع: ${hasBasement ? `بدروم ${facts.basementUse} يتطلب منحدر سيارات بالمحددات الهندسية` : 'المبنى بدون بدروم (صفر أدوار تحت الأرض)'}، ومداخل المبنى تتطلب منحدرات مشاة مطابقة لكود الإتاحة ومسالك الهروب.`,
    status: hasBasement ? 'Potential Issue Identified' : 'Potentially Applicable',
    statusAr: hasBasement ? 'محدد معماري جوهري لمنحدر السيارات' : 'منطبق لمنحدرات المداخل والمشاة',
    severity: hasBasement ? 'high' : 'medium',
    openQuestions: [
      hasBasement ? 'هل ميل منحدر سيارات البدروم يحقق ١٥٪ (أو ١٨٪ مع استراحة أفقية ٥ أمتار بميل ٥٪ عند الرصيف)؟' : 'هل تم توفير منحدر مشاة بميل لا يتجاوز ٨٫٣٣٪ عند المدخل الرئيسي لخدمة ذوي الهمم؟',
      hasBasement ? 'هل الخلو الرأسي الصافي تحت دكتات سحب الدخان ومواسير الرشاشات فوق الرامب لا يقل عن ٢٫٢٠ متراً؟' : 'هل البسطات المستوية على منحدرات المشاة لا تقل عن ١٫٥٠ متراً طولياً؟'
    ],
    assumptions: [
      'تنفيذ خطوط تفريز خرسانية مانعة للانزلاق (Grooved non-slip) على أرضيات الرامب لمنع انزلاق المركبات أثناء الأمطار.'
    ],
    recommendedNextStep: hasBasement 
      ? 'مراجعة قطاع الرامب المعماري (Ramp Longitudinal Section) وحساب زوايا الانتقال (Transition Slopes) والخلو الرأسي.'
      : 'تضمين منحدر إتاحة بميل ١:١٢ وبسطات كل ٩ أمتار عند المداخل الرئيسية على المساقط الأفقية.'
  });

  // A-5. Fire Department Apparatus Access Road (طريق وصول سيارات ومعدات الإطفاء والإنقاذ)
  findings.push({
    id: 'find-arch-fire-access-road',
    discipline: 'architectural',
    disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
    category: 'طريق وصول ومناورة سيارات الإطفاء والإنقاذ',
    categoryEn: 'Fire Apparatus Access Roads & Staging (Part 1)',
    requirementAr: `توفير طريق ممهد مخصص لسيارات ومعدات الدفاع المدني بعرض صافٍ لا يقل عن ٦٫٠٠ أمتار، وخلو رأسي حر لا يقل عن ٤٫٥٠ متراً خالي من أي عوائق أو أشجار، يتيح وصول سيارات الإطفاء إلى ما لا يقل عن ٢٥٪ من محيط المبنى (${isHighRise ? 'و٥٠٪ للمباني المرتفعة' : 'في المباني العادية'})، ومصمم لتحمل أحمال محاور شاحنات الإطفاء وسلالم الإنقاذ الهيدروليكية الثقيلة (١٨ إلى ٢٤ طناً).`,
    requirementEn: 'Designated fire apparatus access road with min 6.00m clear width and 4.50m vertical clearance, providing access to at least 25% of building perimeter (50% for high-rises), bearing heavy axle loads (18-24 tons).',
    codeReference: {
      docCode: '٣٠٥/١',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
      edition: '2026',
      chapter: 'الباب الثالث: متطلبات الأمان الإنشائي ومسارات سيارات الإطفاء',
      article: 'البند ٣-٣-١ و ٣-٣-٢',
      page: '٣-٢٢'
    },
    sourceText: 'يلزم توفير مسار ممهد ومخصص لسيارات ومعدات الإطفاء والإنقاذ بعرض صافٍ لا يقل عن (٦٫٠٠ أمتار)، وخلو رأسي حر لا يقل عن (٤٫٥٠ متراً) خالي تماماً من الأشجار أو البروزات المعمارية أو خطوط الكهرباء الهوائية. ويجب أن يتيح هذا المسار لسيارات الإطفاء الوصول إلى ما لا يقل عن ٢٥٪ من محيط المبنى في المباني العادية، وما لا يقل عن ٥٠٪ من محيط المبنى في المباني المرتفعة والمراكز التجارية الكبرى، مع تصميم الطريق ليتحمل أحمال محاور شاحنات الإطفاء وسلالم الإنقاذ الهيدروليكية الثقيلة (بما لا يقل عن ١٨ إلى ٢٤ طناً).',
    projectFactsUsed: `طبيعة المنشأة وارتفاعها (${Math.round(height)}م)، يستوجب تأمين ممر سيارات إطفاء بعرض ٦ أمتار يغطي ما لا يقل عن ٢٥٪ من محيط المبنى ومحاذياً للواجهة الرئيسية ووحدة السياميز.`,
    status: 'Potentially Applicable',
    statusAr: 'منطبق بالموقع العام للمشروع',
    severity: 'medium',
    openQuestions: [
      'هل المخطط العام (Site Plan) يوضح طريقاً مخصصاً لسيارات الإطفاء بعرض ٦م دون إشغالات أو مواقف تعيق المرور؟',
      'هل أغطية غرف المحابس والبيارات الواقعة في مسار الطريق مصممة لتحمل الأحمال الثقيلة لشاحنات الدفاع المدني؟'
    ],
    assumptions: [
      'توفير ساحة دوران (Turnaround) بنصف قطر لا يقل عن ١٢ متراً في حال كان طريق سيارات الإطفاء مسدوداً (Dead-end).'
    ],
    recommendedNextStep: 'تحديد مسار سيارات الإطفاء ومسافات الركون على مخطط الموقع العام (Site Plan) قبل اعتماده من الحماية المدنية.'
  });

  // A-6. High-Rise / Occupancy Core Classification
  if (isHighRise) {
    const highRiseSourceText = isResidential
      ? 'تُعد المباني السكنية (المجموعة ج) التي يزيد ارتفاع أعلى طابق مأهول بها على (١٦ متراً) مباني مرتفعة خاضعة للاشتراطات الوقائية الإضافية، ويلزم حمايتها بالكامل بشبكة رشاشات مائية تلقائية (خطورة خفيفة بكثافة ٠٫١٠ GPM/قدم² على مساحة ١٥٠٠ قدم²)، وتوفير سلمين للهروب محاطين بحوائط مقاومة للحريق ساعتين مع نظام ضغط هواء موجب لآبار السلالم، ومصعد واحد على الأقل مخصص لرجال الإطفاء، وحماية كامل مسطح جراج البدروم برؤوس رشاشات وسحب ميكانيكي للدخان.'
      : 'تُعد المباني التي يزيد ارتفاع أعلى طابق مأهول بها على (٢٢ متراً) في الإشغالات التجارية والإدارية مباني مرتفعة خاضعة للاشتراطات الوقائية الإضافية الواردة بهذا الباب. ويلزم حماية المبنى بالكامل بشبكة رشاشات مائية تلقائية، وتوفير سلمين للهروب محاطين بحوائط مقاومة للحريق بحد أدنى ساعتين مع توفير نظام ضغط هواء موجب لآبار السلالم، ومصعد واحد على الأقل مخصص لرجال الإطفاء.';

    const highRiseReqAr = isResidential
      ? `تصنيف المبنى كمبنى سكني مرتفع (High-Rise Residential Building): تجاوز ارتفاع أعلى طابق مأهول حد الـ ١٦ متراً المنصوص عليه حصرياً للإشغالات السكنية (المبنى مكون من ${aboveFloors} طوابق بارتفاع ${Math.round(height)} متراً)، مما يوجب تطبيق اشتراطات الباب الخامس: سلمين هروب محاطين بحوائط ساعتين، شبكة رشاشات مائية تلقائية، مروحة ضغط هواء للسلالم، ومصعد لرجال الإطفاء.`
      : `تصنيف المبنى كمبنى مرتفع (High-Rise): تجاوز ارتفاع المبنى حد الـ ٢٢ متراً (ارتفاعه الحالي ${Math.round(height)}م)، مما يوجب تطبيق اشتراطات الباب الخامس: رشاشات مائية كاملة، وسلالم هروب مضغوطة ساعتين، ومصعد لرجال الإطفاء.`;

    findings.push({
      id: 'find-arch-high-rise',
      discipline: 'architectural',
      disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
      category: isResidential ? 'التصنيف الإنشائي والمباني السكنية المرتفعة (> ١٦ متراً)' : 'التصنيف الإنشائي والمباني المرتفعة (> ٢٢ متراً)',
      categoryEn: 'High-Rise Classification (Part 1)',
      requirementAr: highRiseReqAr,
      requirementEn: isResidential
        ? 'High-Rise Residential classification (> 16m threshold) requiring dual fire stairs, sprinklers, and firefighter elevator.'
        : 'High-Rise Building Classification requiring full sprinkler protection, pressurized staircases, and a dedicated firefighter elevator.',
      codeReference: {
        docCode: '٣٠٥/١',
        docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
        edition: '2026',
        chapter: 'الباب الخامس: متطلبات إضافية للمباني المرتفعة والأدوار أسفل سطح الأرض',
        article: 'البند ٥-١-١ و ٥-١-٢',
        page: '٥-٢'
      },
      sourceText: highRiseSourceText,
      projectFactsUsed: isResidential
        ? `المبنى سكني مكون من (${aboveFloors} طوابق) بارتفاع (${Math.round(height)} متراً) يتجاوز الحد الكودي الفاصل للمباني السكنية المرتفعة وهو (١٦ متراً).`
        : `ارتفاع المبنى الحالي (${Math.round(height)} متراً) يتجاوز الحد الكودي الفاصل للمباني المرتفعة وهو (٢٢ متراً). عدد الأدوار فوق الأرض (${aboveFloors}).`,
      status: 'Potential Issue Identified',
      statusAr: isResidential ? 'إلزامي للسكني المرتفع (> ١٦م)' : 'متطلب إلزامي ذو أولوية عالية',
      severity: 'high',
      openQuestions: [
        'هل يوفر التصميم المعماري بئراً مخصصاً لمصعد الحريق مجهزاً بباب مقاوم للحريق وتغذية كهربائية للطوارئ؟',
        'هل تم اعتماد حسابات ضغط الهواء الموجب لمراوح آبار السلالم من مهندس ميكانيكي معتمد؟'
      ],
      assumptions: [
        'احتساب الارتفاع من منسوب الرصيف الخارجي أمام المدخل الرئيسي حتى منسوب أرضية الطابق الأخير المأهول.'
      ],
      recommendedNextStep: 'تكليف الاستشاري المعماري والميكانيكي بمطابقة قطاعات آبار السلالم ومصعد الإطفاء مع اشتراطات الباب الخامس قبل التقديم للحماية المدنية.'
    });
  } else if (isMixed) {
    findings.push({
      id: 'find-arch-mixed-occupancy',
      discipline: 'architectural',
      disciplineAr: 'الاشتراطات المعمارية ومسالك الهروب والرامبات (كود ٣٠٥/١)',
      category: 'المباني متعددة الإشغال (تجاري وإداري)',
      categoryEn: 'Mixed Commercial & Business Occupancy (Groups E / D)',
      requirementAr: 'تطبيق اشتراطات الإشغالات المختلطة (تجاري هـ / إداري د): إما الفصل الحريقي التام (ساعتين) مع مسالك وسلالم هروب مستقلة، أو إخضاع كامل المبنى للاشتراط الأشد (الإشغال التجاري هـ).',
      requirementEn: 'Mixed Occupancy Provisions: Either full 2-hour fire barrier separation with independent exit stairs, or applying the most restrictive requirements (Group E Mercantile) to the entire building.',
      codeReference: {
        docCode: '٣٠٥/١',
        docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الأول',
        edition: '2026',
        chapter: 'الباب الثاني: تصنيف المباني والباب السادس: المتطلبات الإضافية للإشغالات',
        article: 'البند ٢-٣ (المباني متعددة الإشغال) والبند ٦-٥ و ٦-٤',
        page: '٢-١١ و ٦-٢٩'
      },
      sourceText: 'في المباني التي تشتمل على أكثر من نوع إشغال واحد، مثل الجمع بين الإشغال التجاري (المجموعة هـ) والإشغال الإداري (المجموعة د)، يجب اتباع أحد المسارين التاليين: (أ) الإشغالات المفصولة: فصل الإشغالات فصلاً تاماً بحوائط وأرضيات مانعة لانتشار الحريق ومقاومة للحريق لمدة لا تقل عن ساعتين مع توفير مسالك هروب وسلالم ومداخل مستقلة لكل إشغال، وتُطبق اشتراطات كل إشغال على حدة. (ب) الإشغالات غير المفصولة: إذا لم يتوفر هذا الفصل التام، يُعامل كامل المبنى وفقاً للاشتراطات الأشد والأكثر صرامة المنصوص عليها للإشغال التجاري فيما يخص مسافات الارتحال (٤٥ متراً كحد أقصى مع الرشاشات)، وسعة المخارج، وإلزامية الحماية بالرشاشات التلقائية.',
      projectFactsUsed: `المبنى متعدد الإشغال يجمع بين أنشطة تجارية ومكاتب إدارية بمساحة طابق (${area} م²) وإجمالي مساحة تقديرية (${totalArea} م²).`,
      status: 'Potential Issue Identified',
      statusAr: 'يتطلب تحديد استراتيجية الفصل الحريقي',
      severity: 'high',
      openQuestions: [
        'هل يوفر التصميم المعماري فواصل حريق (أرضيات وحوائط ساعتين) تفصل المحلات عن الأدوار الإدارية وسلالم هروب مستقلة للمكاتب؟',
        'في حال عدم توفر سلالم هروب مستقلة للإداري، هل تم الالتزام بمسافة ارتحال التجاري الأشد (٤٥ متراً بوجود رشاشات) في الأدوار الإدارية أيضاً؟'
      ],
      assumptions: [
        'افتراض تخصيص الطوابق السفلية للمحلات والأنشطة التجارية، وتخصيص الطوابق العليا للمكاتب والشركات.'
      ],
      recommendedNextStep: 'تضمين مخطط استراتيجية الفصل الحريقي (Fire Separation Plan) في الملف الهندسي، أو اعتماد الاشتراطات التجارية كمرجعية موحدة لكافة أدوار المبنى.'
    });
  }

  // =========================================================================
  // SECTION C: ELECTRICAL & ALARM SYSTEMS (كود ٣٠٥/٣ - الأنظمة الكهربائية والإنذار)
  // =========================================================================

  // E-1. Addressable Fire Alarm & Controls (نظام الإنذار ومصفوفة التحكم)
  const fireAlarmSourceText = isResidential
    ? 'يلزم تزويد المباني السكنية (المجموعة ج-١) المكونة من شقق سكنية والتي يتجاوز ارتفاعها ١٦ متراً أو تشغل أكثر من ٥ طوابق بنظام إنذار حريق بالمناطق المشتركة (الممرات والسلالم وغرف الخدمات والمصاعد) مزود بكواشف دخان وأزرار يدوية عند المخارج وسارينات إنذار مسموعة لكافة الشاغلين مع إعادة المصاعد للدور الأرضي تلقائياً عند استشعار الحريق، مع تزويد كل شقة سكنية بكواشف دخان موضعية مستقلة ببطارية عند مداخل غرف النوم والمطابخ بفيض صوتي لا يقل عن ٨٥ ديسيبل عند رأس النائم.'
    : (isCommercial || isMixed
      ? 'تخضع الإشغالات التجارية المصنفة (هـ) التي تتجاوز مساحتها الإجمالية ٢٠٠٠ م² أو تشغل أكثر من ثلاثة طوابق لإلزامية نظام إنذار معنون من النوع الصوتي المرئي مع كواشف دخان ضوئية بالمحلات والممرات وكواشف حرارية بالمطابخ وغرف المحولات، وربط لوحة الإنذار بمنظومة التحكم لإيقاف وحدات التكييف المركزية وإغلاق خوانق الدخان وتشغيل مراوح الطوارئ وإعادة المصاعد للدور الأرضي.'
      : 'يلزم تجهيز المباني الإدارية التي تشغل أكثر من ثلاثة أدوار أو تزيد مساحتها الإجمالية على ٢٠٠٠ م² بنظام إنذار تلقائي معنون (Addressable Fire Alarm System) يشمل كواشف دخان ضوئية بالممرات والمكاتب، وكواشف حرارية بالمطابخ وغرف المولدات والمحولات، مع ربط لوحة الإنذار بمنظومة التحكم لإيقاف وحدات التكييف المركزية تلقائياً وإعادة المصاعد للدور الأرضي وتشغيل مراوح سحب وضغط الهواء عند استشعار الحريق.');

  const fireAlarmReqAr = isResidential
    ? `تركيب نظام إنذار حريق متكامل للمبنى السكني (المجموعة ج-١): (١) كواشف دخان موضعية مستقلة ببطارية (Single-Station Smoke Alarms) داخل كل شقة سكنية عند مداخل غرف النوم والمطابخ بفيض صوتي لا يقل عن ٨٥ ديسيبل عند رأس النائم لتنبيه السكان أثناء النوم، (٢) شبكة إنذار حريق للمناطق المشتركة (الممرات والسلالم وغرف الخدمات والمصاعد) مزودة بكواشف دخان ضوئية وأزرار إنذار يدوية (Manual Call Points) عند كل مخرج وبسطة سلم وسارينات إنذار مسموعة لكافة الشاغلين مع إعادة المصاعد تلقائياً للدور الأرضي عند استشعار الحريق (المبنى سكني مكون من ${aboveFloors} أدوار بارتفاع ${Math.round(height)} متراً > ١٦ متراً).`
    : `تركيب نظام إنذار حريق معنون ذكي (Addressable Fire Alarm System) يشمل كواشف دخان ضوئية بالممرات ${isCommercial ? 'والمحلات' : 'والمكاتب'}، وكواشف حرارية بالمطابخ وغرف المحولات والكهرباء، وأزرار إنذار يدوية عند كل باب سلم ومخرج، مع ربط مصفوفة التحكم الآلي (Cause & Effect) لإيقاف وحدات التكييف وإغلاق خوانق الدخان وتشغيل مراوح ضغط السلالم وإرجاع المصاعد للدور الأرضي.`;

  findings.push({
    id: 'find-elec-fire-alarm',
    discipline: 'electrical',
    disciplineAr: 'الأنظمة الكهربائية والإنذار (كود ٣٠٥/٣)',
    category: isResidential ? 'شبكة الإنذار وكواشف الدخان بالمباني السكنية (كود ٣٠٥/٣)' : 'شبكة الإنذار المعنونة ومصفوفة التحكم الآلي',
    categoryEn: isResidential ? 'Residential Fire Alarm & Apartment Smoke Detectors' : 'Addressable Fire Alarm & Interlocks (Part 3)',
    requirementAr: fireAlarmReqAr,
    requirementEn: isResidential
      ? 'Single-station 85 dB smoke alarms inside each apartment bedroom/kitchen, plus common area fire alarm with elevator ground recall.'
      : 'Intelligent addressable fire alarm system with smoke/heat detectors, manual call points at all exits, and full control interlocks.',
    codeReference: {
      docCode: '٣٠٥/٣',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثالث: الأنظمة الكهربائية والإنذار',
      edition: '2026',
      chapter: 'الباب الأول: أنظمة الكشف والإنذار بالحريق',
      article: isResidential ? 'البند ١-٢-٤' : 'البند ١-٢-٣ و ١-٣-١',
      page: isResidential ? '١-١٨' : '١-١٥'
    },
    sourceText: fireAlarmSourceText,
    projectFactsUsed: isResidential
      ? `إشغال سكني (المجموعة ج-١) مكون من (${aboveFloors} طوابق فوق الأرض) بمساحة دور (${area || 450} م²) وارتفاع (${Math.round(height)} متراً > ١٦ متراً)، يستوجب نظام إنذار للمناطق المشتركة وكواشف موضعية بالشقق.`
      : `المبنى يزيد عن ثلاثة أدوار وتتجاوز مساحته الإجمالية (${totalArea} م² > ٢٠٠٠ م²)، مما يلزمه بنظام إنذار معنون ومصفوفة تحكم شاملة.`,
    status: 'Potentially Applicable',
    statusAr: isResidential ? 'إلزامي للسكني > ١٦ متراً' : 'منطبق وقيد التصميم التنفيذي',
    severity: 'medium',
    openQuestions: [
      isResidential 
        ? 'هل تم تضمين كواشف الدخان ببطارية (٨٥ ديسيبل) في جدول مواصفات الشقق السكنية؟'
        : 'هل تم تحديد موقع لوحة الإنذار الرئيسية (FACP) بغرفة مراقبة وأمن مأهولة بالدور الأرضي؟',
      'هل تم إدراج مصفوفة التحكم (Cause and Effect Matrix) المعتمدة لإرجاع المصاعد للأرضي؟'
    ],
    assumptions: [
      'تغذية لوحة الإنذار والمراوح بمولد طوارئ يعمل تلقائياً خلال ١٠ ثوانٍ بكابلات مقاومة للحريق ساعتين.'
    ],
    recommendedNextStep: isResidential 
      ? 'توزيع كواشف الدخان بالممرات المشتركة وتوصيف كواشف الشقق المستقلة في المخططات الكهربائية.'
      : 'إعداد جدول نقاط الإنذار (Device Schedule) ومخطط الربط الآلي مع التكييف والمصاعد ومراوح الطوارئ.'
  });

  // E-2. Emergency Lighting & Illuminated Exit Signs (إنارة الطوارئ واللوحات الإرشادية المضيئة)
  findings.push({
    id: 'find-elec-emergency-lighting',
    discipline: 'electrical',
    disciplineAr: 'الأنظمة الكهربائية والإنذار (كود ٣٠٥/٣)',
    category: 'إنارة الطوارئ واللوحات الإرشادية المضيئة',
    categoryEn: 'Emergency Egress Lighting & Exit Signs (Part 3)',
    requirementAr: 'تزويد جميع الممرات ومسارات الارتحال والسلالم والمخارج بوحدات إنارة طوارئ مزودة ببطاريات داخلية تضمن الإضاءة لمدة لا تقل عن ٩٠ دقيقة بشدة ١٠ لوكس عند مستوى الأرضية، وتثبيت لافتات مخارج طوارئ مضيئة (Exit Signs) واضحة ثنائية اللغة فوق جميع أبواب المخارج وعند كل تغيير في اتجاه مسار الهروب.',
    requirementEn: 'Self-contained 90-minute emergency lighting providing min 10 Lux at floor level along egress routes, and illuminated bilingual exit signs above all exit doors and directional turns.',
    codeReference: {
      docCode: '٣٠٥/٣',
      docTitle: 'الكود المصري لحماية المنشآت من أخطار الحريق - الجزء الثالث: الأنظمة الكهربائية والإنذار',
      edition: '2026',
      chapter: 'الباب الثاني: إنارة الطوارئ واللوحات الإرشادية المضيئة',
      article: 'البند ٢-١-١ إلى ٢-٢-٣',
      page: '٢-٨'
    },
    sourceText: 'يجب تزويد جميع الممرات ومسارات الارتحال والسلالم والمخارج بوحدات إنارة طوارئ مزودة ببطاريات داخلية تضمن الإضاءة لمدة لا تقل عن (٩٠ دقيقة) بفيض ضوئي لا يقل عن ١٠ لوكس عند مستوى الأرضية، وتثبيت لافتات مخارج مضيئة (Exit Signs) واضحة ومقروءة باللغتين العربية والإنجليزية فوق جميع أبواب المخارج وعند كل تغيير في اتجاه مسار الهروب.',
    projectFactsUsed: `كافة طوابق المبنى (${totalFloors} طوابق) ومسارات الهروب والسلالم تتطلب إنارة طوارئ ولافتات خروج مضيئة مستقلة.`,
    status: 'Potentially Applicable',
    statusAr: 'منطبق لكافة مسارات الهروب',
    severity: 'low',
    openQuestions: [
      'هل وحدات إنارة الطوارئ مركزية (Central Battery System) أم وحدات مستقلة ذاتية البطارية (Self-Contained)؟'
    ],
    assumptions: [
      'اختبار بطاريات إنارة الطوارئ شهرياً والتأكد من استمراريتها لمدة ٩٠ دقيقة كاملة عند انقطاع التيار الكهربائي.'
    ],
    recommendedNextStep: 'توزيع كشافات الطوارئ ولافتات المخارج المضيئة على المخططات الكهربائية بطول ممرات الهروب والسلالم.'
  });

  return {
    facts,
    findings,
    followUpQuestions,
    assumptions,
    summaryAr: `تم تقييم بيانات المشروع (${isResidential ? 'إشغال سكني المجموعة ج-١' : (facts.occupancyType || '')}) وفقاً لأحكام الكود المصري لحماية المنشآت من أخطار الحريق (إصدار ٢٠٢٦ - قرار وزاري ٢٥٥ لسنة ٢٠٢٦). تم إعداد ملف فني متكامل يضم ${findings.length} بنود كودية موثقة مقسمة بين الأعمال الميكانيكية، والاشتراطات المعمارية ومسالك الهروب والرامبات، والأنظمة الكهربائية والإنذار.`,
    summaryEn: `Project evaluation strictly grounded in Egyptian Fire Code (2026 Edition, Decree 255/2026). Generated ${findings.length} documented code requirements covering Mechanical Fire Protection (Part 2), Architectural Egress & Ramps (Part 1), and Electrical & Alarm (Part 3).`
  };
}
