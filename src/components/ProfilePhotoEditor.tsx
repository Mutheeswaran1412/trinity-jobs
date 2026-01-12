import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Edit2, Trash2 } from 'lucide-react';

interface ProfilePhotoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: string, frame?: string) => void;
  currentPhoto?: string;
  currentFrame?: string;
}

const ProfilePhotoEditor: React.FC<ProfilePhotoEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPhoto,
  currentFrame
}) => {
  const [photo, setPhoto] = useState(currentPhoto || '');
  const [selectedFrame, setSelectedFrame] = useState(currentFrame || 'none');
  const [activeTab, setActiveTab] = useState<'edit' | 'frames'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPhoto(currentPhoto || '');
      setSelectedFrame(currentFrame || 'none');
      setActiveTab('edit');
    }
  }, [isOpen, currentPhoto, currentFrame]);

  const frames = [
    { id: 'none', name: 'No Frame', color: 'transparent' },
    { id: 'blue', name: 'Professional Blue', color: '#0A66C2' },
    { id: 'green', name: 'Open to Work', color: '#057642' },
    { id: 'purple', name: 'Hiring', color: '#7C3AED' },
    { id: 'gold', name: 'Premium', color: '#F59E0B' }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setPhoto('');
    setSelectedFrame('none');
  };

  const handleSave = () => {
    onSave(photo, selectedFrame);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Profile photo</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Large Photo Preview */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div 
                className="w-64 h-64 rounded-full overflow-hidden flex items-center justify-center bg-gray-100"
                style={{ 
                  borderWidth: selectedFrame !== 'none' ? '6px' : '0',
                  borderStyle: 'solid',
                  borderColor: frames.find(f => f.id === selectedFrame)?.color 
                }}
              >
                {photo ? (
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-24 h-24 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Action Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-700" />
              </div>
              <span className="text-sm font-medium">Update photo</span>
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'frames' ? 'edit' : 'frames')}
              className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Edit2 className="w-6 h-6 text-gray-700" />
              </div>
              <span className="text-sm font-medium">Frames</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-gray-700" />
              </div>
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>

          {/* Frame Selection */}
          {activeTab === 'frames' && (
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3">
                {frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedFrame === frame.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div
                        className="w-8 h-8 rounded-full border-3"
                        style={{ 
                          borderWidth: '3px',
                          borderStyle: 'solid',
                          borderColor: frame.color === 'transparent' ? '#E5E7EB' : frame.color 
                        }}
                      />
                      <span className="text-xs font-medium">{frame.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleSave}
              disabled={!photo}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Save photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoEditor;
