import React, { useState } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const ImageAnalysisPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [growthStage, setGrowthStage] = useState('Flowering');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-configured test sample buttons for quick hackathon evaluation
  const demoSamples = [
    {
      title: 'Wheat Yellow Rust Sample',
      crop: 'wheat',
      stage: 'Flowering / Boot Stage',
      symptoms: 'Yellow stripe powder on leaves',
      url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=60',
    },
    {
      title: 'Tomato Early Blight Sample',
      crop: 'tomato',
      stage: 'Flowering & Fruit Set',
      symptoms: 'Brown concentric spots on lower leaves',
      url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=60',
    },
    {
      title: 'Mustard White Rust Sample',
      crop: 'mustard',
      stage: 'Pod Formation',
      symptoms: 'White pustules on underleaf',
      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=60',
    },
  ];

  const handleSelectSample = (sample: typeof demoSamples[0]) => {
    setSelectedCrop(sample.crop);
    setGrowthStage(sample.stage);
    setSymptomsInput(sample.symptoms);
    setPreviewUrl(sample.url);
    setFileObject(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObject(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (fileObject) {
        formData.append('image', fileObject);
      }
      formData.append('cropType', selectedCrop);
      formData.append('growthStage', growthStage);
      formData.append('userSymptoms', symptomsInput);

      const res = await fetch('/api/v1/image-analysis/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.diagnosis) {
        setAnalysisResult(data.diagnosis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <Camera className="w-7 h-7 text-agri" />
            <span>{t.navImageAnalysis}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Leaf photograph diagnostic analysis with transparent uncertainty disclosure
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-warmBg border border-gray-200 text-xs font-bold text-forest self-start sm:self-auto">
          Diagnostic Assistant Mode
        </span>
      </div>

      {/* Safety & Diagnostic Policy Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 shadow-soft flex items-start gap-3">
        <Info className="w-5 h-5 text-warningAmber flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <strong className="block mb-0.5 font-bold">
            {language === 'hi'
              ? 'कृषि सुरक्षा एवं अनिश्चितता प्रकटीकरण (Uncertainty Disclosure)'
              : 'Agronomic Diagnostic Uncertainty Protocol'}
          </strong>
          {language === 'hi'
            ? 'फोटो विश्लेषण केवल एक दृश्य संकेत (Visual Pattern Clue) देता है। जब तक किसी कृषि वैज्ञानिक या प्रयोगशाला द्वारा पुष्टि न हो, इसे निश्चित बीमारी न मानें। रासायनिक दवाओं का छिड़काव करने से पहले खेत में व्यक्तिगत जांच अवश्य करें।'
            : 'Image-based symptom analysis provides preliminary pattern matching. The platform explicitly labels results as "Possible issue" or "Needs verification". Never apply chemical sprays without conducting on-site field verification.'}
        </div>
      </div>

      {/* Hackathon Quick Test Samples */}
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-forest" />
          <span className="text-xs font-bold text-forest uppercase tracking-wider">
            Quick Test Leaf Samples (हैकथॉन तुरंत जांच)
          </span>
        </div>
        <p className="text-xs text-secondaryText mb-3">
          Click any preset sample to load verified reference leaf imagery:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {demoSamples.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="p-3 text-left rounded-2xl bg-warmBg hover:bg-green-50 border border-gray-200 text-xs transition-colors"
            >
              <span className="font-bold text-darkText block">{s.title}</span>
              <span className="text-[11px] text-secondaryText">{s.symptoms}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload and Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload and Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-forest uppercase tracking-wider pb-2 border-b border-gray-100">
            Upload Leaf / Plant Photograph
          </h3>

          <form onSubmit={handleSubmitAnalysis} className="space-y-4 text-xs">
            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center hover:border-agri transition-colors">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Leaf preview"
                    className="max-h-56 mx-auto rounded-2xl object-cover shadow-soft"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFileObject(null);
                    }}
                    className="text-xs font-bold text-criticalRed hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="font-bold text-forest block mb-1">
                    Click to select crop photo or drag & drop
                  </span>
                  <span className="text-[11px] text-secondaryText block">
                    Supports PNG, JPG, or WebP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-darkText mb-1">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                >
                  {CROPS_DATABASE.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameHi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkText mb-1">Growth Stage</label>
                <input
                  type="text"
                  value={growthStage}
                  onChange={e => setGrowthStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-agri focus:outline-none"
                  placeholder="e.g. Flowering"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-darkText mb-1">
                Visual Symptoms (Optional)
              </label>
              <input
                type="text"
                value={symptomsInput}
                onChange={e => setSymptomsInput(e.target.value)}
                placeholder="e.g. Yellow linear stripe powder, brown concentric rings..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-agri focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !previewUrl}
              className="w-full py-3 rounded-2xl bg-forest text-limeAccent font-bold text-sm hover:bg-forest-light transition-colors disabled:opacity-50 shadow-soft flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Image Patterns...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Visual Diagnostic Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Diagnostic Results */}
        <div className="space-y-4">
          {analysisResult ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-secondaryText uppercase tracking-wider">
                    Visual Pattern Matching Result
                  </span>
                  <h3 className="text-xl font-extrabold text-forest mt-0.5">
                    {language === 'hi' ? analysisResult.possibleIssueHi : analysisResult.possibleIssueEn}
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-warningAmber border border-amber-200">
                  {analysisResult.confidenceClassification} ({analysisResult.confidencePercentage}%)
                </span>
              </div>

              {/* Observed Features */}
              <div className="bg-warmBg p-4 rounded-2xl border border-gray-100 text-xs">
                <span className="font-bold text-forest block mb-1">Visual Observation:</span>
                <p className="text-gray-700 leading-relaxed">
                  {language === 'hi' ? analysisResult.visualObservationHi : analysisResult.visualObservationEn}
                </p>
              </div>

              {/* Next Steps Verification */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-forest block">
                  Mandatory Field Verification Protocol:
                </span>
                <ul className="space-y-2">
                  {(language === 'hi'
                    ? analysisResult.recommendedVerificationStepsHi
                    : analysisResult.recommendedVerificationStepsEn
                  ).map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-xl text-emerald-950 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-agri flex-shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Citation & Disclaimer */}
              <div className="pt-3 border-t border-gray-100 text-[11px] text-secondaryText space-y-1">
                <p>Citation: <strong className="text-forest">{analysisResult.citation}</strong></p>
                <p className="italic text-gray-500">
                  {language === 'hi' ? analysisResult.disclaimerHi : analysisResult.disclaimerEn}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-soft text-center h-full flex flex-col items-center justify-center">
              <Camera className="w-12 h-12 text-gray-300 mb-3" />
              <h4 className="font-bold text-forest text-sm">No Photo Analyzed Yet</h4>
              <p className="text-xs text-secondaryText max-w-xs mt-1">
                Upload a plant photo or select one of the test samples above to review visual symptom matching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

