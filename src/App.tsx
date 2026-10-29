import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { SensorProvider } from './context/SensorContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { OverviewPage } from './pages/OverviewPage';
import { FarmsPage } from './pages/FarmsPage';
import { FarmDetailPage } from './pages/FarmDetailPage';
import { SensorMonitoringPage } from './pages/SensorMonitoringPage';
import { CropHealthPage } from './pages/CropHealthPage';
import { CropAdvisorPage } from './pages/CropAdvisorPage';
import { CropComparisonPage } from './pages/CropComparisonPage';
import { WeatherPage } from './pages/WeatherPage';
import { ProfitCalculatorPage } from './pages/ProfitCalculatorPage';
import { AssistantPage } from './pages/AssistantPage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { ReportsPage } from './pages/ReportsPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FarmProvider>
          <SensorProvider>
            <BrowserRouter>
              <Routes>
                {/* Public / Auth Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Dashboard & App Modules */}
                <Route element={<Layout />}>
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/farms" element={<FarmsPage />} />
                  <Route path="/farms/:id" element={<FarmDetailPage />} />
                  <Route path="/sensor-monitoring" element={<SensorMonitoringPage />} />
                  <Route path="/crop-health" element={<CropHealthPage />} />
                  <Route path="/crop-advisor" element={<CropAdvisorPage />} />
                  <Route path="/crop-comparison" element={<CropComparisonPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/profit-calculator" element={<ProfitCalculatorPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/image-analysis" element={<ImageAnalysisPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/devices" element={<DeviceManagementPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/overview" replace />} />
              </Routes>
            </BrowserRouter>
          </SensorProvider>
        </FarmProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

