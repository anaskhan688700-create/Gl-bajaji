import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { RiskAlert } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AlertBannerProps {
  alert: RiskAlert;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
}) => {
  const { language } = useLanguage();

  const isCritical = alert.severity === 'High risk';
  const isWatch = alert.severity === 'Watch';

  const containerStyles = isCritical
    ? 'bg-red-50/80 dark:bg-red-950/30 border-criticalRed/30 dark:border-criticalRed/40'
    : isWatch
    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-warningAmber/30 dark:border-warningAmber/40'
    : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800';

  const badgeStyles = isCritical
    ? 'bg-criticalRed text-white'
    : isWatch
    ? 'bg-warningAmber text-white'
    : 'bg-agri text-white';

  const Icon = isCritical ? AlertTriangle : isWatch ? AlertCircle : CheckCircle;

  return (
    <div className={`rounded-2xl p-4 sm:p-5 border shadow-soft mb-4 transition-all ${containerStyles}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 flex-shrink-0 ${isCritical ? 'text-criticalRed' : isWatch ? 'text-warningAmber' : 'text-agri'}`} />
          <h4 className="font-bold text-sm sm:text-base text-darkText dark:text-darkTextPrimary">
            {language === 'hi' ? alert.titleHi : alert.titleEn}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeStyles}`}>
            {alert.severity}
          </span>
          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-xs text-gray-500 hover:text-darkText dark:text-gray-400 dark:hover:text-white font-medium"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
        {language === 'hi' ? alert.explanationHi : alert.explanationEn}
      </p>

      {/* Evidence Table */}
      {alert.evidence && alert.evidence.length > 0 && (
        <div className="bg-white/80 dark:bg-darkCard/80 rounded-xl p-3 border border-gray-100 dark:border-darkBorder mb-3 text-xs">
          <p className="font-semibold text-forest dark:text-limeAccent mb-1.5 flex items-center gap-1">
            <span>🔍 Observed Field Conditions:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alert.evidence.map((ev, idx) => (
              <div key={idx} className="bg-warmBg/80 dark:bg-darkSurface/80 p-2 rounded-lg flex items-center justify-between text-[11px]">
                <span className="font-medium text-darkText dark:text-darkTextPrimary">{ev.parameter}:</span>
                <span className="font-bold text-criticalRed">{ev.observedValue}</span>
                <span className="text-secondaryText dark:text-darkTextSecondary">(Target: {ev.thresholdExpected})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Action */}
      <div className="flex items-start gap-2 bg-white/90 dark:bg-darkCard/90 p-3 rounded-xl border border-gray-100 dark:border-darkBorder text-xs">
        <span className="font-bold text-agri dark:text-limeAccent flex-shrink-0">Action:</span>
        <span className="text-darkText dark:text-darkTextPrimary font-medium">
          {language === 'hi' ? alert.recommendedActionHi : alert.recommendedActionEn}
        </span>
      </div>

      {/* Timestamp */}
      <div className="flex items-center justify-between text-[11px] text-secondaryText dark:text-darkTextSecondary mt-2.5 pt-2 border-t border-gray-200/50 dark:border-darkBorder/50">
        <span>Recorded: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="font-semibold">Confidence: {alert.confidenceLevel}</span>
      </div>
    </div>
  );
};
