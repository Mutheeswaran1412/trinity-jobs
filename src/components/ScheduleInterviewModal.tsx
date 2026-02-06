import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, MapPin, X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/env';

interface ScheduleInterviewModalProps {
  application: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({ application, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    duration: 60,
    type: 'video',
    platform: 'zoom',
    meetingLink: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scheduleInterview = async () => {
    if (!formData.scheduledDate) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const endpoint = formData.type === 'video' && formData.platform === 'zoom' && !formData.meetingLink
        ? `${API_ENDPOINTS.INTERVIEWS}/create-with-meeting`
        : `${API_ENDPOINTS.INTERVIEWS}/schedule`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: application._id,
          candidateId: application.candidateId,
          candidateEmail: application.candidateEmail,
          jobId: application.jobId?._id || application.jobId,
          ...formData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Interview scheduled successfully!');
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateZoomLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.MEETINGS}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          platform: 'zoom',
          topic: `Interview - ${application.jobId?.jobTitle || application.jobId?.title}`,
          start_time: formData.scheduledDate,
          duration: formData.duration,
          description: `Interview with ${application.candidateName}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, meetingLink: result.meeting.join_url });
        alert('Zoom meeting created successfully!');
      } else {
        alert('Error: ' + (result.error || result.message));
      }
    } catch (error) {
      alert('Error creating Zoom meeting: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Schedule Interview</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Candidate: <span className="font-medium">{application.candidateName}</span></p>
          <p className="text-sm text-gray-600">Position: <span className="font-medium">{application.jobId?.jobTitle || application.jobId?.title}</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="schedule-datetime" className="block text-sm font-medium mb-1">Date & Time</label>
            <input
              id="schedule-datetime"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full p-2 border rounded-lg"
              min={new Date().toISOString().slice(0, 16)}
              aria-label="Select interview date and time"
            />
          </div>

          <div>
            <label htmlFor="schedule-duration" className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <select
              id="schedule-duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
              aria-label="Select interview duration"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div>
            <label htmlFor="schedule-type" className="block text-sm font-medium mb-1">Interview Type</label>
            <select
              id="schedule-type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded-lg"
              aria-label="Select interview type"
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In Person</option>
            </select>
          </div>

          {formData.type === 'video' && (
            <div>
              <label htmlFor="schedule-platform" className="block text-sm font-medium mb-1">Meeting Platform</label>
              <div className="space-y-2">
                <select
                  id="schedule-platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  aria-label="Select meeting platform"
                >
                  <option value="zoom">Zoom</option>
                  <option value="googlemeet">Google Meet</option>
                  <option value="custom">Custom Link</option>
                </select>

                {formData.platform === 'zoom' && formData.scheduledDate && (
                  <button
                    type="button"
                    onClick={generateZoomLink}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                  >
                    <Video size={16} className="mr-2" />
                    {loading ? 'Creating...' : 'Generate Zoom Link'}
                  </button>
                )}

                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="Or paste meeting link here..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          {formData.type === 'in-person' && (
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Office address..."
                className="w-full p-2 border rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information for the candidate..."
              className="w-full p-2 border rounded-lg h-20"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={scheduleInterview}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
