import React, { useState, useEffect } from 'react';
import { Settings, Save, BarChart3, Users, Brain } from 'lucide-react';

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

  const handleSave = () => {
    if (onSave) {
      onSave(settings);
    }
    alert('Auto-rejection settings saved successfully!');
  };

  return (
    <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 p-6\">
      <div className=\"flex items-center mb-6\">
        <Brain className=\"w-6 h-6 text-blue-600 mr-3\" />
        <h2 className=\"text-xl font-semibold text-gray-900\">AI Auto-Rejection Settings</h2>\n      </div>\n\n      {/* Enable Auto-Rejection */}\n      <div className=\"mb-6\">\n        <label className=\"flex items-center\">\n          <input\n            type=\"checkbox\"\n            checked={settings.autoReject}\n            onChange={(e) => handleSettingChange('autoReject', e.target.checked)}\n            className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n          />\n          <span className=\"ml-3 text-gray-900 font-medium\">Enable AI Auto-Rejection</span>\n        </label>\n        <p className=\"text-sm text-gray-500 mt-1 ml-7\">\n          Automatically reject candidates who don't meet minimum requirements\n        </p>\n      </div>\n\n      {settings.autoReject && (\n        <>\n          {/* Threshold Settings */}\n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-6\">\n            <div>\n              <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                Skills Match Threshold\n              </label>\n              <div className=\"flex items-center\">\n                <input\n                  type=\"range\"\n                  min=\"0\"\n                  max=\"100\"\n                  value={settings.minSkillsMatch}\n                  onChange={(e) => handleSettingChange('minSkillsMatch', parseInt(e.target.value))}\n                  className=\"flex-1 mr-3\"\n                />\n                <span className=\"text-sm font-medium text-gray-900 w-12\">\n                  {settings.minSkillsMatch}%\n                </span>\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                Experience Match Threshold\n              </label>\n              <div className=\"flex items-center\">\n                <input\n                  type=\"range\"\n                  min=\"0\"\n                  max=\"100\"\n                  value={settings.minExperienceMatch}\n                  onChange={(e) => handleSettingChange('minExperienceMatch', parseInt(e.target.value))}\n                  className=\"flex-1 mr-3\"\n                />\n                <span className=\"text-sm font-medium text-gray-900 w-12\">\n                  {settings.minExperienceMatch}%\n                </span>\n              </div>\n            </div>\n\n            <div>\n              <label className=\"block text-sm font-medium text-gray-700 mb-2\">\n                Overall Score Threshold\n              </label>\n              <div className=\"flex items-center\">\n                <input\n                  type=\"range\"\n                  min=\"0\"\n                  max=\"100\"\n                  value={settings.minOverallScore}\n                  onChange={(e) => handleSettingChange('minOverallScore', parseInt(e.target.value))}\n                  className=\"flex-1 mr-3\"\n                />\n                <span className=\"text-sm font-medium text-gray-900 w-12\">\n                  {settings.minOverallScore}%\n                </span>\n              </div>\n            </div>\n          </div>\n\n          {/* Rejection Reasons */}\n          <div className=\"mb-6\">\n            <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Auto-Reject For:</h3>\n            <div className=\"grid grid-cols-2 gap-4\">\n              <label className=\"flex items-center\">\n                <input\n                  type=\"checkbox\"\n                  checked={settings.rejectReasons.skillsMismatch}\n                  onChange={(e) => handleReasonChange('skillsMismatch', e.target.checked)}\n                  className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n                />\n                <span className=\"ml-3 text-gray-900\">Skills Mismatch</span>\n              </label>\n\n              <label className=\"flex items-center\">\n                <input\n                  type=\"checkbox\"\n                  checked={settings.rejectReasons.insufficientExperience}\n                  onChange={(e) => handleReasonChange('insufficientExperience', e.target.checked)}\n                  className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n                />\n                <span className=\"ml-3 text-gray-900\">Insufficient Experience</span>\n              </label>\n\n              <label className=\"flex items-center\">\n                <input\n                  type=\"checkbox\"\n                  checked={settings.rejectReasons.educationGap}\n                  onChange={(e) => handleReasonChange('educationGap', e.target.checked)}\n                  className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n                />\n                <span className=\"ml-3 text-gray-900\">Education Requirements</span>\n              </label>\n\n              <label className=\"flex items-center\">\n                <input\n                  type=\"checkbox\"\n                  checked={settings.rejectReasons.locationMismatch}\n                  onChange={(e) => handleReasonChange('locationMismatch', e.target.checked)}\n                  className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n                />\n                <span className=\"ml-3 text-gray-900\">Location Mismatch</span>\n              </label>\n            </div>\n          </div>\n\n          {/* Feedback Settings */}\n          <div className=\"mb-6\">\n            <label className=\"flex items-center\">\n              <input\n                type=\"checkbox\"\n                checked={settings.sendFeedback}\n                onChange={(e) => handleSettingChange('sendFeedback', e.target.checked)}\n                className=\"w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500\"\n              />\n              <span className=\"ml-3 text-gray-900 font-medium\">Send feedback to rejected candidates</span>\n            </label>\n            <p className=\"text-sm text-gray-500 mt-1 ml-7\">\n              Help candidates improve by explaining why they were rejected\n            </p>\n          </div>\n        </>\n      )}\n\n      {/* Analytics Preview */}\n      <div className=\"bg-gray-50 rounded-lg p-4 mb-6\">\n        <div className=\"flex items-center mb-3\">\n          <BarChart3 className=\"w-5 h-5 text-gray-600 mr-2\" />\n          <h3 className=\"text-sm font-medium text-gray-900\">Rejection Analytics</h3>\n        </div>\n        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">\n          <div>\n            <span className=\"text-gray-500\">Total Applications</span>\n            <div className=\"font-semibold text-gray-900\">{analytics.totalApplications}</div>\n          </div>\n          <div>\n            <span className=\"text-gray-500\">Auto-Rejected</span>\n            <div className=\"font-semibold text-red-600\">{analytics.autoRejected}</div>\n          </div>\n          <div>\n            <span className=\"text-gray-500\">Skills Issues</span>\n            <div className=\"font-semibold text-orange-600\">{analytics.rejectionReasons.skillsMismatch}</div>\n          </div>\n          <div>\n            <span className=\"text-gray-500\">Experience Issues</span>\n            <div className=\"font-semibold text-yellow-600\">{analytics.rejectionReasons.insufficientExperience}</div>\n          </div>\n        </div>\n      </div>\n\n      {/* Save Button */}\n      <div className=\"flex justify-end\">\n        <button\n          onClick={handleSave}\n          className=\"bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center\"\n        >\n          <Save className=\"w-4 h-4 mr-2\" />\n          Save Settings\n        </button>\n      </div>\n    </div>\n  );\n};\n\nexport default AutoRejectionSettings;