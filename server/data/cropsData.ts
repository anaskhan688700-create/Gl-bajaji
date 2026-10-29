export interface CropStageThresholds {
  minMoisture: number; // percentage %
  maxMoisture: number; // percentage %
  waterStressAlert: number; // moisture below this is severe stress
  waterExcessAlert: number; // moisture above this risks root rot
}

export interface CropData {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'Cereal' | 'Pulse' | 'Oilseed' | 'Commercial' | 'Vegetable' | 'Cash';
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Whole Year';
  suitableSoils: string[];
  optimalPh: { min: number; max: number };
  optimalTemp: { min: number; max: number }; // °C
  optimalHumidity: { min: number; max: number }; // %
  waterNeedCategory: 'Low' | 'Moderate' | 'High' | 'Very High';
  waterNeedMm: { min: number; max: number };
  durationDays: { min: number; max: number };
  stageThresholds: Record<string, CropStageThresholds>;
  economics: {
    avgCostPerAcre: number; // INR
    breakdownCostPerAcre: {
      seed: number;
      fertilizer: number;
      irrigation: number;
      labor: number;
      machinery: number;
      cropProtection: number;
      other: number;
    };
    yieldPerAcreQuintal: { min: number; max: number; avg: number };
    typicalPricePerQuintal: number; // INR (MSP or typical Mandi rate)
  };
  diseaseTriggers: {
    diseaseNameEn: string;
    diseaseNameHi: string;
    condition: string;
    symptoms: string;
    preventiveActionEn: string;
    preventiveActionHi: string;
  }[];
  rotationBenefits: string[];
  rotationRestrictions: string[];
  icardatasetCitation: string;
}

export const CROPS_DATABASE: CropData[] = [
  {
    id: 'wheat',
    nameEn: 'Wheat',
    nameHi: 'गेहूँ',
    category: 'Cereal',
    season: 'Rabi',
    suitableSoils: ['Alluvial', 'Loam', 'Clay Loam', 'Sandy Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    optimalTemp: { min: 12, max: 25 },
    optimalHumidity: { min: 40, max: 70 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 450, max: 650 },
    durationDays: { min: 110, max: 140 },
    stageThresholds: {
      'Crown Root Initiation (20-25 DAS)': { minMoisture: 45, maxMoisture: 75, waterStressAlert: 35, waterExcessAlert: 85 },
      'Tillering (40-45 DAS)': { minMoisture: 40, maxMoisture: 70, waterStressAlert: 30, waterExcessAlert: 80 },
      'Flowering / Boot Stage (70-80 DAS)': { minMoisture: 50, maxMoisture: 75, waterStressAlert: 38, waterExcessAlert: 85 },
      'Milking / Grain Filling (90-105 DAS)': { minMoisture: 45, maxMoisture: 70, waterStressAlert: 32, waterExcessAlert: 80 },
      'Maturity / Ripening': { minMoisture: 25, maxMoisture: 55, waterStressAlert: 18, waterExcessAlert: 75 },
    },
    economics: {
      avgCostPerAcre: 14500,
      breakdownCostPerAcre: {
        seed: 2200,
        fertilizer: 3400,
        irrigation: 2600,
        labor: 3100,
        machinery: 2000,
        cropProtection: 1200,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 18, max: 24, avg: 21 },
      typicalPricePerQuintal: 2275, // Govt MSP 2024-25
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Yellow / Stripe Rust (Puccinia striiformis)',
        diseaseNameHi: 'पीला रतुआ (येलो रस्ट)',
        condition: 'Ambient Temp 10-18°C and Humidity > 80% for 48+ hrs',
        symptoms: 'Yellow stripe-like pustules on leaf surface',
        preventiveActionEn: 'Spray Propiconazole 25% EC (1ml/L) or Tebuconazole upon initial symptom detection; inspect northern field borders.',
        preventiveActionHi: 'लक्षण दिखते ही प्रोपिकोनाज़ोल 25% EC (1 मिली/लीटर) का छिड़काव करें; खेत की उत्तरी सीमाओं की जांच करें।',
      },
      {
        diseaseNameEn: 'Karnal Bunt (Tilletia indica)',
        diseaseNameHi: 'करनाल बंट',
        condition: 'Humid conditions during flowering stage with light rain',
        symptoms: 'Fishy odor and partial black powdery grains',
        preventiveActionEn: 'Avoid excessive late-stage irrigation during flowering.',
        preventiveActionHi: 'फूल आने के समय आवश्यकता से अधिक सिंचाई से बचें।',
      },
    ],
    rotationBenefits: ['Restores soil stability when rotated with Legumes like Moong or Gram'],
    rotationRestrictions: ['Continuous wheat-paddy rotation depletes groundwater and subsoil zinc'],
    icardatasetCitation: 'ICAR-IIWBR (Indian Institute of Wheat & Barley Research, Karnal)',
  },
  {
    id: 'paddy',
    nameEn: 'Paddy (Rice)',
    nameHi: 'धान (चावल)',
    category: 'Cereal',
    season: 'Kharif',
    suitableSoils: ['Clay Loam', 'Clay', 'Alluvial'],
    optimalPh: { min: 5.5, max: 7.2 },
    optimalTemp: { min: 22, max: 35 },
    optimalHumidity: { min: 65, max: 90 },
    waterNeedCategory: 'Very High',
    waterNeedMm: { min: 1100, max: 1500 },
    durationDays: { min: 115, max: 150 },
    stageThresholds: {
      'Transplanting & Seedling': { minMoisture: 70, maxMoisture: 95, waterStressAlert: 55, waterExcessAlert: 98 },
      'Active Tillering': { minMoisture: 65, maxMoisture: 90, waterStressAlert: 50, waterExcessAlert: 98 },
      'Panicle Initiation': { minMoisture: 70, maxMoisture: 90, waterStressAlert: 55, waterExcessAlert: 98 },
      'Flowering': { minMoisture: 65, maxMoisture: 85, waterStressAlert: 50, waterExcessAlert: 95 },
      'Grain Hardening & Maturity': { minMoisture: 35, maxMoisture: 65, waterStressAlert: 25, waterExcessAlert: 80 },
    },
    economics: {
      avgCostPerAcre: 19800,
      breakdownCostPerAcre: {
        seed: 1800,
        fertilizer: 4200,
        irrigation: 4800,
        labor: 5200,
        machinery: 2400,
        cropProtection: 1400,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 22, max: 32, avg: 26 },
      typicalPricePerQuintal: 2300, // Common Grade MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
        diseaseNameHi: 'जीवाणु झुलसा (बैक्टीरियल लीफ ब्लाइट)',
        condition: 'Temp 25-34°C with high humidity > 85% and strong winds',
        symptoms: 'Water-soaked translucent stripes on leaf margins turning yellowish white',
        preventiveActionEn: 'Drain standing water for 48 hours; avoid top-dressing nitrogen fertilizers until symptoms subside.',
        preventiveActionHi: 'खेत से खड़ा पानी 48 घंटे के लिए निकालें; यूरिया/नाइट्रोजन का छिड़काव तुरंत रोकें।',
      },
      {
        diseaseNameEn: 'Paddy Blast (Magnaporthe oryzae)',
        diseaseNameHi: 'धान का झोंका रोग (ब्लास्ट)',
        condition: 'Night temp 20-24°C, day temp > 28°C with prolonged dew',
        symptoms: 'Spindle-shaped lesions with grayish centers and brown borders',
        preventiveActionEn: 'Foliar spray of Tricyclazole 75% WP (0.6g/L) during early vegetative or panicle emergence.',
        preventiveActionHi: 'ट्राइसाइक्लाज़ोल 75% WP (0.6 ग्राम/लीटर) का छिड़काव करें।',
      },
    ],
    rotationBenefits: ['Provides high biomass, breaks cycles of upland weed species'],
    rotationRestrictions: ['Requires intensive puddling which can create a hardpan for deep-rooted follow-up crops'],
    icardatasetCitation: 'ICAR-NRRI (National Rice Research Institute, Cuttack)',
  },
  {
    id: 'cotton',
    nameEn: 'Cotton',
    nameHi: 'कपास',
    category: 'Commercial',
    season: 'Kharif',
    suitableSoils: ['Black Soil (Regur)', 'Deep Alluvial', 'Clay Loam'],
    optimalPh: { min: 6.5, max: 8.2 },
    optimalTemp: { min: 21, max: 35 },
    optimalHumidity: { min: 50, max: 75 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 600, max: 850 },
    durationDays: { min: 150, max: 180 },
    stageThresholds: {
      'Germination & Seedling': { minMoisture: 40, maxMoisture: 65, waterStressAlert: 28, waterExcessAlert: 80 },
      'Square Formation (Squaring)': { minMoisture: 45, maxMoisture: 70, waterStressAlert: 32, waterExcessAlert: 80 },
      'Flowering & Boll Development': { minMoisture: 50, maxMoisture: 72, waterStressAlert: 35, waterExcessAlert: 82 },
      'Boll Opening & Harvest': { minMoisture: 30, maxMoisture: 55, waterStressAlert: 20, waterExcessAlert: 70 },
    },
    economics: {
      avgCostPerAcre: 23500,
      breakdownCostPerAcre: {
        seed: 3800,
        fertilizer: 4600,
        irrigation: 3200,
        labor: 6800,
        machinery: 2100,
        cropProtection: 3000,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 8, max: 14, avg: 11 },
      typicalPricePerQuintal: 7121, // Medium staple MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Cotton Bollworm / Pink Bollworm',
        diseaseNameHi: 'गुलाबी सुंडी (पिंक बॉलवर्म)',
        condition: 'Warm humid nights (>22°C) during mid-boll formation',
        symptoms: 'Rosetted flowers, bore holes in developing green bolls',
        preventiveActionEn: 'Install pheromone traps (5/acre); inspect 20 bolls/acre weekly; spray recommended bio-pesticide.',
        preventiveActionHi: 'फेरोमोन ट्रैप (5 प्रति एकड़) लगाएं; साप्ताहिक आधार पर बोंडों का निरीक्षण करें।',
      },
    ],
    rotationBenefits: ['Deep tap-root structure aerates deep subsoil'],
    rotationRestrictions: ['Avoid planting Okra (Bhindi) nearby as they share common sucking pest complexes'],
    icardatasetCitation: 'ICAR-CICR (Central Institute for Cotton Research, Nagpur)',
  },
  {
    id: 'mustard',
    nameEn: 'Mustard',
    nameHi: 'सरसों',
    category: 'Oilseed',
    season: 'Rabi',
    suitableSoils: ['Sandy Loam', 'Loam', 'Alluvial'],
    optimalPh: { min: 6.0, max: 7.8 },
    optimalTemp: { min: 10, max: 25 },
    optimalHumidity: { min: 45, max: 70 },
    waterNeedCategory: 'Low',
    waterNeedMm: { min: 250, max: 400 },
    durationDays: { min: 105, max: 130 },
    stageThresholds: {
      'Vegetative Growth': { minMoisture: 35, maxMoisture: 65, waterStressAlert: 22, waterExcessAlert: 75 },
      'Flowering Stage': { minMoisture: 40, maxMoisture: 65, waterStressAlert: 28, waterExcessAlert: 75 },
      'Pod Development (Siliquae)': { minMoisture: 35, maxMoisture: 60, waterStressAlert: 24, waterExcessAlert: 70 },
      'Maturity': { minMoisture: 20, maxMoisture: 45, waterStressAlert: 15, waterExcessAlert: 65 },
    },
    economics: {
      avgCostPerAcre: 11200,
      breakdownCostPerAcre: {
        seed: 900,
        fertilizer: 2800,
        irrigation: 1800,
        labor: 2700,
        machinery: 1800,
        cropProtection: 1200,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 7, max: 11, avg: 9 },
      typicalPricePerQuintal: 5650, // Govt MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Mustard Aphid (Lipaphis erysimi)',
        diseaseNameHi: 'सरसों का चेपा / माहू (एफिड)',
        condition: 'Cloudy weather with temp 15-20°C and RH > 75%',
        symptoms: 'Curling of tender inflorescence and honeydew secretion',
        preventiveActionEn: 'Foliar spray of Dimethoate 30% EC or Imidacloprid 17.8% SL (0.3ml/L) when 20% plants show infestation.',
        preventiveActionHi: '20% पौधों पर माहू दिखते ही इमिडाक्लोप्रिड 17.8% SL (0.3 मिली/लीटर) का छिड़काव करें।',
      },
    ],
    rotationBenefits: ['Excellent low-water rotation crop following Kharif maize or pearl millet'],
    rotationRestrictions: ['Susceptible to White Rust in waterlogged lowlands'],
    icardatasetCitation: 'ICAR-DRMR (Directorate of Rapeseed-Mustard Research, Bharatpur)',
  },
  {
    id: 'chickpea',
    nameEn: 'Chickpea / Gram',
    nameHi: 'चना',
    category: 'Pulse',
    season: 'Rabi',
    suitableSoils: ['Sandy Loam', 'Loam', 'Clay Loam', 'Black Soil'],
    optimalPh: { min: 6.2, max: 8.0 },
    optimalTemp: { min: 14, max: 28 },
    optimalHumidity: { min: 35, max: 65 },
    waterNeedCategory: 'Low',
    waterNeedMm: { min: 200, max: 350 },
    durationDays: { min: 95, max: 125 },
    stageThresholds: {
      'Branching': { minMoisture: 30, maxMoisture: 60, waterStressAlert: 20, waterExcessAlert: 75 },
      'Pre-flowering': { minMoisture: 35, maxMoisture: 62, waterStressAlert: 24, waterExcessAlert: 75 },
      'Pod Filling': { minMoisture: 30, maxMoisture: 58, waterStressAlert: 20, waterExcessAlert: 70 },
      'Maturity': { minMoisture: 18, maxMoisture: 40, waterStressAlert: 12, waterExcessAlert: 60 },
    },
    economics: {
      avgCostPerAcre: 10800,
      breakdownCostPerAcre: {
        seed: 2400,
        fertilizer: 2000,
        irrigation: 1200,
        labor: 2600,
        machinery: 1600,
        cropProtection: 1000,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 6, max: 10, avg: 8 },
      typicalPricePerQuintal: 5440, // Govt MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Fusarium Wilt (Fusarium oxysporum f. sp. ciceris)',
        diseaseNameHi: 'उकठा रोग (विल्ट)',
        condition: 'High soil temperatures (>25°C) and sudden moisture stress or dry spells',
        symptoms: 'Drooping petioles, sudden drying and internal vascular browning',
        preventiveActionEn: 'Use Trichoderma viride seed treatment; avoid deep sowing in warm soil; cultivate wilt-resistant cultivars.',
        preventiveActionHi: 'ट्राइकोडर्मा विरिडी से बीज उपचार करें; विल्ट प्रतिरोधी किस्मों का चयन करें।',
      },
    ],
    rotationBenefits: ['Fixes 30-40 kg atmospheric nitrogen per acre, significantly reducing subsequent fertilizer costs'],
    rotationRestrictions: ['Extremely sensitive to soil waterlogging; avoid poorly drained clayey depressions'],
    icardatasetCitation: 'ICAR-IIPR (Indian Institute of Pulses Research, Kanpur)',
  },
  {
    id: 'sugarcane',
    nameEn: 'Sugarcane',
    nameHi: 'गन्ना',
    category: 'Commercial',
    season: 'Whole Year',
    suitableSoils: ['Deep Alluvial', 'Loam', 'Black Soil'],
    optimalPh: { min: 6.5, max: 7.8 },
    optimalTemp: { min: 20, max: 38 },
    optimalHumidity: { min: 55, max: 85 },
    waterNeedCategory: 'Very High',
    waterNeedMm: { min: 1400, max: 2200 },
    durationDays: { min: 300, max: 365 },
    stageThresholds: {
      'Germination': { minMoisture: 55, maxMoisture: 80, waterStressAlert: 40, waterExcessAlert: 90 },
      'Formative / Tillering': { minMoisture: 60, maxMoisture: 82, waterStressAlert: 45, waterExcessAlert: 90 },
      'Grand Growth Period': { minMoisture: 65, maxMoisture: 85, waterStressAlert: 50, waterExcessAlert: 92 },
      'Ripening & Sugar Accumulation': { minMoisture: 35, maxMoisture: 60, waterStressAlert: 25, waterExcessAlert: 75 },
    },
    economics: {
      avgCostPerAcre: 38500,
      breakdownCostPerAcre: {
        seed: 7500,
        fertilizer: 7200,
        irrigation: 6800,
        labor: 10200,
        machinery: 4400,
        cropProtection: 2400,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 280, max: 380, avg: 330 },
      typicalPricePerQuintal: 340, // Fair & Remunerative Price (FRP)
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Red Rot (Colletotrichum falcatum)',
        diseaseNameHi: 'गन्ने का लाल सड़न रोग (रेड रॉट)',
        condition: 'Continuous waterlogging and warm humid weather 28-32°C',
        symptoms: 'Third or fourth leaf wilts from top, internal red pith with cross-wise white patches',
        preventiveActionEn: 'Plant disease-free setts treated with Carbendazim; rogue out infected clumps immediately.',
        preventiveActionHi: 'कार्बेंडाजिम से उपचारित स्वस्थ गन्ने के टुकड़ों की बुवाई करें; रोगग्रस्त पौधों को नष्ट करें।',
      },
    ],
    rotationBenefits: ['High organic matter addition from trash and root residues'],
    rotationRestrictions: ['Locks field for 12-14 months; heavy water and nutrient extractor'],
    icardatasetCitation: 'ICAR-IISR (Indian Institute of Sugarcane Research, Lucknow)',
  },
  {
    id: 'maize',
    nameEn: 'Maize (Corn)',
    nameHi: 'मक्का',
    category: 'Cereal',
    season: 'Kharif',
    suitableSoils: ['Well-drained Loam', 'Sandy Loam', 'Alluvial'],
    optimalPh: { min: 5.8, max: 7.2 },
    optimalTemp: { min: 18, max: 32 },
    optimalHumidity: { min: 50, max: 80 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 450, max: 600 },
    durationDays: { min: 85, max: 110 },
    stageThresholds: {
      'Knee-high Vegetative': { minMoisture: 40, maxMoisture: 70, waterStressAlert: 28, waterExcessAlert: 80 },
      'Tasseling & Silking': { minMoisture: 55, maxMoisture: 78, waterStressAlert: 40, waterExcessAlert: 85 },
      'Grain Filling': { minMoisture: 45, maxMoisture: 72, waterStressAlert: 32, waterExcessAlert: 80 },
      'Maturity': { minMoisture: 25, maxMoisture: 50, waterStressAlert: 15, waterExcessAlert: 70 },
    },
    economics: {
      avgCostPerAcre: 13500,
      breakdownCostPerAcre: {
        seed: 2400,
        fertilizer: 3600,
        irrigation: 2200,
        labor: 2800,
        machinery: 1500,
        cropProtection: 1000,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 20, max: 28, avg: 24 },
      typicalPricePerQuintal: 2090, // Govt MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Fall Armyworm (Spodoptera frugiperda)',
        diseaseNameHi: 'फॉल आर्मीवर्म (सुंडी)',
        condition: 'Dry warm spells during vegetative stage',
        symptoms: 'Pinholes, window paning in leaf whorls, sawdust-like fecal frass',
        preventiveActionEn: 'Apply neem cake in soil; spray Emamectin benzoate 5% SG (0.4g/L) into whorls if 10% plants show damage.',
        preventiveActionHi: 'गोभ में इमामेक्टिन बेंजोएट 5% SG (0.4 ग्राम/लीटर) का छिड़काव करें।',
      },
    ],
    rotationBenefits: ['Versatile C4 crop, ideal in rotations with mustard or potato in northern plains'],
    rotationRestrictions: ['Very intolerant to waterlogging during early seedling stages'],
    icardatasetCitation: 'ICAR-IIMR (Indian Institute of Maize Research, Ludhiana)',
  },
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameHi: 'टमाटर',
    category: 'Vegetable',
    season: 'Rabi',
    suitableSoils: ['Sandy Loam', 'Loam', 'Red Loam'],
    optimalPh: { min: 6.0, max: 7.0 },
    optimalTemp: { min: 18, max: 28 },
    optimalHumidity: { min: 50, max: 75 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 400, max: 600 },
    durationDays: { min: 100, max: 135 },
    stageThresholds: {
      'Transplanting & Early Growth': { minMoisture: 50, maxMoisture: 75, waterStressAlert: 35, waterExcessAlert: 85 },
      'Flowering & Fruit Set': { minMoisture: 55, maxMoisture: 75, waterStressAlert: 40, waterExcessAlert: 82 },
      'Fruit Development': { minMoisture: 50, maxMoisture: 72, waterStressAlert: 36, waterExcessAlert: 80 },
      'Harvesting / Picking': { minMoisture: 40, maxMoisture: 65, waterStressAlert: 28, waterExcessAlert: 75 },
    },
    economics: {
      avgCostPerAcre: 28000,
      breakdownCostPerAcre: {
        seed: 4500,
        fertilizer: 5200,
        irrigation: 3800,
        labor: 8500,
        machinery: 2500,
        cropProtection: 3500,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 120, max: 220, avg: 160 },
      typicalPricePerQuintal: 1400, // Mandi average
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Early Blight (Alternaria solani)',
        diseaseNameHi: 'टमाटर का अगेती झुलसा (अल्टरनेरिया ब्लाइट)',
        condition: 'Warm humid weather (24-29°C) with frequent showers or heavy dew',
        symptoms: 'Concentric brown rings ("target board") on lower leaves spreading upward',
        preventiveActionEn: 'Foliar spray of Mancozeb 75% WP (2g/L) or Azoxystrobin + Difenoconazole (1ml/L).',
        preventiveActionHi: 'मैंकोज़ेब 75% WP (2 ग्राम/लीटर) का छिड़काव करें और निचली रोगग्रस्त पत्तियों को हटाएं।',
      },
    ],
    rotationBenefits: ['High value cash crop; rapid turnover in 4 months'],
    rotationRestrictions: ['Never rotate immediately with Potato or Eggplant (shares Solanaceae pathogens)'],
    icardatasetCitation: 'ICAR-IIHR (Indian Institute of Horticultural Research, Bengaluru)',
  },
  {
    id: 'potato',
    nameEn: 'Potato',
    nameHi: 'आलू',
    category: 'Vegetable',
    season: 'Rabi',
    suitableSoils: ['Sandy Loam', 'Loose Alluvial Loam'],
    optimalPh: { min: 5.2, max: 6.8 },
    optimalTemp: { min: 15, max: 22 },
    optimalHumidity: { min: 60, max: 85 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 400, max: 550 },
    durationDays: { min: 80, max: 105 },
    stageThresholds: {
      'Vegetative Emergence': { minMoisture: 45, maxMoisture: 70, waterStressAlert: 32, waterExcessAlert: 80 },
      'Stolonization & Tuber Initiation': { minMoisture: 55, maxMoisture: 75, waterStressAlert: 42, waterExcessAlert: 85 },
      'Tuber Bulking': { minMoisture: 55, maxMoisture: 75, waterStressAlert: 40, waterExcessAlert: 82 },
      'Skin Maturation': { minMoisture: 30, maxMoisture: 50, waterStressAlert: 20, waterExcessAlert: 65 },
    },
    economics: {
      avgCostPerAcre: 34000,
      breakdownCostPerAcre: {
        seed: 12000,
        fertilizer: 5800,
        irrigation: 3200,
        labor: 7200,
        machinery: 3800,
        cropProtection: 2000,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 100, max: 160, avg: 130 },
      typicalPricePerQuintal: 950,
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Late Blight (Phytophthora infestans)',
        diseaseNameHi: 'आलू का पछेती झुलसा (लेट ब्लाइट)',
        condition: 'Temp 12-20°C with RH > 90% and overcast cloudy sky for 48 hrs',
        symptoms: 'Water-soaked irregular black patches on leaves with white cottony mildew underleaf',
        preventiveActionEn: 'Prophylactic spray of Mancozeb (2.5g/L); curative spray of Cymoxanil + Mancozeb (3g/L) immediately.',
        preventiveActionHi: 'मौसम अनुकूल होते ही मैंकोज़ेब का अग्रिम छिड़काव करें; लक्षण दिखते ही साइमोक्सानिल + मैंकोज़ेब डालें।',
      },
    ],
    rotationBenefits: ['Provides high returns; leaves fine loose seedbed for succeeding maize or summer moong'],
    rotationRestrictions: ['Requires acidic-to-neutral pH; avoid soils with recent lime application (promotes scab)'],
    icardatasetCitation: 'ICAR-CPRI (Central Potato Research Institute, Shimla)',
  },
  {
    id: 'soybean',
    nameEn: 'Soybean',
    nameHi: 'सोयाबीन',
    category: 'Oilseed',
    season: 'Kharif',
    suitableSoils: ['Black Soil', 'Clay Loam', 'Loam'],
    optimalPh: { min: 6.0, max: 7.5 },
    optimalTemp: { min: 20, max: 32 },
    optimalHumidity: { min: 60, max: 80 },
    waterNeedCategory: 'Moderate',
    waterNeedMm: { min: 500, max: 700 },
    durationDays: { min: 90, max: 110 },
    stageThresholds: {
      'Vegetative': { minMoisture: 40, maxMoisture: 70, waterStressAlert: 28, waterExcessAlert: 80 },
      'Flowering': { minMoisture: 50, maxMoisture: 75, waterStressAlert: 38, waterExcessAlert: 82 },
      'Pod Development': { minMoisture: 45, maxMoisture: 72, waterStressAlert: 35, waterExcessAlert: 80 },
      'Maturity': { minMoisture: 25, maxMoisture: 50, waterStressAlert: 16, waterExcessAlert: 70 },
    },
    economics: {
      avgCostPerAcre: 13200,
      breakdownCostPerAcre: {
        seed: 2800,
        fertilizer: 2900,
        irrigation: 1500,
        labor: 3400,
        machinery: 1600,
        cropProtection: 1000,
        other: 0,
      },
      yieldPerAcreQuintal: { min: 8, max: 13, avg: 10 },
      typicalPricePerQuintal: 4892, // Govt MSP
    },
    diseaseTriggers: [
      {
        diseaseNameEn: 'Yellow Mosaic Virus (transmitted by Whitefly)',
        diseaseNameHi: 'पीला मोज़ेक वायरस (सफेद मक्खी द्वारा)',
        condition: 'Hot dry spell with RH 60-70% favoring whitefly vector multiplication',
        symptoms: 'Alternate yellow and green patches on trifoliate leaves',
        preventiveActionEn: 'Foliar spray of Thiamethoxam 25% WG (0.3g/L) to control whitefly vector population.',
        preventiveActionHi: 'सफेद मक्खी की रोकथाम हेतु थायामेथोक्सम 25% WG (0.3 ग्राम/लीटर) का छिड़काव करें।',
      },
    ],
    rotationBenefits: ['Fixes atmospheric nitrogen; ideal predecessor for Rabi wheat in central India'],
    rotationRestrictions: ['Sensitive to early seedling water stagnation during monsoon downpours'],
    icardatasetCitation: 'ICAR-IISR (Indian Institute of Soybean Research, Indore)',
  },
];

