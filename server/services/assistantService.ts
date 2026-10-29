import { storage, FarmRecord, SensorTelemetry } from './storage';
import { CROPS_DATABASE } from '../data/cropsData';
import { CropRulesEngine } from './rulesEngine';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export class AssistantService {
  public static async answerFarmerQuestion(
    question: string,
    farmId: string,
    language: 'en' | 'hi' = 'hi',
    history: ChatMessage[] = []
  ): Promise<{ reply: string; sourceCitations: string[]; relatedPage?: string }> {
    const farm = storage.getFarmById(farmId) || storage.getFarms()[0];
    const telemetry = storage.getLatestTelemetry(farm ? farm.id : 'farm-01');
    const crop = CROPS_DATABASE.find(c => c.id === farm?.currentCropId) || CROPS_DATABASE[0];
    const evalResult = farm && telemetry ? CropRulesEngine.evaluate(crop.id, farm.growthStage, telemetry, farm.id) : null;

    // Check if Gemini API key exists
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const farmContext = `
Farmer Farm Context:
- Farm Name: ${farm?.name} (${farm?.location.district}, ${farm?.location.state})
- Area: ${farm?.area} ${farm?.areaUnit}
- Soil: ${farm?.soilType}, Irrigation: ${farm?.irrigationMethod}
- Current Crop: ${crop.nameEn} (${crop.nameHi}), Growth Stage: ${farm?.growthStage}
- Latest Sensor Telemetry: Moisture: ${telemetry?.soilMoisture}%, Ambient Temp: ${telemetry?.ambientTemperature}°C, Humidity: ${telemetry?.relativeHumidity}%, Soil pH: ${telemetry?.soilPh}
- Active Risk Assessment: ${evalResult?.overallRisk} (Health Score: ${evalResult?.score}/100)
- Recent Alerts: ${evalResult?.alerts.map(a => a.titleEn).join('; ') || 'None'}
`;

        const systemPrompt = `You are "AI Kisan Assistant" (किसान रक्षक सहायक), an expert agricultural adviser for Indian farmers.
Always respond in ${language === 'hi' ? 'simple, clear Hindi (हिन्दी)' : 'simple, polite English'}.
Keep answers practical, encouraging, and easy to understand for smallholder farmers.
Always cite ICAR guidelines or state agricultural university practices where applicable.
Important Disclaimer: Remind the farmer that automated guidance is advisory and physical field inspection is recommended for disease diagnosis.
Context:
${farmContext}`;

        // Call Gemini API using native fetch
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\nFarmer Question: ' + question }] },
            ],
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              reply: text,
              sourceCitations: ['ICAR (Indian Council of Agricultural Research)', 'Kisan Knowledge Portal'],
              relatedPage: determineRelatedPage(question),
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local agricultural inference engine:', err);
      }
    }

    // Local Bilingual Agronomic Expert Engine (Deterministic & Farmer-Friendly)
    const qLower = question.toLowerCase();

    // 1. Water & Moisture Questions
    if (qLower.includes('paani') || qLower.includes('water') || qLower.includes('moisture') || qLower.includes('nami') || qLower.includes('irrigation') || qLower.includes('sinchai')) {
      if (language === 'hi') {
        const moisture = telemetry?.soilMoisture ?? 40;
        let advice = `नमस्ते! आपके खेत **"${farm.name}"** में लगे सेंसर के अनुसार वर्तमान में मिट्टी की नमी **${moisture}%** है।\n\n`;
        if (moisture < 35) {
          advice += `⚠️ **महत्वपूर्ण चेतावनी:** वर्तमान में आपकी ${crop.nameHi} की फसल "${farm.growthStage}" अवस्था में है, जहाँ न्यूनतम 40-50% नमी अनिवार्य है।\n\n**सुझाव:**\n1. अगले 24 घंटों में हल्की सिंचाई करें।\n2. खेत में 15 सेमी गहराई पर मिट्टी का लड्डू बनाकर नमी स्वयं जांचें।\n3. तेज धूप में दोपहर के समय सिंचाई से बचें, सुबह या शाम को पानी दें।`;
        } else if (moisture > 75) {
          advice += `💧 खेत में नमी अधिक (${moisture}%) है। जब तक ऊपरी मिट्टी सूख न जाए, सिंचाई तुरंत रोक दें ताकि जड़ गलन रोग न पनपे।`;
        } else {
          advice += `✅ वर्तमान नमी (${moisture}%) आपकी ${crop.nameHi} की फसल के लिए अनुकूल है। अगले 3-4 दिन अतिरिक्त पानी की आवश्यकता नहीं है।`;
        }
        return {
          reply: advice,
          sourceCitations: ['ICAR-IIWBR (गेहूँ एवं जौ अनुसंधान संस्थान, करनाल)', 'सेंसर टेलीमेट्री रिकॉर्ड'],
          relatedPage: '/sensor-monitoring',
        };
      } else {
        const moisture = telemetry?.soilMoisture ?? 40;
        let advice = `Hello! Based on the IoT sensor at **"${farm.name}"**, the current root-zone soil moisture is **${moisture}%**.\n\n`;
        if (moisture < 35) {
          advice += `⚠️ **Water Stress Warning:** Your ${crop.nameEn} is in the "${farm.growthStage}" stage, requiring a safe threshold of at least 40-50% moisture.\n\n**Recommended Action:**\n1. Schedule light irrigation within the next 24-36 hours.\n2. Manually inspect soil crumb consistency at 15cm and 30cm root depths.\n3. Avoid mid-day irrigation during high solar heat.`;
        } else if (moisture > 75) {
          advice += `💧 High soil moisture (${moisture}%) detected. Pause irrigation to prevent root hypoxia and waterlogging.`;
        } else {
          advice += `✅ Current soil moisture (${moisture}%) is well within the recommended target range for ${crop.nameEn}. No immediate irrigation needed.`;
        }
        return {
          reply: advice,
          sourceCitations: ['ICAR-IIWBR Technical Bulletins', 'Live IoT Sensor Array'],
          relatedPage: '/sensor-monitoring',
        };
      }
    }

    // 2. Sensor Readings Meaning
    if (qLower.includes('reading') || qLower.includes('sensor') || qLower.includes('matlab') || qLower.includes('meaning') || qLower.includes('status')) {
      if (language === 'hi') {
        return {
          reply: `आपके खेत **"${farm.name}"** की मुख्य सेंसर रीडिंग्स का सरल अर्थ:\n\n` +
            `• **मिट्टी की नमी (${telemetry?.soilMoisture}%):** जड़ के पास उपलब्ध पानी की मात्रा दर्शाता है। 40% से 70% सर्वोत्तम माना जाता है।\n` +
            `• **मिट्टी का तापमान (${telemetry?.soilTemperature}°C):** जड़ों के श्वसन और सूक्ष्मजीवों की सक्रियता के लिए 18-25°C अनुकूल है।\n` +
            `• **हवा का तापमान व आर्द्रता (${telemetry?.ambientTemperature}°C, ${telemetry?.relativeHumidity}%):** यदि आर्द्रता 80% से ऊपर रहे, तो फफूंद जनित रोगों (जैसे रतुआ/ब्लाइट) का खतरा बढ़ जाता है।\n` +
            `• **मिट्टी का पीएच (${telemetry?.soilPh}):** 6.5 से 7.5 का पीएच पौधों द्वारा खाद सोखने के लिए सबसे उत्तम होता है।`,
          sourceCitations: ['भारतीय कृषि अनुसंधान परिषद (ICAR) मृदा स्वास्थ्य दिशानिर्देश'],
          relatedPage: '/sensor-monitoring',
        };
      } else {
        return {
          reply: `Simple explanation of current sensor telemetry for **"${farm.name}"**:\n\n` +
            `• **Soil Moisture (${telemetry?.soilMoisture}%):** Indicates available water capacity in the root layer. 40%–70% is optimal for ${crop.nameEn}.\n` +
            `• **Soil Temperature (${telemetry?.soilTemperature}°C):** Controls nutrient uptake rate. 18–25°C is ideal.\n` +
            `• **Ambient Temp & RH (${telemetry?.ambientTemperature}°C, ${telemetry?.relativeHumidity}%):** Sustained humidity > 80% accelerates fungal pathogen risks.\n` +
            `• **Soil pH (${telemetry?.soilPh}):** Near-neutral (6.5–7.5) ensures maximum bioavailability of nitrogen, phosphorus, and zinc.`,
          sourceCitations: ['ICAR Soil Science Advisory Standards'],
          relatedPage: '/sensor-monitoring',
        };
      }
    }

    // 3. Next Season / Crop Recommendation
    if (qLower.includes('agli') || qLower.includes('next') || qLower.includes('suitable') || qLower.includes('kaunsi') || qLower.includes('fasal') || qLower.includes('recommend')) {
      if (language === 'hi') {
        return {
          reply: `आपके **${farm.location.district} (${farm.location.state})** क्षेत्र और **${farm.soilType}** मिट्टी के लिए आगामी सीजन की सर्वोत्तम फसलें:\n\n` +
            `1. **चना / दलहन (Chickpea):** कम पानी की आवश्यकता (250 मिमी), मिट्टी में नाइट्रोजन फिक्स करता है और लागत कम (₹10,800/एकड़) है।\n` +
            `2. **सरसों (Mustard):** केवल 2-3 पानी में तैयार, एमएसपी ₹5,650/क्विंटल पर अच्छा मुनाफा देती है।\n` +
            `3. **गेहूँ (Wheat - HD 3086 / DBW 187):** निश्चित उपज (20-22 क्विंटल/एकड़) और पक्की सरकारी खरीद।\n\n` +
            `👉 आप विस्तृत तुलना और लागत-मुनाफे के लिए **"AI Crop Advisor"** और **"Crop Comparison"** पेज पर जा सकते हैं।`,
          sourceCitations: ['राज्य कृषि विश्वविद्यालय फसल सिफारिशें', 'ICAR-IIPR कानपुर'],
          relatedPage: '/crop-advisor',
        };
      } else {
        return {
          reply: `For your location in **${farm.location.district}, ${farm.location.state}** with **${farm.soilType}** soil, top recommended next-season crops:\n\n` +
            `1. **Chickpea / Gram:** Low water consumption (250mm), naturally enriches soil nitrogen, low input cost (~₹10,800/acre).\n` +
            `2. **Mustard:** Requires only 2 irrigations, provides robust MSP support (₹5,650/Qtl).\n` +
            `3. **Wheat (HD-3086 / DBW-187):** Reliable high yield (20-22 Qtl/acre) with assured procurement.\n\n` +
            `👉 Explore the **"AI Crop Advisor"** and **"Crop Comparison"** tabs to simulate custom budget and water assumptions.`,
          sourceCitations: ['State Agricultural University Agronomy Guidelines', 'ICAR-IIPR'],
          relatedPage: '/crop-advisor',
        };
      }
    }

    // 4. Cost and Profit / Economics
    if (qLower.includes('profit') || qLower.includes('cost') || qLower.includes('kharch') || qLower.includes('munafa') || qLower.includes('lagat') || qLower.includes('return')) {
      if (language === 'hi') {
        const cost = crop.economics.avgCostPerAcre;
        const avgYield = crop.economics.yieldPerAcreQuintal.avg;
        const price = crop.economics.typicalPricePerQuintal;
        const revenue = avgYield * price;
        const net = revenue - cost;

        return {
          reply: `**${crop.nameHi}** की 1 एकड़ की अनुमानित लागत एवं आय गणना:\n\n` +
            `• **कुल उत्पादन लागत:** लगभग ₹${cost.toLocaleString('en-IN')}/एकड़ (बीज, खाद, सिंचाई, जुताई, मजदूरी सहित)\n` +
            `• **औसत उत्पादन:** ${avgYield} क्विंटल/एकड़\n` +
            `• **अपेक्षित भाव (MSP):** ₹${price.toLocaleString('en-IN')}/क्विंटल\n` +
            `• **कुल संभावित आय:** ₹${revenue.toLocaleString('en-IN')}/एकड़\n` +
            `• **अनुमानित शुद्ध बचत (Net Return):** ₹${net.toLocaleString('en-IN')}/एकड़\n\n` +
            `👉 अपने वास्तविक खर्च और मंडी भाव के आधार पर सटीक गणना करने के लिए **"Profit Calculator"** पेज देखें।`,
          sourceCitations: ['CACP (कृषि लागत एवं मूल्य आयोग रिपोर्ट 2024-25)'],
          relatedPage: '/profit-calculator',
        };
      } else {
        const cost = crop.economics.avgCostPerAcre;
        const avgYield = crop.economics.yieldPerAcreQuintal.avg;
        const price = crop.economics.typicalPricePerQuintal;
        const revenue = avgYield * price;
        const net = revenue - cost;

        return {
          reply: `Estimated economics for **${crop.nameEn}** per acre:\n\n` +
            `• **Total Production Cost:** ~₹${cost.toLocaleString('en-IN')}/acre (Seed, Fertilizers, Labor, Machinery)\n` +
            `• **Average Expected Yield:** ${avgYield} Quintals/acre\n` +
            `• **Target Mandi/MSP Price:** ₹${price.toLocaleString('en-IN')}/Quintal\n` +
            `• **Estimated Gross Revenue:** ₹${revenue.toLocaleString('en-IN')}/acre\n` +
            `• **Estimated Net Return:** ₹${net.toLocaleString('en-IN')}/acre\n` +
            `• **Break-even Price:** ₹${Math.round(cost / avgYield)}/Quintal\n\n` +
            `👉 Use our interactive **"Profit Calculator"** to tailor fertilizer and diesel prices to your farm.`,
          sourceCitations: ['Commission for Agricultural Costs and Prices (CACP)'],
          relatedPage: '/profit-calculator',
        };
      }
    }

    // 5. Default General Response
    if (language === 'hi') {
      return {
        reply: `किसान भाई, आपके खेत **"${farm.name}"** में ${crop.nameHi} की फसल वर्तमान में "${farm.growthStage}" अवस्था में है।\n\n` +
          `वर्तमान सेंसर स्थिति: नमी ${telemetry?.soilMoisture ?? 40}%, तापमान ${telemetry?.ambientTemperature ?? 22}°C, स्वास्थ्य स्कोर ${evalResult?.score ?? 85}/100 है।\n\n` +
          `आप मुझसे इन विषयों पर पूछ सकते हैं:\n` +
          `1. "मेरी फसल में पानी की कमी कब होगी?"\n` +
          `2. "सेंसर रीडिंग्स का क्या मतलब है?"\n` +
          `3. "अगले सीजन के लिए कौन सी फसल लाभदायक रहेगी?"\n` +
          `4. "इस फसल का खर्च और मुनाफा कितना होगा?"\n\n` +
          `*नोट: यह सलाह ICAR और कृषि वैज्ञानिक मानकों पर आधारित है। रोग की पुष्टि के लिए हमेशा खेत का व्यक्तिगत मुआयना करें।*`,
        sourceCitations: ['ICAR Kisan Portal', 'राज्य कृषि विस्तार सेवाएं'],
        relatedPage: '/overview',
      };
    } else {
      return {
        reply: `Greetings! At your farm **"${farm.name}"**, your ${crop.nameEn} crop is currently in the "${farm.growthStage}" stage.\n\n` +
          `Current live metrics: Soil Moisture: ${telemetry?.soilMoisture ?? 40}%, Temp: ${telemetry?.ambientTemperature ?? 22}°C, Overall Health Score: ${evalResult?.score ?? 85}/100.\n\n` +
          `Feel free to ask me:\n` +
          `1. "How is the soil moisture level for my crop right now?"\n` +
          `2. "Explain what my sensor readings indicate."\n` +
          `3. "Which alternative crop is best for the next season?"\n` +
          `4. "Calculate estimated cultivation cost and net profit."\n\n` +
          `*Note: Guidance is advisory and aligned with ICAR standards. Please inspect fields personally before applying crop chemicals.*`,
        sourceCitations: ['ICAR National Agricultural Advisory Grid'],
        relatedPage: '/overview',
      };
    }
  }
}

function determineRelatedPage(q: string): string {
  const l = q.toLowerCase();
  if (l.includes('sensor') || l.includes('moisture') || l.includes('nami') || l.includes('paani') || l.includes('reading')) return '/sensor-monitoring';
  if (l.includes('fasal') || l.includes('crop') || l.includes('agli') || l.includes('next') || l.includes('recommend')) return '/crop-advisor';
  if (l.includes('profit') || l.includes('cost') || l.includes('lagat') || l.includes('munafa') || l.includes('calculator')) return '/profit-calculator';
  if (l.includes('alert') || l.includes('rog') || l.includes('disease') || l.includes('health')) return '/crop-health';
  if (l.includes('photo') || l.includes('image') || l.includes('tasveer') || l.includes('leaf')) return '/image-analysis';
  return '/overview';
}

