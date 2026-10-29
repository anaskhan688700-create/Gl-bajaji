export type Language = 'en' | 'hi';

export const translations = {
  en: {
    appName: 'KisanRakshak AI',
    tagline: 'Intelligent Crop Protection & Planning for Indian Farmers',

    // Navigation (No IoT / Sensors / Devices)
    navOverview: 'Overview',
    navFarms: 'My Farms',
    navCropHealth: 'Crop Health & Early-Warning',
    navCropAdvisor: 'AI Crop Advisor',
    navCropComparison: 'Crop Comparison',
    navWeather: 'Weather & Alerts',
    navCalculator: 'Profit & Cost Calculator',
    navAssistant: 'AI Kisan Assistant',
    navImageAnalysis: 'Crop Image Analysis',
    navReports: 'Reports & History',
    navAdmin: 'Admin Dashboard',
    navSettings: 'Settings',

    // Theme
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    themeToggle: 'Toggle Theme',

    // Common Actions
    addFarm: 'Add New Farm',
    editFarm: 'Edit Farm',
    deleteFarm: 'Delete Farm',
    save: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    refresh: 'Refresh Data',
    exportCsv: 'Export CSV',
    printReport: 'Print Report',
    demoMode: 'Demo Mode',
    switchUser: 'Switch User',
    logout: 'Logout',
    login: 'Login',
    signup: 'Create Account',
    search: 'Search...',
    filter: 'Filter',
    viewDetails: 'View Details',
    evidence: 'Field Indicators',
    recommendedAction: 'Recommended Action',
    disclaimer: 'Advisory Disclaimer',

    // Field Metrics
    soilMoisture: 'Soil Moisture Level',
    soilTemp: 'Soil Temperature',
    ambientTemp: 'Ambient Temperature',
    humidity: 'Relative Humidity',
    soilPh: 'Soil pH',
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
    healthScore: 'Field Health Score',
    activeAlerts: 'Active Field Alerts',

    // Severities
    severityNormal: 'Normal',
    severityWatch: 'Watch',
    severityHighRisk: 'High Risk',
    severityInsufficient: 'Insufficient Data',

    // Economics
    totalCost: 'Total Production Cost',
    grossRevenue: 'Estimated Gross Revenue',
    netReturn: 'Estimated Net Return',
    breakEven: 'Break-Even Selling Price',
    costPerAcre: 'Cost per Acre',
    yieldPerAcre: 'Expected Yield / Acre',
    roi: 'Estimated ROI',

    // Language Toggle
    langEn: 'English',
    langHi: 'हिन्दी',
  },
  hi: {
    appName: 'किसानरक्षक AI',
    tagline: 'भारतीय किसानों के लिए आधुनिक फसल सुरक्षा एवं फसल नियोजन मंच',

    // Navigation (No IoT / Sensors / Devices)
    navOverview: 'मुख्य डैशबोर्ड (Overview)',
    navFarms: 'मेरे खेत (My Farms)',
    navCropHealth: 'फसल स्वास्थ्य एवं चेतावनी',
    navCropAdvisor: 'AI फसल सलाहकार (Crop Advisor)',
    navCropComparison: 'फसल तुलना (Comparison)',
    navWeather: 'मौसम एवं अलर्ट (Weather)',
    navCalculator: 'लागत एवं मुनाफा कैलकुलेटर',
    navAssistant: 'AI किसान सहायक (Assistant)',
    navImageAnalysis: 'पत्ती / फसल फोटो जांच',
    navReports: 'रिपोर्ट एवं इतिहास',
    navAdmin: 'एडमिन डैशबोर्ड',
    navSettings: 'सेटिंग्स',

    // Theme
    themeDark: 'डार्क मोड (Dark)',
    themeLight: 'लाइट मोड (Light)',
    themeToggle: 'थीम बदलें',

    // Common Actions
    addFarm: 'नया खेत जोड़ें',
    editFarm: 'खेत विवरण बदलें',
    deleteFarm: 'खेत हटाएं',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    loading: 'लोड हो रहा है...',
    refresh: 'ताज़ा करें',
    exportCsv: 'CSV डाउनलोड करें',
    printReport: 'रिपोर्ट प्रिंट करें',
    demoMode: 'डेमो मोड',
    switchUser: 'उपयोगकर्ता बदलें',
    logout: 'लॉगआउट',
    login: 'लॉग इन करें',
    signup: 'नया खाता बनाएं',
    search: 'खोजें...',
    filter: 'फ़िल्टर',
    viewDetails: 'विवरण देखें',
    evidence: 'खेत स्थिति प्रमाण',
    recommendedAction: 'सुझाया गया अगला कदम',
    disclaimer: 'परामर्श अस्वीकरण',

    // Field Metrics
    soilMoisture: 'मिट्टी की नमी स्तर',
    soilTemp: 'मिट्टी का तापमान',
    ambientTemp: 'हवा का तापमान',
    humidity: 'हवा में नमी (आर्द्रता)',
    soilPh: 'मिट्टी का पीएच मान',
    nitrogen: 'नाइट्रोजन (N)',
    phosphorus: 'फास्फोरस (P)',
    potassium: 'पोटाश (K)',
    healthScore: 'खेत स्वास्थ्य स्कोर',
    activeAlerts: 'सक्रिय चेतावनियां',

    // Severities
    severityNormal: 'सामान्य (Normal)',
    severityWatch: 'निगरानी रखें (Watch)',
    severityHighRisk: 'गंभीर जोखिम (High Risk)',
    severityInsufficient: 'डेटा अपर्याप्त',

    // Economics
    totalCost: 'कुल उत्पादन लागत',
    grossRevenue: 'कुल संभावित आय',
    netReturn: 'अनुमानित शुद्ध बचत (मुनाफा)',
    breakEven: 'लागत निकालने हेतु न्यूनतम भाव',
    costPerAcre: 'लागत प्रति एकड़',
    yieldPerAcre: 'अनुमानित उपज प्रति एकड़',
    roi: 'अनुमानित लाभ प्रतिशत',

    // Language Toggle
    langEn: 'English',
    langHi: 'हिन्दी',
  },
};
