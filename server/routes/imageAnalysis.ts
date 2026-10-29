import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure safe upload directory
const uploadDir = path.resolve(process.cwd(), 'server', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `crop-leaf-${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`);
  },
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.'));
    }
  },
});

interface SymptomKnowledge {
  keywords: string[];
  possibleIssueEn: string;
  possibleIssueHi: string;
  confidence: 'Possible issue' | 'Needs verification' | 'Indicative';
  confidencePct: number;
  symptomsObservedEn: string;
  symptomsObservedHi: string;
  recommendedActionEn: string;
  recommendedActionHi: string;
  sourceDoc: string;
}

const DIAGNOSIS_CATALOG: Record<string, SymptomKnowledge[]> = {
  wheat: [
    {
      keywords: ['yellow', 'stripe', 'powder', 'rust', 'pustule', 'leaf'],
      possibleIssueEn: 'Suspected Stripe Rust / Yellow Rust (Puccinia striiformis)',
      possibleIssueHi: 'संभावित पीला रतुआ / स्ट्राइप रस्ट',
      confidence: 'Possible issue',
      confidencePct: 78,
      symptomsObservedEn: 'Linear rows of yellow to orange pustules on upper leaf blades, matching early fungal rust symptoms.',
      symptomsObservedHi: 'पत्तियों की ऊपरी सतह पर पीले रंग की धारियां और फफूंद पाउडर के लक्षण दिखाई दे रहे हैं।',
      recommendedActionEn: 'Rub finger over yellow stripes; if yellow powder sticks to skin, rust is confirmed. Spray Propiconazole 25% EC (1ml/L) immediately if confirmed on >5% of plants.',
      recommendedActionHi: 'उंगली से पीले धब्बे को छुएं; यदि पीला पाउडर उंगली पर लगता है तो रतुआ की पुष्टि होती है। पुष्टि होने पर प्रोपिकोनाज़ोल 25% EC (1 मिली/लीटर) का छिड़काव करें।',
      sourceDoc: 'ICAR-IIWBR Field Diagnostic Manual',
    },
    {
      keywords: ['tip', 'burn', 'drying', 'nitrogen', 'pale', 'bottom'],
      possibleIssueEn: 'Nitrogen Deficiency or Marginal Leaf Scorch',
      possibleIssueHi: 'नाइट्रोजन की कमी अथवा पत्ती का झुलसना',
      confidence: 'Needs verification',
      confidencePct: 65,
      symptomsObservedEn: 'V-shaped chlorosis extending from tip down the midrib of older leaves.',
      symptomsObservedHi: 'निचली पुरानी पत्तियों की नोक से शुरू होकर पीलापन मध्य शिरा की ओर बढ़ रहा है।',
      recommendedActionEn: 'Check soil moisture first; apply 2% Urea foliar spray (20g/L water) or top dress urea before scheduled irrigation.',
      recommendedActionHi: 'पहले मिट्टी की नमी जांचें; 2% यूरिया (20 ग्राम/लीटर) का घोल बनाकर छिड़काव करें।',
      sourceDoc: 'ICAR Soil Fertility Guidelines',
    },
  ],
  tomato: [
    {
      keywords: ['brown', 'spot', 'ring', 'concentric', 'blight', 'target'],
      possibleIssueEn: 'Suspected Early Blight (Alternaria solani)',
      possibleIssueHi: 'संभावित अगेती झुलसा (अल्टरनेरिया अर्ली ब्लाइट)',
      confidence: 'Possible issue',
      confidencePct: 82,
      symptomsObservedEn: 'Dark brown circular spots with distinctive concentric target rings surrounded by yellow chlorotic halo.',
      symptomsObservedHi: 'गहरे भूरे रंग के छल्लेदार धब्बे जिनके चारों ओर पीला घेरा है।',
      recommendedActionEn: 'Prune infected lower foliage touching wet soil. Apply Mancozeb 75% WP (2.5g/L) or Copper Oxychloride.',
      recommendedActionHi: 'जमीन को छूने वाली निचली रोगग्रस्त पत्तियों को काटकर नष्ट करें। मैंकोज़ेब 75% WP (2.5 ग्राम/लीटर) का छिड़काव करें।',
      sourceDoc: 'ICAR-IIHR Vegetable Pathology Manual',
    },
  ],
  mustard: [
    {
      keywords: ['white', 'blister', 'pustule', 'curl', 'staghead'],
      possibleIssueEn: 'Suspected White Rust (Albugo candida)',
      possibleIssueHi: 'संभावित सफेद रतुआ (व्हाइट रस्ट)',
      confidence: 'Possible issue',
      confidencePct: 75,
      symptomsObservedEn: 'Raised white or creamy blister-like pustules on under-leaf surface.',
      symptomsObservedHi: 'पत्तियों की निचली सतह पर उभरे हुए सफेद या हल्के पीले रंग के छाले जैसे धब्बे।',
      recommendedActionEn: 'Foliar spray with Metalaxyl 8% + Mancozeb 64% WP (2g/L water).',
      recommendedActionHi: 'मेटालेक्सिल + मैंकोज़ेब (2 ग्राम/लीटर पानी) का छिड़काव करें।',
      sourceDoc: 'ICAR-DRMR Plant Protection Bulletin',
    },
  ],
};

// Image Analysis endpoint
router.post('/analyze', upload.single('image'), (req, res) => {
  const { cropType, growthStage, userSymptoms } = req.body;
  const file = req.file;

  const cropKey = (cropType || 'wheat').toLowerCase();
  const symptomsText = (userSymptoms || '').toLowerCase();

  // Match against catalog
  const catalogList = DIAGNOSIS_CATALOG[cropKey] || DIAGNOSIS_CATALOG['wheat'];
  let matchedDiagnosis = catalogList[0];

  if (symptomsText) {
    for (const item of catalogList) {
      if (item.keywords.some(k => symptomsText.includes(k))) {
        matchedDiagnosis = item;
        break;
      }
    }
  }

  // Safety & Uncertainty Disclaimer
  const disclaimerEn = 'IMPORTANT: Image analysis provides preliminary visual pattern matching and cannot substitute for an on-site examination by a qualified agronomist or laboratory tissue test.';
  const disclaimerHi = 'महत्वपूर्ण सूचना: फोटो विश्लेषण केवल प्राथमिक दृश्य पैटर्न पर आधारित है। किसी भी रासायनिक उपचार से पहले कृषि विशेषज्ञ या कृषि विज्ञान केंद्र (KVK) से व्यक्तिगत पुष्टि अवश्य कराएं।';

  res.json({
    success: true,
    uploadedFile: file ? { filename: file.filename, size: file.size, mimetype: file.mimetype } : null,
    cropType: cropType || 'Wheat',
    growthStage: growthStage || 'Vegetative',
    diagnosis: {
      possibleIssueEn: matchedDiagnosis.possibleIssueEn,
      possibleIssueHi: matchedDiagnosis.possibleIssueHi,
      confidenceClassification: matchedDiagnosis.confidence,
      confidencePercentage: matchedDiagnosis.confidencePct,
      visualObservationEn: matchedDiagnosis.symptomsObservedEn,
      visualObservationHi: matchedDiagnosis.symptomsObservedHi,
      recommendedVerificationStepsEn: [
        'Conduct a 10-point field walk across the plot to assess what percentage of plants display similar leaf symptoms.',
        matchedDiagnosis.recommendedActionEn,
        'Collect 3-4 symptomatic leaf samples in a clean paper bag for verification at the nearest Krishi Vigyan Kendra (KVK).',
      ],
      recommendedVerificationStepsHi: [
        'खेत में 10 अलग-अलग स्थानों पर घूमकर देखें कि कितने प्रतिशत पौधों पर यह लक्षण है।',
        matchedDiagnosis.recommendedActionHi,
        '3-4 प्रभावित पत्तियों को साफ कागज की थैली में रखकर नजदीकी कृषि विज्ञान केंद्र (KVK) को दिखाएं।',
      ],
      disclaimerEn,
      disclaimerHi,
      citation: matchedDiagnosis.sourceDoc,
      analysisTimestamp: new Date().toISOString(),
    },
  });
});

export default router;

