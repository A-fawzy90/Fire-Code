// Egyptian Fire Code 305 & Decree 255/2026
// Common Civil Protection Rejection Reasons & Official Code Interpretations Knowledge Base
// Prepared by: Eng. Ahmed Fawzy - Fire Fighting & Alarm Systems Engineer

export const REJECTION_CATEGORIES = [
  { id: 'all', labelAr: 'جميع الملاحظات', labelEn: 'All Categories' },
  { id: 'egress', labelAr: 'مسالك الهروب والأبواب والسلالم', labelEn: 'Egress, Doors & Stairs' },
  { id: 'suppression', labelAr: 'أنظمة الإطفاء والخزانات والمضخات', labelEn: 'Fire Pumps & Water Storage' },
  { id: 'alarm_smoke', labelAr: 'الإنذار وسحب الدخان والكهرباء', labelEn: 'Alarm & Smoke Management' },
  { id: 'compartment', labelAr: 'القطاعات الحريقية والمصاعد والأفنية', labelEn: 'Compartmentation & Elevators' },
  { id: 'site_height', labelAr: 'الموقع العام والارتفاعات والواجهات', labelEn: 'Site Planning & Heights' }
];

export const COMMON_REJECTIONS = [
  {
    id: 'rej-01',
    category: 'egress',
    severity: 'critical', // 'critical' | 'high' | 'medium'
    titleAr: 'فتح أبواب مسالك الهروب عكس اتجاه الهروب في الإشغالات كثيفة العدد',
    titleEn: 'Exit doors swinging against the direction of egress travel',
    authorityNoteAr: 'مرفوض: تلاحظ بالمساقط المعمارية فتح أبواب قاعات التجمع / المكاتب الرئيسية عكس اتجاه تدفق الهروب مما يسبب تدافعاً مميتاً عند الطوارئ.',
    authorityNoteEn: 'Rejected: Exit doors serve > 50 occupants and swing inward against the direction of exit travel.',
    codeClauseAr: 'الكود المصري لحماية المنشآت من الحريق (كود ٣٠٥) - الجزء الأول - الباب الثالث (مسالك الهروب)، بند ٣-٤-٢: يجب أن تفتح أبواب مخارج الطوارئ ومسارات الهروب في اتجاه تدفق الخروج إذا زاد إشغال الحيز عن ٥٠ شخصاً أو في الإشغالات عالية الخطورة.',
    codeClauseEn: 'EFC 305 Part 1 Clause 3-4-2: Exit doors must swing in the direction of exit travel when occupant load exceeds 50 persons.',
    violationDetailsAr: 'تصميم أبواب القاعات ذات السعة التي تزيد عن ٥٠ شاغلاً لتفتح إلى الداخل نحو الحيز وليس نحو الممر أو الردهة، أو فتح باب مخرج الطوارئ في الدور الأرضي نحو الداخل.',
    approvedSolutionAr: 'تعديل تفصيلة الباب ليفتح للخارج مع اتجاه الهروب بمفصلات مناسبة، مع تزويده بجهاز ذعر (Panic Hardware / Push Bar) إذا زاد الإشغال عن ١٠٠ شخص، والتأكد من ألا يتعدى بروز درفة الباب أثناء فتحه نصف عرض الممر على الأقل.',
    wrongPracticeAr: '❌ فتح الباب نحو الداخل بحجة توفير مساحة في الممر الخارجي.',
    correctPracticeAr: '✔️ فتح الباب في اتجاه الهروب داخل تجويف معماري (Door Recess) لا يقلص عرض الممر الصافي.',
    tags: ['أبواب الهروب', 'اتجاه الفتح', 'حمولة الإشغال', 'مسالك الهروب']
  },
  {
    id: 'rej-02',
    category: 'egress',
    severity: 'critical',
    titleAr: 'عدم فصل مسار درج الهروب في الدور الأرضي عن مسار البدروم',
    titleEn: 'Failure to interrupt exit stair continuity at ground floor level',
    authorityNoteAr: 'مرفوض: قطاع السلم مستمر من الأدوار العليا إلى البدروم مباشرة دون فاصل معماري مقاوم للحريق، مما قد يقود الهاربين مباشرة إلى منطقة الخطر بالبدروم.',
    authorityNoteEn: 'Rejected: Stair enclosure is continuous between upper floors and basement without physical separation or positive discharge at grade level.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الأول - الباب الثالث بند ٣-٥-٧، والقرار ٢٥٥ لسنة ٢٠٢٦: يجب فصل بئر درج الهروب الصاعد من البدروم تماماً عن السلم الهابط من الأدوار العلوية، بحيث يُفرغ السلم مباشرة إلى الخارج في منسوب الدور الأرضي بحاجز مقاوم للحريق لا يقل عن ساعتين.',
    codeClauseEn: 'EFC 305 Clause 3-5-7: Stairs serving basements must be physically interrupted and separated from stairs serving floors above grade.',
    violationDetailsAr: 'استمرار الدرج بدون توقف في الدور الأرضي، مما يجعل الشاغل أثناء الهرب في الظلام والدخان يستمر بالنزول تلقائياً إلى البدروم المحترق بدلاً من الخروج للشارع.',
    approvedSolutionAr: 'عمل كسر للمسار في الدور الأرضي بباب يفتح للخارج إلى الرصيف أو فناء الإفراغ النهائي، ووضع جدار فاصل مقاوم للحريق ٢ ساعة مع لوحة إرشادية مضيئة واضحة تدل على مخرج الإفراغ النهائي.',
    wrongPracticeAr: '❌ سلم حلزوني أو مستقيم موحد من الدور الخامس حتى البدروم الثاني دون أي باب فاصل في الدور الأرضي.',
    correctPracticeAr: '✔️ انتهاء قطاع السلم العلوي في الدور الأرضي بباب يفرغ مباشرة للشارع، وبدء سلم البدروم من مدخل منفصل بحاجز حريق ٢ ساعة.',
    tags: ['سلالم الهروب', 'الدور الأرضي', 'البدروم', 'الإفراغ النهائي']
  },
  {
    id: 'rej-03',
    category: 'compartment',
    severity: 'critical',
    titleAr: 'تقاطع غرف الكهرباء والمحولات والمولدات مع قطاعات مسارات الهروب الرئيسية',
    titleEn: 'Locating electrical rooms/transformers adjacent to exit enclosures without rated separation',
    authorityNoteAr: 'مرفوض: فتح أبواب غرف لوحات التوزيع الرئيسية والمحولات مباشرة على ممرات الهروب الرئيسية أو ردهة سلم الطوارئ دون ردهة عازلة مقاومة للحريق.',
    authorityNoteEn: 'Rejected: Electrical panels and transformer rooms open directly into exit corridors or protected stair vestibules.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الأول - الباب الثاني (القطاعات الحريقية) بند ٢-٣-٤: يجب فصل غرف الكهرباء والمولدات والمحولات بحوائط مقاومة للحريق لا تقل عن ساعتين (٢ ساعة)، ويُحظر أن تفتح أبوابها على آبار السلالم المحمية أو مسارات الهروب الرئيسية إلا من خلال ردهة مستقلة.',
    codeClauseEn: 'EFC 305 Clause 2-3-4: Transformer and electrical rooms require minimum 2-hour fire-rated enclosures and must not discharge hazard into primary exitways.',
    violationDetailsAr: 'استغلال الحوائط الملاصقة لسلم الهروب لوضع لوحات كهرباء ضغط منخفض أو أبواب غرف كابلات، مما يشكل خطورة اندلاع حريق وانبعاث دخان سام يغلق مسار النجاة الوحيد.',
    approvedSolutionAr: 'نقل أبواب غرف الكهرباء لتفتح على مساحات خدمة أو ممرات ثانوية جيدة التهوية، واستخدام أبواب مقاومة للحريق ٩٠ دقيقة ذاتية الإغلاق (Self-closing UL/FM Listed)، وتمرير الكابلات عبر غوالق مانعة للحريق (Firestop System).',
    wrongPracticeAr: '❌ وضع لوحة الكهرباء الرئيسية أو باب غرفة المولد في ردهة سلم النجاة المحمي.',
    correctPracticeAr: '✔️ عزل غرفة الكهرباء بجدار مباني مصمت ٢ ساعة مع باب حريق ٩٠ دقيقة يفتح على ممر خدمي خارجي.',
    tags: ['غرف الكهرباء', 'القطاعات الحريقية', 'حوائط الحريق', 'الأبواب المقاومة']
  },
  {
    id: 'rej-04',
    category: 'egress',
    severity: 'high',
    titleAr: 'تجاوز مسافات النهاية المسدودة (Dead-End Corridors) المسموح بها',
    titleEn: 'Exceeding permissible dead-end corridor length',
    authorityNoteAr: 'مرفوض: طول الممر الأعمى المؤدي إلى المكاتب الجانبية يتجاوز ٦ أمتار في مبنى غير مزود برشاشات مياه تلقائية.',
    authorityNoteEn: 'Rejected: Dead-end corridor length exceeds permissible limits under Egyptian Fire Code 305.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الأول - الباب الثالث بند ٣-٣-٥: لا يجوز أن يزيد طول النهاية المسدودة عن ٦ أمتار في المباني غير المزودة بمرشات مياه، أو ١٥ متراً في المباني المحمية بالكامل بشبكة رشاشات مياه تلقائية معتمدة.',
    codeClauseEn: 'EFC 305 Clause 3-3-5: Dead-end corridors must not exceed 6 meters (non-sprinklered) or 15 meters (fully sprinklered).',
    violationDetailsAr: 'امتداد الممر لمسافة ١٢ إلى ١٨ متراً دون وجود مخرج ثانٍ في نهايته، مما يحصر الشاغلين في حال اندلاع حريق بين مدخل الممر والغرف المغلقة.',
    approvedSolutionAr: 'إعادة توزيع المخطط المعماري بإنشاء مخرج ثانٍ، أو توفير ممر دائري، أو تقصير الممر ليصبح أقل من ٦ أمتار، أو تزويد المبنى بشبكة رشاشات مياه لرفع الحد المسموح إلى ١٥ متراً.',
    wrongPracticeAr: '❌ ممر طوله ٢٠ متراً ينتهي بجدار مغلق ولا يؤدي إلا لاتجاه سير واحد للخلف.',
    correctPracticeAr: '✔️ ممر لا تتعدى نهايته ٦م، أو تزويد المبنى برشاشات تلقائية وجعل النهاية المسدودة في حدود ١٥م.',
    tags: ['مسافات الارتحال', 'النهاية المسدودة', 'Dead-End', 'ممرات الهروب']
  },
  {
    id: 'rej-05',
    category: 'suppression',
    severity: 'critical',
    titleAr: 'عدم كفاية زمن الاحتياطي المائي لخزان الحريق أو احتسابه على ٣٠ دقيقة فقط للمباني التجارية',
    titleEn: 'Insufficient fire water tank reserve capacity / wrong duration sizing',
    authorityNoteAr: 'مرفوض: سعة خزان المياه المقترحة لا تغطي زمن الضخ الكودي المطلوب (٦٠ أو ٩٠ دقيقة) وفق درجة خطورة الإشغال والقرار ٢٥٥ لسنة ٢٠٢٦.',
    authorityNoteEn: 'Rejected: Water tank storage calculation does not fulfill mandatory reserve time (60-90 min) for ordinary/extra hazard occupancy.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الثاني - الباب الثاني (إمدادات مياه الإطفاء) والقرار ٢٥٥/٢٠٢٦: تحسب سعة الخزان بضرب معدل تدفق شبكة الرشاشات وصناديق الحريق (GPM) في زمن التشغيل الأدنى: ٣٠ دقيقة للخطورة الخفيفة، ٦٠ دقيقة للخطورة العادية (المكاتب والمحلات)، و٩٠ إلى ١٢٠ دقيقة للخطورة العالية والمستودعات والمباني العالية.',
    codeClauseEn: 'EFC 305 Part 2 Clause 2-2 & Decree 255/2026: Water storage must satisfy flow rate x reserve duration (30 min light, 60 min ordinary, 90-120 min high hazard).',
    violationDetailsAr: 'تصميم خزان مياه بسعة ٢٥ م³ لمول تجاري أو مبنى إداري يحتاج معدل تدفق لا يقل عن ٥٠٠ GPM وزمن تشغيل ٦٠ دقيقة (يتطلب على الأقل ١١٥ إلى ١٣٦ م³).',
    approvedSolutionAr: 'استخدام حاسبة الكود التفاعلية لتحديد التدفق بدقة، واحتساب سعة مائية مخصصة للحريق غير قابلة للاستنزاف لأغراض الشرب بحاجز ميكانيكي، ومضاعفة السعة حسب تصنيف الخطورة.',
    wrongPracticeAr: '❌ جمع مياه الحريق ومياه الشرب في خزان صغير دون ماسورة سحب منخفضة مخصصة للحريق تفصل الاحتياطي.',
    correctPracticeAr: '✔️ تخصيص خزان مقسم إلى حجرتين (Dual Compartment) لضمان الصيانة، بسعة لا تقل عن (التدفق الكلي × ٦٠ دقيقة) مع خط تغذية تعويضي سريع.',
    tags: ['خزان الحريق', 'زمن الاحتياطي', 'GPM', 'طلمبات الإطفاء']
  },
  {
    id: 'rej-06',
    category: 'suppression',
    severity: 'critical',
    titleAr: 'اعتماد طلمبة كهربائية واحدة فقط دون طلمبة ديزل احتياطية أو مصدر طاقة طوارئ',
    titleEn: 'Single electric fire pump without standby diesel pump or emergency backup power',
    authorityNoteAr: 'مرفوض: منظومة الضخ تعتمد على مضخة كهربائية واحدة فقط دون مضخة ديزل احتياطية أو مولد طوارئ مطابق لكود الحريق.',
    authorityNoteEn: 'Rejected: Fire pump arrangement lacks reliable redundant driver (Diesel standby) or emergency secondary power transfer.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الثاني - الباب الرابع (طلمبات الحريق): يلزم توفير مجموعة مضخات متكاملة تتكون من: طلمبة كهربائية رئيسية + طلمبة ديزل احتياطية كاملة القدرة + طلمبة جوكي مساعدة (Jockey Pump) للتعويض، ما لم تتوفر محطة كهرباء فرعية مزدوجة المصدر معتمدة من الحماية المدنية.',
    codeClauseEn: 'EFC 305 Part 2 Clause 4: Fire pumping system requires Main Electric + Standby Diesel (100% capacity) + Jockey pump.',
    violationDetailsAr: 'تقديم مخطط ميكانيكي يضم مضخة كهربائية فقط بقدرة ٥٠٠ GPM دون وجود محرك ديزل يعمل أوتوماتيكياً عند انقطاع التيار الكهربائي أثناء الحريق.',
    approvedSolutionAr: 'اعتماد مجموعة ضخ ثلاثية (طلمبة كهرباء + طلمبة ديزل + طلمبة جوكي) مع لوحات تحكم معتمدة (Listed Controllers) ومحبس اختبار التدفق (Flow Meter) ومحبس تخفيف الضغط (Relief Valve).',
    wrongPracticeAr: '❌ الاعتماد على شبكة الكهرباء العمومية فقط لتشغيل مضخة الحريق.',
    correctPracticeAr: '✔️ طاقم مضخات كامل (كهرباء + ديزل + جوكي) مع خزان وقود ديزل يكفي تشغيل المضخة ٨ ساعات متواصلة.',
    tags: ['طلمبات الحريق', 'طلمبة الديزل', 'طلمبة جوكي', 'انقطاع الكهرباء']
  },
  {
    id: 'rej-07',
    category: 'alarm_smoke',
    severity: 'high',
    titleAr: 'عدم تزويد سلالم الهروب المحمية بنظام ضغط موجب (Pressurization) في المباني التي تتجاوز ١٦ متراً',
    titleEn: 'Absence of stairwell pressurization system in buildings exceeding 16 meters',
    authorityNoteAr: 'مرفوض: سلم الهروب الداخلي مغلق تماماً وارتفاع المبنى يتجاوز ١٦ متراً دون تصميم شبكة ضغط موجب لمنع نفاذ الدخان إلى بئر السلم.',
    authorityNoteEn: 'Rejected: Enclosed exit stairwell lacks mechanical pressurization system required for mid-rise & high-rise buildings.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الثالث - الباب السادس (التحكم في الدخان) والقرار ٢٥٥/٢٠٢٦: يجب تزويد آبار سلالم الهروب الداخلية المغلقة في المباني التي يزيد ارتفاعها عن ١٦ متراً أو المباني ذات البدرومات المتعددة بنظام تهوية ميكانيكية بالضغط الموجب (Staircase Pressurization) يحافظ على فارق ضغط بين ٢٥ إلى ٥٠ باسكال عند فتح الأبواب.',
    codeClauseEn: 'EFC 305 Part 3 Clause 6: Enclosed stairwells in buildings > 16m require mechanical pressurization maintaining 25-50 Pa differential.',
    violationDetailsAr: 'اعتبار السلم آمناً بمجرد إحاطته بجدران مصمتة دون دراسة ميكانيكية لمنع سحب الدخان الساخن إلى داخل البئر بفعل تأثير المدخنة (Stack Effect).',
    approvedSolutionAr: 'تقديم حسابات معدل تدفق مراوح الضغط الموجب (CFM) مع مخارج هواء موزعة رأسياً كل ٣ أدوار، ولوحة تحكم تلقائية مرتبطة بحساسات كشف الدخان ونظام تغذية كهربائية من مولد الطوارئ.',
    wrongPracticeAr: '❌ الاعتماد على شباك صغير غير كافٍ في البسطة للتهوية الطبيعية في مبنى ارتفاعه يتجاوز ٢٠ متراً.',
    correctPracticeAr: '✔️ مروحة ضغط موجب على السطح أو منسوب الأرض مع حقن هواء نقي بمعدل محسوب ومحبس تفريغ الضغط الزائد (Barometric Damper).',
    tags: ['ضغط السلالم', 'سحب الدخان', 'ارتفاع ١٦ متر', 'القرار ٢٥٥']
  },
  {
    id: 'rej-08',
    category: 'compartment',
    severity: 'critical',
    titleAr: 'عدم توفير مصعد حريق (Firefighters Lift) مخصص لرجال الحماية المدنية في المباني التي تتجاوز ٢٤ متراً',
    titleEn: 'Absence of designated Firefighter Lift in buildings exceeding 24 meters',
    authorityNoteAr: 'مرفوض: ارتفاع المبنى يتجاوز ٢٤ متراً (من سطح الشارع حتى أرضية الطابق الأخير) دون تخصيص مصعد إطفاء محمي مع ردهة دخان مستقلة.',
    authorityNoteEn: 'Rejected: Building height exceeds 24 meters without code-compliant Firefighting Lift in protected shaft and vestibule.',
    codeClauseAr: 'الكود المصري ٣٠٥ - الجزء الأول - الباب الخامس بند ٥-٢ والقرار ٢٥٥ لسنة ٢٠٢٦: المباني التي يتجاوز ارتفاعها ٢٤ متراً (أرضية أعلى طابق مسكون) يلزم تزويدها بمصعد خدمة لرجال الإطفاء بحمولة لا تقل عن ١٠٠٠ كجم، وبئر مقاوم للحريق ٢ ساعة، وتغذية كهربائية مزدوجة الطوارئ مع مفتاح تشغيل ميكانيكي لرجال الحماية المدنية (Phase I & II Recall).',
    codeClauseEn: 'EFC 305 Clause 5-2 & Decree 255/2026: Buildings > 24m require at least one Firefighters Lift with 1000kg capacity, 2-hr shaft, and Phase I/II recall.',
    violationDetailsAr: 'اعتبار مصاعد الركاب العادية بديلاً دون عزل بئر المصعد أو توفير مفتاح الاستدعاء الخاص برجال الإطفاء أو عدم كفاية أبعاد الكابينة لنقل النقالات الطبية.',
    approvedSolutionAr: 'تخصيص أحد المصاعد كمصعد إطفاء يفتح على ردهة محمية مجاورة لسلم الهروب، مع تزويده بكابلات مقاومة للحريق ومصدر كهرباء طوارئ، وحاوية تحكم ذات مفتاح خاص برجال الإطفاء.',
    wrongPracticeAr: '❌ مبنى سكني أو تجاري بارتفاع ٣٠ متراً يضم مصعدين عاديين يفصلان أوتوماتيكياً ويهبطان للدور الأرضي دون مصعد مخصص للإطفائيين.',
    correctPracticeAr: '✔️ مصعد إطفاء مجهز بأبواب مقاومة للحريق ساعتين وفتحة نجاة سقفية وخاصية التحكم اليدوي لرجال الدفاع المدني.',
    tags: ['مصعد الإطفاء', 'ارتفاع ٢٤ متر', 'رجال الحماية المدنية', 'الكود المصري']
  }
];

export const CODE_INTERPRETATIONS = [
  {
    id: 'interp-01',
    topicAr: 'كيفية حساب ارتفاع المبنى وتحديد حد الـ ٢٤ متراً الفاصل',
    topicEn: 'How to calculate building height and the 24-meter threshold',
    questionAr: 'هل يُحسب ارتفاع المبنى في الكود المصري حتى ظهر بلاطة السطح الأخير (Roof Slab)، أم حتى بلاطة أرضية أعلى دور مسكون؟',
    questionEn: 'Is building height calculated to the top of the roof slab, or to the finished floor of the uppermost occupied level?',
    officialRulingAr: 'وفقاً لتعريفات الكود المصري ٣٠٥ (الجزء الأول - الباب الأول) والقرار الوزاري رقم ٢٥٥ لسنة ٢٠٢٦: يُقاس "ارتفاع المبنى المعتمد لاشتراطات مسالك الهروب والحماية المدنية" من منسوب سطح الشارع أو مسار وصول سيارات الإطفاء وحتى منسوب بلاطة أرضية أعلى طابق مسكون (Finished Floor Level of Highest Occupied Story)، ولا يشمل ذلك غرف الخدمات غير المسكونة أو أجهزة التكييف بالسطح.',
    engineeringImpactAr: 'هذا التفسير حاسم جداً؛ فإذا كان المبنى أرضي + ٥ أدوار علوية بارتفاع ٣م للدور، فإن منسوب أرضية الدور الخامس يكون عند منسوب +١٥٫٠٠م إلى +١٨٫٠٠م، وهو يقل قطعاً عن حد الـ ٢٤ متراً، فلا يخضع لاشتراطات المباني العالية أو مصاعد الإطفاء الإلزامية.',
    keyRuleAr: 'قاعدة ذهبية: ارتفاع الحماية المدنية = أرضية أعلى دور مشغول - منسوب الشارع (وليس الارتفاع الإجمالي للمبنى أو بيت الدرج).',
    category: 'height'
  },
  {
    id: 'interp-02',
    topicAr: 'الفرق الحاسم بين مسافة الارتحال المباشرة والحقيقية (Travel Distance)',
    topicEn: 'Difference between direct line of travel and actual travel path',
    questionAr: 'هل تقاس مسافة الارتحال حتى المخرج بخط مستقيم نظري أم بمسار الحركة الفعلي مع وجود القواطع والأثاث؟',
    questionEn: 'Is travel distance measured as a straight line, or along the actual path of natural walking travel around partitions?',
    officialRulingAr: 'يؤكد الكود المصري ٣٠٥ - الجزء الأول (الباب الثالث): تقاس مسافة الارتحال على طول المسار الطبيعي الحقيقي الذي يسلكه الشخص سيراً على الأقدام، على بُعد ٣٠ سم من الحوائط والزوايا وحول الحواجز والمكاتب، حتى الوصول إلى باب المخرج المحمي أو السلم، ولا يجوز احتسابها بخط مستقيم يخترق الجدران أو الأثاث الثابت.',
    engineeringImpactAr: 'إذا كانت المسافة المستقيمة بين أبعد نقطة والباب ٢٥ متراً ولكن المسار المتعرج يبلغ ٣٨ متراً، فإن المسافة المعتمدة كودياً هي ٣٨ متراً. وفي حال عدم وجود مخطط فرش معتمد، يتم ضرب المسافة المستقيمة في معامل تصحيح (١٫٣ إلى ١٫٥) لتعويض مسار الالتفاف.',
    keyRuleAr: 'قاعدة ذهبية: مسافة الارتحال = المسار الطبيعي الحقيقي حول العوائق حتى عتبة باب المخرج.',
    category: 'egress'
  },
  {
    id: 'interp-03',
    topicAr: 'هل يجوز فتح أبواب الغرف نحو الداخل إذا قل العدد عن ٥٠ شخصاً؟',
    topicEn: 'Are exit doors permitted to swing inward if occupant load is under 50?',
    questionAr: 'متى يكون فتح الباب نحو الداخل مسموحاً كودياً ومتى يُعد مخالفة جسيمة ترفضها الحماية المدنية؟',
    officialRulingAr: 'يسمح الكود المصري ٣٠٥ بفتح باب الحيز نحو الداخل فقط إذا كان الحيز مخصصاً لإشغال قليل الكثافة (أقل من ٥٠ شخصاً) ولا يحتوي على خطورة عالية (كالوقود أو المواد الكيماوية). أما إذا تجاوز عدد الشاغلين ٥٠ شخصاً (كقاعات المحاضرات، صالات التجمع، المتاجر الكبرى)، أو كان الباب مخرجاً يؤدي إلى سلم هروب أو الشارع، فيجب حتماً أن يفتح للخارج مع اتجاه الهروب.',
    engineeringImpactAr: 'في المكاتب الصغيرة أو الغرف الفندقية أو العيادات التي يسكنها أقل من ٥٠ فرداً، يجوز هندسياً فتح الباب للداخل لتفادي غلق الممر، بشرط ألا يعيق دوران الباب حركة الخروج.',
    keyRuleAr: 'قاعدة ذهبية: ≤ ٥٠ شخصاً خطورة عادية = مسموح للداخل | > ٥٠ شخصاً أو خطورة عالية أو أبواب السلالم = إلزامي للخارج مع الهروب.',
    category: 'doors'
  },
  {
    id: 'interp-04',
    topicAr: 'شروط دمج خزان مياه الشرب ومياه الإطفاء في خزان أرضي واحد',
    topicEn: 'Conditions for combining domestic and fire protection water storage',
    questionAr: 'هل تسمح الحماية المدنية بخزان مياه مشترك للشرب والري ومكافحة الحريق؟ وكيف نضمن عدم نفاد مياه الحريق؟',
    officialRulingAr: 'الكود المصري ٣٠٥ الجزء الثاني يسمح بإنشاء خزان مائي مشترك بشرط وحيد وجوهري: توفير "احتياطي ميت ميكانيكياً" لا تستطيع طلمبات الشرب أو الخدمة سحبه، وذلك برفع مستوى مواسير سحب مياه الخدمة والشرب فوق مستوى الاحتياطي المخصص للحريق، بينما توضع ماسورة سحب طلمبات الحريق في قاع الخزان مع صمام عدم رجوع ومحبس سحب مانع للدوامات (Vortex Plate).',
    engineeringImpactAr: 'يحمي هذا الإجراء المبنى من أزمة نفاد مياه الحريق عند انقطاع المياه العمومية، وتوافق عليه إدارة الحماية المدنية فوراً بشرط إرفاق قطاع هيدروليكي يوضح مناسيب السحب.',
    keyRuleAr: 'قاعدة ذهبية: سحب الشرب في الثلث العلوي، وسحب الحريق في القاع مع لوح مانع للدوامات لضمان كامل سعة الحريق.',
    category: 'suppression'
  },
  {
    id: 'interp-05',
    topicAr: 'المخرج النهائي (Exit Discharge) ومسار الإفراغ في الدور الأرضي',
    topicEn: 'Exit Discharge requirements and travel path at grade level',
    questionAr: 'إذا فرغ سلم الهروب في ردهة الدور الأرضي وليس إلى الشارع مباشرة، فما هي الشروط الواجب توفرها؟',
    officialRulingAr: 'الكود المصري ٣٠٥ الجزء الأول بند ٣-٦ يسمح بأن يفرغ سلم واحد بحد أقصى (لا يتجاوز ٥٠٪ من طاقة مسالك الهروب) في ردهة الدور الأرضي، بشرط: أن تكون الردهة مزودة بنظام رشاشات مياه تلقائية، وألا تزيد مسافة السير من قاعدة السلم إلى الشارع عن ٩ أمتار، وأن تكون الردهة مفصولة عن باقي الأدوار.',
    engineeringImpactAr: 'إذا كان المبنى يحتوي على سلمين، فيجب أن يفرغ أحدهما على الأقل مباشرة إلى الهواء الطلق في منسوب الرصيف، بينما يجوز للثاني الإفراغ في الردهة الرئيسية المطابقة للاشتراطات.',
    keyRuleAr: 'قاعدة ذهبية: ٥٠٪ على الأقل من السلالم يجب أن تفرغ مباشرة للخارج دون المرور بردهات داخلية.',
    category: 'egress'
  }
];

export const FREQUENTLY_ASKED_QUESTIONS = [
  {
    qAr: 'ما هي حمولة الإشغال المعيارية (Occupant Load Factor) للمكاتب والمتاجر والسكني؟',
    aAr: 'وفق جدول الكود المصري ٣٠٥: المكاتب الإدارية: ٩٫٣ م² / شخص (صافي) | المتاجر في الدور الأرضي: ٢٫٨ م² / شخص (إجمالي) | المتاجر بالأدوار العليا: ٥٫٦ م² / شخص | المباني السكنية: ١٨٫٥ م² / شخص.',
    tag: 'حمولة الإشغال'
  },
  {
    qAr: 'كم عدد مخارج الطوارئ الإلزامية لأي طابق وفق الكود المصري؟',
    aAr: 'مخرجان متباعدان على الأقل لأي طابق أو حيز إذا زادت حمولة الإشغال عن ٥٠ شخصاً أو زادت مسافة الارتحال لنقطة الخروج الوحيدة عن المسموح. وإذا زادت الحمولة عن ٥٠٠ شخص يلزم ٣ مخارج، وأكثر من ١٠٠٠ شخص يلزم ٤ مخارج.',
    tag: 'عدد المخارج'
  },
  {
    qAr: 'ما هي قاعدة نصف القطر (Diagonal Rule) لتحديد المسافة بين المخرجين؟',
    aAr: 'المسافة بين أي مخرجين يجب ألا تقل عن نصف طول القطر الأكبر للمبنى أو الحيز (D / 2) في المباني غير المزودة برشاشات، أو ثلث القطر (D / 3) في المباني المحمية بالكامل بشبكة رشاشات تلقائية معتمدة.',
    tag: 'تباعد المخارج'
  },
  {
    qAr: 'ما هو العرض الصافي المطلوب لدرج الهروب لشخص واحد مقابل مجموع الشاغلين؟',
    aAr: 'العرض الأدنى لمسار سلم الهروب هو ١٫١٠ متر (ويسمح بـ ٠٫٩٠م للمباني الصغيرة التي يقل إشغالها عن ٥٠ فرداً). ويُحسب العرض الفعلي بضرب عدد الشاغلين في معامل ٧٫٦ مم لكل شخص.',
    tag: 'عروض السلالم'
  },
  {
    qAr: 'هل يلزم دهان الهيكل المعدني بمواد منتفخة مقاومة للحريق (Intumescent Paint)؟',
    aAr: 'نعم، الهياكل المعدنية تفقد قوتها الإنشائية وتنهار عند ٥٥٠ درجة مئوية. يلزم دهان الأعمدة والكمرات بمواد منتفخة معتمدة أو تغليفها بألواح جبسية لتأمين مقاومة حريق من ساعة إلى ساعتين بحسب تصنيف المبنى.',
    tag: 'مقاومة الهياكل المعدنية'
  }
];
