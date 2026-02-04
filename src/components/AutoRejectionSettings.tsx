import React, { useState, useEffect } from 'react';
import { Settings, Save, BarChart3, Users, Brain } from 'lucide-react';
import { API_ENDPOINTS } from '../config/constants';

interface AutoRejectionSettingsProps {
  jobId?: string;
  onSave?: (settings: any) => void;
}

const AutoRejectionSettings: React.FC<AutoRejectionSettingsProps> = ({ jobId, onSave }) => {
  const [settings, setSettings] = useState({
    autoReject: false,
    minSkillsMatch: 60,
    minExperienceMatch: 80,
    minOverallScore: 70,
    sendFeedback: true,
    rejectReasons: {
      skillsMismatch: true,
      insufficientExperience: true,
      educationGap: false,
      locationMismatch: false
    }
  });

  const [analytics, setAnalytics] = useState({
    totalApplications: 0,
    autoRejected: 0,
    rejectionReasons: {
      skillsMismatch: 0,
      insufficientExperience: 0,
      educationGap: 0,
      locationMismatch: 0
    }
  });

  useEffect(() => {
    loadSettings();
  }, [jobId]);

  const loadSettings = async () => {
    try {
      // Try to load from API first
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/ai-rejection-settings${jobId ? `/${jobId}` : ''}`);
      if (response.ok) {
        const savedSettings = await response.json();
        setSettings(savedSettings);
      } else {
        // Fallback to localStorage
        const savedSettings = localStorage.getItem(`aiRejectionSettings${jobId ? `_${jobId}` : ''}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      const savedSettings = localStorage.getItem(`aiRejectionSettings${jobId ? `_${jobId}` : ''}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReasonChange = (reason: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      rejectReasons: {
        ...prev.rejectReasons,
        [reason]: enabled
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Try to save to API first
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/ai-rejection-settings${jobId ? `/${jobId}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        alert('Auto-rejection settings saved successfully!');
      } else {
        throw new Error('API save failed');
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      localStorage.setItem(`aiRejectionSettings${jobId ? `_${jobId}` : ''}`, JSON.stringify(settings));
      alert('Auto-rejection settings saved successfully!');
    }
    
    if (onSave) {
      onSave(settings);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Brain className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">AI Auto-Rejection Settings</h2>
      </div>

      {/* Enable Auto-Rejection */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoReject}
            onChange={(e) => handleSettingChange('autoReject', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-gray-900 font-medium">Enable AI Auto-Rejection</span>
        </label>
        <p className="text-sm text-gray-500 mt-1 ml-7">
          Automatically reject candidates who don&apos;t meet minimum requirements
        </p>
      </div>

      {settings.autoReject && (
        <>
          {/* Threshold Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills Match Threshold
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.minSkillsMatch}
                  onChange={(e) => handleSettingChange('minSkillsMatch', parseInt(e.target.value))}
                  className="flex-1 mr-3"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {settings.minSkillsMatch}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Match Threshold
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.minExperienceMatch}
                  onChange={(e) => handleSettingChange('minExperienceMatch', parseInt(e.target.value))}
                  className="flex-1 mr-3"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {settings.minExperienceMatch}%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Score Threshold
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.minOverallScore}
                  onChange={(e) => handleSettingChange('minOverallScore', parseInt(e.target.value))}
                  className="flex-1 mr-3"
                />
                <span className="text-sm font-medium text-gray-900 w-12">
                  {settings.minOverallScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Reasons */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Reject For:</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.rejectReasons.skillsMismatch}
                  onChange={(e) => handleReasonChange('skillsMismatch', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">Skills Mismatch</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.rejectReasons.insufficientExperience}
                  onChange={(e) => handleReasonChange('insufficientExperience', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">Insufficient Experience</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.rejectReasons.educationGap}
                  onChange={(e) => handleReasonChange('educationGap', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">Education Requirements</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.rejectReasons.locationMismatch}
                  onChange={(e) => handleReasonChange('locationMismatch', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">Location Mismatch</span>
              </label>
            </div>
          </div>

          {/* Feedback Settings */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.sendFeedback}
                onChange={(e) => handleSettingChange('sendFeedback', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900 font-medium">Send feedback to rejected candidates</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Help candidates improve by explaining why they were rejected
            </p>
          </div>
        </>
      )}

      {/* Analytics Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Rejection Analytics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Applications</span>
            <div className="font-semibold text-gray-900">{analytics.totalApplications}</div>
          </div>
          <div>
            <span className="text-gray-500">Auto-Rejected</span>
            <div className="font-semibold text-red-600">{analytics.autoRejected}</div>
          </div>
          <div>
            <span className="text-gray-500">Skills Issues</span>
            <div className="font-semibold text-orange-600">{analytics.rejectionReasons.skillsMismatch}</div>
          </div>
          <div>
            <span className="text-gray-500">Experience Issues</span>
            <div className="font-semibold text-yellow-600">{analytics.rejectionReasons.insufficientExperience}</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AutoRejectionSettings;