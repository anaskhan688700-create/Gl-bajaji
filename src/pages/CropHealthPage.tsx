import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useSensors } from '../context/SensorContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertBanner } from '../components/common/AlertBanner';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const CropHealthPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const { activeAlerts, latestTelemetry, dismissAlert, markAlertAsRead } = useSensors();
  const { language, t } = useLanguage();

  const [healthData, setHealthData] = useState<any>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const farmId = selectedFarm?.id || 'farm-01';
  const crop = CROPS_DATABASE.find(c => c.id === selectedFarm?.currentCropId) || CROPS_DATABASE[0];

  useEffect(() => {
    fetch(`/api/v1/crop-health/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHealthData(data.evaluation);
        }
      })
      .catch(() => {});
  }, [farmId, latestTelemetry]);

  const filteredAlerts = activeAlerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest dark:text-darkTextPrimary flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-agri" />
            <span>{t.navCropHealth}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText dark:text-darkTextSecondary">
            Explainable agronomic rule engine detecting moisture deficit, thermal heat stress, and fungal disease risks
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-darkCard p-1 rounded-2xl border border-gray-200 dark:border-darkBorder text-xs font-semibold self-start sm:self-auto shadow-soft">
          {['ALL', 'High risk', 'Watch', 'Normal'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filterSeverity === sev
                  ? 'bg-forest dark:bg-forest-light text-limeAccent font-bold'
                  : 'text-gray-600 dark:text-darkTextSecondary hover:text-darkText dark:hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Agronomic Safety Disclosure Alert */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 shadow-soft flex items-start gap-3">
        <Info className="w-5 h-5 text-agri dark:text-limeAccent flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
          <strong className="text-forest dark:text-limeAccent block mb-1">
            {language === 'hi'
              ? 'वैज्ञानिक पारदर्शिता एवं कृषि सुरक्षा नीति'
              : 'Agronomic Safety & Diagnostic Boundary Policy'}
          </strong>
          {language === 'hi'
            ? 'KisanRakshak AI कभी भी केवल मिट्टी की नमी या तापमान से किसी पौधे की बीमारी का अंतिम दावा नहीं करता। वातावरणीय परिस्थितियों का विश्लेषण जोखिम का संकेत देता है, जिसकी पुष्टि हेतु खेत में प्रत्यक्ष मुआयना (Field Scouting) आवश्यक है।'
            : 'KisanRakshak AI explicitly differentiates between observed soil readings, rule-based environmental risk flags, and confirmed plant diagnoses. Chemical applications should only follow physical field verification.'}
        </div>
      </div>

      {/* Crop Health Evaluation Card */}
      {healthData && (
        <div className="bg-white dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-darkBorder shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-darkBorder">
            <div>
              <span className="text-xs font-bold text-secondaryText dark:text-darkTextSecondary uppercase tracking-wider">
                Current Crop Stage Rule Set
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-forest dark:text-darkTextPrimary mt-0.5">
                {crop.nameEn} ({crop.nameHi}) — {selectedFarm?.growthStage}
              </h2>
              <p className="text-xs text-secondaryText dark:text-darkTextSecondary mt-1">
                Benchmark source: <strong className="text-forest dark:text-limeAccent">{crop.icardatasetCitation}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-secondaryText dark:text-darkTextSecondary block font-bold uppercase">
                  Overall Health Assessment
                </span>
                <span className={`text-sm font-extrabold ${
                  healthData.overallRisk === 'High risk' ? 'text-criticalRed' : healthData.overallRisk === 'Watch' ? 'text-warningAmber' : 'text-agri'
                }`}>
                  {healthData.overallRisk}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white ${
                healthData.score >= 80 ? 'bg-agri' : healthData.score >= 60 ? 'bg-warningAmber' : 'bg-criticalRed'
              }`}>
                {healthData.score}
              </div>
            </div>
          </div>

          {/* Metric Assessment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
            {healthData.metricAssessments?.map((m: any, idx: number) => (
              <div key={idx} className="bg-warmBg dark:bg-darkSurface p-3.5 rounded-2xl border border-gray-200/70 dark:border-darkBorder text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">{m.metric}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'OPTIMAL' ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <div className="text-base font-extrabold text-forest dark:text-limeAccent mb-1">
                  {m.value} {m.unit}
                </div>
                <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary leading-tight">
                  {language === 'hi' ? m.interpretationHi : m.interpretationEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-forest dark:text-darkTextPrimary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warningAmber" />
          <span>Active Field Alerts ({filteredAlerts.length})</span>
        </h3>

        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-darkCard rounded-3xl p-8 border border-gray-100 dark:border-darkBorder text-center shadow-soft">
            <CheckCircle2 className="w-10 h-10 text-agri mx-auto mb-2" />
            <h4 className="font-bold text-forest dark:text-darkTextPrimary text-sm">No Active Risk Flags</h4>
            <p className="text-xs text-secondaryText dark:text-darkTextSecondary mt-1">
              Field observations match healthy baseline expectations for this stage.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={dismissAlert}
              onMarkRead={markAlertAsRead}
            />
          ))
        )}
      </div>

      {/* Crop Disease Vulnerability Knowledge Base */}
      <div className="bg-white dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-darkBorder shadow-soft">
        <h3 className="text-base font-bold text-forest dark:text-darkTextPrimary mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-agri" />
          <span>Key Disease Vulnerabilities for {crop.nameEn} ({crop.nameHi})</span>
        </h3>
        <p className="text-xs text-secondaryText dark:text-darkTextSecondary mb-4">
          Pre-configured environmental rules based on state agricultural university advisories:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crop.diseaseTriggers.map((dt, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-warmBg dark:bg-darkSurface border border-gray-200 dark:border-darkBorder text-xs space-y-2">
              <div className="font-bold text-forest dark:text-limeAccent text-sm">
                {dt.diseaseNameEn}
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Trigger Condition:</strong> {dt.condition}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Symptoms:</strong> {dt.symptoms}
              </p>
              <div className="bg-white dark:bg-darkCard p-2.5 rounded-xl border border-gray-200 dark:border-darkBorder text-[11px] text-agri dark:text-limeAccent font-medium">
                <strong>Recommended Preventive Action:</strong> {dt.preventiveActionEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
