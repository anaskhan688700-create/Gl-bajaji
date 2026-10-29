import { CROPS_DATABASE, CropData } from '../data/cropsData';
import { SensorTelemetry, RiskAlertRecord } from './storage';

export interface CropEvaluationResult {
  overallRisk: 'Normal' | 'Watch' | 'High risk' | 'Insufficient data';
  score: number; // 0 - 100 health score
  alerts: RiskAlertRecord[];
  metricAssessments: {
    metric: string;
    value: number | string;
    unit: string;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
    benchmark: string;
    interpretationEn: string;
    interpretationHi: string;
  }[];
  summaryEn: string;
  summaryHi: string;
  recommendationEn: string;
  recommendationHi: string;
  cropNameEn: string;
  cropNameHi: string;
  growthStage: string;
}

export class CropRulesEngine {
  public static evaluate(
    cropId: string,
    growthStage: string,
    telemetry: SensorTelemetry | undefined,
    farmId: string
  ): CropEvaluationResult {
    const crop = CROPS_DATABASE.find(c => c.id === cropId) || CROPS_DATABASE[0];
    const alerts: RiskAlertRecord[] = [];
    const metricAssessments: CropEvaluationResult['metricAssessments'] = [];

    // Check for Insufficient / Stale data
    if (!telemetry) {
      return {
        overallRisk: 'Insufficient data',
        score: 0,
        alerts: [
          {
            id: `alert-no-data-${farmId}`,
            farmId,
            cropId: crop.id,
            growthStage,
            severity: 'Insufficient data',
            titleEn: 'No Sensor Telemetry Available',
            titleHi: 'कोई सेंसर डेटा उपलब्ध नहीं है',
            explanationEn: 'The system has not received recent sensor readings for this field. Condition assessment cannot be computed.',
            explanationHi: 'इस खेत के लिए हाल ही में कोई सेंसर डेटा प्राप्त नहीं हुआ है। वास्तविक स्थिति का आकलन संभव नहीं है।',
            evidence: [{ parameter: 'Telemetry Status', observedValue: 'No Packets', thresholdExpected: 'Periodic packets every 10-60 min', sensorSource: 'IoT Ingestion Gateway' }],
            recommendedActionEn: 'Check device power, solar panel charge, and SIM/WiFi network signal.',
            recommendedActionHi: 'डिवाइस की बैटरी, सोलर पैनल चार्जिंग और सिम/वाई-फाई सिग्नल की जांच करें।',
            dataQuality: 'Degraded',
            confidenceLevel: 'Provisional',
            timestamp: new Date().toISOString(),
            isRead: false,
            active: true,
          },
        ],
        metricAssessments: [],
        summaryEn: 'No active telemetry found for this plot. Field status cannot be confirmed.',
        summaryHi: 'इस भूखंड के लिए कोई सक्रिय टेलीमेट्री नहीं मिली। स्थिति की पुष्टि नहीं की जा सकती।',
        recommendationEn: 'Verify device power and connectivity before making irrigation decisions.',
        recommendationHi: 'सिंचाई का निर्णय लेने से पहले उपकरण के कनेक्शन की जांच करें।',
        cropNameEn: crop.nameEn,
        cropNameHi: crop.nameHi,
        growthStage,
      };
    }

    const readingAgeHours = (Date.now() - new Date(telemetry.timestamp).getTime()) / (1000 * 60 * 60);
    const isStale = readingAgeHours > 3.0;

    if (isStale) {
      alerts.push({
        id: `alert-stale-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Stale Sensor Data (${Math.round(readingAgeHours)}h Old)`,
        titleHi: `सेंसर डेटा पुराना है (${Math.round(readingAgeHours)} घंटे पुराना)`,
        explanationEn: `Last verified transmission was received ${Math.round(readingAgeHours)} hours ago. Field conditions may have changed since the last update.`,
        explanationHi: `पिछला सत्यापन योग्य डेटा ${Math.round(readingAgeHours)} घंटे पहले आया था। तब से खेत की स्थिति बदल सकती है।`,
        evidence: [
          {
            parameter: 'Last Seen Age',
            observedValue: `${readingAgeHours.toFixed(1)} hours`,
            thresholdExpected: '< 1.0 hour',
            sensorSource: 'Heartbeat Monitor',
          },
        ],
        recommendedActionEn: 'Check physical sensor node and ensure solar charging is functioning before making major inputs.',
        recommendedActionHi: 'खेत में लगे सेंसर नोड की जांच करें और सुनिश्चित करें कि सौर चार्जिंग ठीक काम कर रही है।',
        dataQuality: 'Degraded',
        confidenceLevel: 'Provisional',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });
    }

    // Identify stage thresholds
    let stageConfig = crop.stageThresholds[growthStage];
    if (!stageConfig) {
      // Pick first or default
      const stages = Object.keys(crop.stageThresholds);
      stageConfig = stages.length > 0 ? crop.stageThresholds[stages[0]] : {
        minMoisture: 40,
        maxMoisture: 70,
        waterStressAlert: 28,
        waterExcessAlert: 85,
      };
    }

    let overallSeverity: 'Normal' | 'Watch' | 'High risk' | 'Insufficient data' = 'Normal';
    let riskDeduction = 0;

    // 1. Soil Moisture Assessment
    const moisture = telemetry.soilMoisture;
    if (moisture < stageConfig.waterStressAlert) {
      overallSeverity = 'High risk';
      riskDeduction += 35;
      alerts.push({
        id: `alert-moisture-crit-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'High risk',
        titleEn: `Severe Soil Moisture Deficit for ${crop.nameEn}`,
        titleHi: `${crop.nameHi} के लिए मिट्टी में नमी की गंभीर कमी`,
        explanationEn: `Soil moisture at root depth is ${moisture}%, critically below the safe threshold of ${stageConfig.minMoisture}% for the "${growthStage}" stage. Severe drought stress at this stage will impair yield potential.`,
        explanationHi: `जड़ क्षेत्र में मिट्टी की नमी ${moisture}% है, जो "${growthStage}" अवस्था के लिए सुरक्षित सीमा ${stageConfig.minMoisture}% से काफी कम है। इस अवस्था में पानी की कमी से उत्पादन पर भारी असर पड़ सकता है।`,
        evidence: [
          {
            parameter: 'Root-zone Moisture',
            observedValue: `${moisture}%`,
            thresholdExpected: `${stageConfig.minMoisture}% - ${stageConfig.maxMoisture}%`,
            sensorSource: 'Capacitive Soil Moisture Probe',
          },
        ],
        recommendedActionEn: 'Initiate targeted irrigation within 24 hours. Verify physical soil texture at 15cm and 30cm depth.',
        recommendedActionHi: '24 घंटे के भीतर खेत में पानी दें। 15 और 30 सेमी गहराई पर मिट्टी की नमी स्वयं परखें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Soil Moisture',
        value: moisture,
        unit: '%',
        status: 'CRITICAL',
        benchmark: `${stageConfig.minMoisture}-${stageConfig.maxMoisture}%`,
        interpretationEn: 'Critically dry. Immediate irrigation required.',
        interpretationHi: 'अत्यधिक सूखी। तुरंत सिंचाई की आवश्यकता है।',
      });
    } else if (moisture < stageConfig.minMoisture) {
      overallSeverity = 'Watch';
      riskDeduction += 15;
      alerts.push({
        id: `alert-moisture-watch-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Mild Moisture Stress Approaching in ${crop.nameEn}`,
        titleHi: `${crop.nameHi} में हल्की नमी की कमी की चेतावनी`,
        explanationEn: `Soil moisture (${moisture}%) is marginally below optimal minimum (${stageConfig.minMoisture}%). Transpiration demand will exhaust moisture reserves within 48-72 hours.`,
        explanationHi: `मिट्टी की नमी (${moisture}%) सामान्य न्यूनतम (${stageConfig.minMoisture}%) से नीचे है। अगले 48-72 घंटों में सिंचाई की आवश्यकता होगी।`,
        evidence: [
          {
            parameter: 'Root-zone Moisture',
            observedValue: `${moisture}%`,
            thresholdExpected: `${stageConfig.minMoisture}% - ${stageConfig.maxMoisture}%`,
            sensorSource: 'Capacitive Soil Moisture Probe',
          },
        ],
        recommendedActionEn: 'Schedule upcoming irrigation cycle. Monitor weather forecast for expected showers.',
        recommendedActionHi: 'अगले सिंचाई चक्र की योजना बनाएं। बारिश के पूर्वानुमान पर नज़र रखें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Soil Moisture',
        value: moisture,
        unit: '%',
        status: 'WARNING',
        benchmark: `${stageConfig.minMoisture}-${stageConfig.maxMoisture}%`,
        interpretationEn: 'Below target. Plan irrigation soon.',
        interpretationHi: 'लक्ष्य से कम। जल्द सिंचाई की तैयारी करें।',
      });
    } else if (moisture > stageConfig.waterExcessAlert) {
      overallSeverity = 'Watch';
      riskDeduction += 20;
      alerts.push({
        id: `alert-moisture-excess-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Excess Soil Water Saturation Risk`,
        titleHi: `खेत में अधिक पानी भराव का जोखिम`,
        explanationEn: `Soil moisture is at ${moisture}%, nearing full saturation. Extended saturation deprives root hair of oxygen and elevates susceptibility to Pythium and Rhizoctonia root rot.`,
        explanationHi: `मिट्टी में नमी ${moisture}% है। लगातार जलभराव से जड़ों को ऑक्सीजन नहीं मिलती और जड़ गलन रोग का खतरा बढ़ता है।`,
        evidence: [
          {
            parameter: 'Soil Moisture',
            observedValue: `${moisture}%`,
            thresholdExpected: `< ${stageConfig.waterExcessAlert}%`,
            sensorSource: 'Capacitive Soil Moisture Probe',
          },
        ],
        recommendedActionEn: 'Halt irrigation valves; clear drainage ditches if heavy rain occurs.',
        recommendedActionHi: 'सिंचाई तुरंत बंद करें; जल निकासी नालियों को साफ रखें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Soil Moisture',
        value: moisture,
        unit: '%',
        status: 'WARNING',
        benchmark: `${stageConfig.minMoisture}-${stageConfig.maxMoisture}%`,
        interpretationEn: 'Saturated. Risk of anaerobic root stress.',
        interpretationHi: 'अत्यधिक नमी। जड़ सड़न का खतरा।',
      });
    } else {
      metricAssessments.push({
        metric: 'Soil Moisture',
        value: moisture,
        unit: '%',
        status: 'OPTIMAL',
        benchmark: `${stageConfig.minMoisture}-${stageConfig.maxMoisture}%`,
        interpretationEn: 'Optimal root hydration for current stage.',
        interpretationHi: 'वर्तमान अवस्था के लिए नमी एकदम सही है।',
      });
    }

    // 2. Ambient & Soil Temperature Stress
    const ambTemp = telemetry.ambientTemperature;
    if (ambTemp > crop.optimalTemp.max + 4) {
      overallSeverity = 'High risk';
      riskDeduction += 25;
      alerts.push({
        id: `alert-heat-stress-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'High risk',
        titleEn: `Thermal Heat Stress (${ambTemp}°C) Alert`,
        titleHi: `अत्यधिक तापमान (${ambTemp}°C) का खतरा`,
        explanationEn: `Ambient temperature (${ambTemp}°C) exceeds the optimal threshold (${crop.optimalTemp.max}°C). High temperatures accelerate pollen sterility and premature maturity.`,
        explanationHi: `हवा का तापमान (${ambTemp}°C) अधिकतम सुरक्षित सीमा (${crop.optimalTemp.max}°C) से अधिक है। इससे परागकण सूखने और फसल समय से पहले पकने का खतरा है।`,
        evidence: [
          {
            parameter: 'Ambient Temp',
            observedValue: `${ambTemp}°C`,
            thresholdExpected: `${crop.optimalTemp.min}°C - ${crop.optimalTemp.max}°C`,
            sensorSource: 'SHT31 Ambient Sensor',
          },
        ],
        recommendedActionEn: 'Provide light micro-irrigation or sprinkler misting during noon hours to cool the microclimate.',
        recommendedActionHi: 'दोपहर के समय फव्वारा विधि से हल्की नमी बनाकर तापमान कम करें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Ambient Temp',
        value: ambTemp,
        unit: '°C',
        status: 'CRITICAL',
        benchmark: `${crop.optimalTemp.min}-${crop.optimalTemp.max}°C`,
        interpretationEn: 'High heat stress. Threatens grain setting.',
        interpretationHi: 'अत्यधिक गर्मी। दाना बनने में बाधा।',
      });
    } else if (ambTemp < crop.optimalTemp.min - 3) {
      if (overallSeverity !== 'High risk') overallSeverity = 'Watch';
      riskDeduction += 15;
      alerts.push({
        id: `alert-cold-stress-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Low Temperature Cold Spell Warning`,
        titleHi: `शीतलहर / पाला पड़ने की चेतावनी`,
        explanationEn: `Ambient temperature has fallen to ${ambTemp}°C, below the physiological baseline for ${crop.nameEn}.`,
        explanationHi: `तापमान गिरकर ${ambTemp}°C हो गया है, जो ${crop.nameHi} के लिए सामान्य से कम है।`,
        evidence: [
          {
            parameter: 'Ambient Temp',
            observedValue: `${ambTemp}°C`,
            thresholdExpected: `> ${crop.optimalTemp.min}°C`,
            sensorSource: 'SHT31 Ambient Sensor',
          },
        ],
        recommendedActionEn: 'Provide light evening irrigation to maintain soil temperature; create smoke barriers along northern borders if frost is expected.',
        recommendedActionHi: 'शाम के समय हल्की सिंचाई करें ताकि मिट्टी गर्म रहे; उत्तर दिशा में धुआं करके पाले से बचाव करें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Ambient Temp',
        value: ambTemp,
        unit: '°C',
        status: 'WARNING',
        benchmark: `${crop.optimalTemp.min}-${crop.optimalTemp.max}°C`,
        interpretationEn: 'Cold temperatures slowing vegetative metabolic rate.',
        interpretationHi: 'कम तापमान से फसल की वृद्धि धीमी हो रही है।',
      });
    } else {
      metricAssessments.push({
        metric: 'Ambient Temp',
        value: ambTemp,
        unit: '°C',
        status: 'OPTIMAL',
        benchmark: `${crop.optimalTemp.min}-${crop.optimalTemp.max}°C`,
        interpretationEn: 'Optimal physiological temperature range.',
        interpretationHi: 'पौधों के विकास के लिए अनुकूल तापमान।',
      });
    }

    // 3. Fungal Disease Micro-Climate Trigger Index
    const humidity = telemetry.relativeHumidity;
    const leafWetness = telemetry.leafWetness || 0;
    const isFungalFavorable = humidity > 80 && (leafWetness > 50 || ambTemp >= 16 && ambTemp <= 26);

    if (isFungalFavorable) {
      if (overallSeverity !== 'High risk') overallSeverity = 'Watch';
      riskDeduction += 15;
      const relevantDisease = crop.diseaseTriggers[0] || {
        diseaseNameEn: 'Fungal Leaf Spot / Rust',
        diseaseNameHi: 'फफूंद जनित पत्ती धब्बा / रतुआ',
        preventiveActionEn: 'Conduct visual inspection on lower leaf canopies for fungal spores.',
        preventiveActionHi: 'निचली पत्तियों पर फफूंद के लक्षणों की जांच करें।',
      };

      alerts.push({
        id: `alert-disease-env-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Environmental Conditions Favorable for ${relevantDisease.diseaseNameEn}`,
        titleHi: `${relevantDisease.diseaseNameHi} के अनुकूल वातावरणीय परिस्थितियां`,
        explanationEn: `Sustained high humidity (${humidity}%) and temperature (${ambTemp}°C) create micro-climate conditions favorable for fungal spore germination. This is an environmental risk indicator, NOT a confirmed diagnosis.`,
        explanationHi: `लगातार उच्च आर्द्रता (${humidity}%) और तापमान (${ambTemp}°C) फफूंद के बीजाणुओं के अंकुरण के अनुकूल हैं। यह वातावरणीय जोखिम है, रोग की अंतिम पुष्टि नहीं।`,
        evidence: [
          { parameter: 'Relative Humidity', observedValue: `${humidity}%`, thresholdExpected: '< 75%', sensorSource: 'SHT31 Sensor' },
          { parameter: 'Leaf Wetness Index', observedValue: `${leafWetness}%`, thresholdExpected: '< 40%', sensorSource: 'Leaf Wetness Grid' },
        ],
        recommendedActionEn: `Scout field corners. ${relevantDisease.preventiveActionEn}`,
        recommendedActionHi: `खेत के कोनों का मुआयना करें। ${relevantDisease.preventiveActionHi}`,
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'Moderate',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Relative Humidity',
        value: humidity,
        unit: '%',
        status: 'WARNING',
        benchmark: `${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%`,
        interpretationEn: 'High humidity increases fungal spore germination probability.',
        interpretationHi: 'अधिक नमी से फफूंद रोगों का खतरा बढ़ जाता है।',
      });
    } else {
      metricAssessments.push({
        metric: 'Relative Humidity',
        value: humidity,
        unit: '%',
        status: 'OPTIMAL',
        benchmark: `${crop.optimalHumidity.min}-${crop.optimalHumidity.max}%`,
        interpretationEn: 'Well balanced canopy transpiration zone.',
        interpretationHi: 'पौधों के लिए हवा में नमी का स्तर सही है।',
      });
    }

    // 4. Soil pH Assessment
    const ph = telemetry.soilPh;
    if (ph < crop.optimalPh.min - 0.5 || ph > crop.optimalPh.max + 0.5) {
      riskDeduction += 10;
      if (overallSeverity === 'Normal') overallSeverity = 'Watch';
      alerts.push({
        id: `alert-ph-imbalance-${farmId}-${Date.now()}`,
        farmId,
        cropId: crop.id,
        growthStage,
        severity: 'Watch',
        titleEn: `Soil pH Deviation (pH ${ph})`,
        titleHi: `मिट्टी के पीएच मान (pH ${ph}) में विचलन`,
        explanationEn: `Current soil pH (${ph}) deviates from the optimal range of ${crop.optimalPh.min} to ${crop.optimalPh.max} for ${crop.nameEn}. This may lock micronutrient uptake like Zinc, Iron, and Phosphorus.`,
        explanationHi: `मिट्टी का पीएच मान (${ph}) इस फसल की अनुकूल सीमा (${crop.optimalPh.min} - ${crop.optimalPh.max}) से बाहर है। इससे पोटाश, जिंक और फास्फोरस का अवशोषण घट सकता है।`,
        evidence: [
          { parameter: 'Soil pH', observedValue: ph, thresholdExpected: `${crop.optimalPh.min} - ${crop.optimalPh.max}`, sensorSource: 'Soil pH Electrode' },
        ],
        recommendedActionEn: ph < 6.0 ? 'Consider agricultural lime application post-harvest.' : 'Apply Gypsum or organic compost to buffer alkalinity.',
        recommendedActionHi: ph < 6.0 ? 'फसल कटाई के बाद कृषि चूने का प्रयोग करें।' : 'जिप्सम या अच्छी गोबर की खाद डालकर क्षारीयता को संतुलित करें।',
        dataQuality: telemetry.dataQuality,
        confidenceLevel: 'High',
        timestamp: new Date().toISOString(),
        isRead: false,
        active: true,
      });

      metricAssessments.push({
        metric: 'Soil pH',
        value: ph,
        unit: 'pH',
        status: 'WARNING',
        benchmark: `${crop.optimalPh.min}-${crop.optimalPh.max}`,
        interpretationEn: 'Suboptimal nutrient availability buffer.',
        interpretationHi: 'पोषक तत्वों के अवशोषण के लिए पीएच आदर्श नहीं है।',
      });
    } else {
      metricAssessments.push({
        metric: 'Soil pH',
        value: ph,
        unit: 'pH',
        status: 'OPTIMAL',
        benchmark: `${crop.optimalPh.min}-${crop.optimalPh.max}`,
        interpretationEn: 'Ideal nutrient bioavailability window.',
        interpretationHi: 'पोषक तत्वों के अवशोषण हेतु सर्वोत्तम पीएच।',
      });
    }

    // Compute final health score
    const finalScore = Math.max(15, Math.min(100, 100 - riskDeduction));

    // Summary & Recommendations
    let summaryEn = `Plot is operating within healthy parameters for ${crop.nameEn} during the ${growthStage} stage.`;
    let summaryHi = `वर्तमान में ${crop.nameHi} की "${growthStage}" अवस्था के लिए खेत की सभी मुख्य स्थितियां सामान्य हैं।`;
    let recommendationEn = 'Maintain regular monitoring intervals and keep weeding channels clean.';
    let recommendationHi = 'नियमित अंतराल पर निगरानी जारी रखें और खरपतवार नियंत्रण पर ध्यान दें।';

    if (overallSeverity === 'High risk') {
      summaryEn = `Critical intervention required for ${crop.nameEn}. Stress factors are significantly impeding crop health.`;
      summaryHi = `${crop.nameHi} में तत्काल ध्यान देने की आवश्यकता है। कुछ मुख्य कारक फसल पर गंभीर दबाव डाल रहे हैं।`;
      recommendationEn = alerts[0]?.recommendedActionEn || 'Review priority alerts and take immediate corrective measures.';
      recommendationHi = alerts[0]?.recommendedActionHi || 'प्राथमिकता वाली चेतावनियों को देखें और तुरंत सुधारात्मक कदम उठाएं।';
    } else if (overallSeverity === 'Watch') {
      summaryEn = `Field conditions are stable but require watchful observation over the next 24-48 hours.`;
      summaryHi = `खेत की स्थिति स्थिर है लेकिन अगले 24-48 घंटों तक विशेष निगरानी की जरूरत है।`;
      recommendationEn = alerts[0]?.recommendedActionEn || 'Review suggested actions and inspect target field zones.';
      recommendationHi = alerts[0]?.recommendedActionHi || 'सुझाई गई सावधानियों को देखें और खेत का मुआयना करें।';
    }

    return {
      overallRisk: overallSeverity,
      score: finalScore,
      alerts,
      metricAssessments,
      summaryEn,
      summaryHi,
      recommendationEn,
      recommendationHi,
      cropNameEn: crop.nameEn,
      cropNameHi: crop.nameHi,
      growthStage,
    };
  }
}
