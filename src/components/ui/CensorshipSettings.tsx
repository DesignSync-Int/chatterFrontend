import React, { useState, useEffect } from 'react';
import { Shield, Save } from "lucide-react";
import { messageCensor } from '../../utils/messageCensorship';

interface CensorshipSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CensorshipSettings: React.FC<CensorshipSettingsProps> = ({ isOpen, onClose }) => {
  const [strictMode, setStrictMode] = useState(false);
  const [customWords, setCustomWords] = useState('');
  const [allowWhitelist, setAllowWhitelist] = useState(true);
  const [whitelist, setWhitelist] = useState('');

  useEffect(() => {
    if (isOpen) {
      const config = messageCensor.getConfig();
      setStrictMode(config.strictMode);
      setCustomWords(config.customWords.join(', '));
      setAllowWhitelist(config.allowWhitelist);
      setWhitelist(config.whitelist.join(', '));
    }
  }, [isOpen]);

  const handleSave = () => {
    const newConfig = {
      strictMode,
      customWords: customWords.split(',').map(word => word.trim()).filter(word => word),
      allowWhitelist,
      whitelist: whitelist.split(',').map(word => word.trim()).filter(word => word)
    };

    messageCensor.updateConfig(newConfig);
    
    // Save to localStorage for persistence
    localStorage.setItem('censorshipConfig', JSON.stringify(newConfig));
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Message Censorship Settings</h2>
        </div>

        <div className="space-y-4">
          {/* Strict Mode */}
          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Strict Mode</span>
              <span className="text-xs text-gray-500">Block messages instead of censoring</span>
            </label>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>

          {/* Custom Words */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Words to Block
            </label>
            <textarea
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              placeholder="Enter words separated by commas..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple words with commas
            </p>
          </div>

          {/* Allow Whitelist */}
          <div className="flex items-center justify-between">
            <label className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">Allow Whitelist</span>
              <span className="text-xs text-gray-500">Allow certain words to bypass censorship</span>
            </label>
            <input
              type="checkbox"
              checked={allowWhitelist}
              onChange={(e) => setAllowWhitelist(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
          </div>

          {/* Whitelist */}
          {allowWhitelist && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Words
              </label>
              <textarea
                value={whitelist}
                onChange={(e) => setWhitelist(e.target.value)}
                placeholder="Enter allowed words separated by commas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                These words will not be censored
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Test Message</h4>
            <div className="text-xs space-y-1">
              <p><strong>Original:</strong> "This is a damn good example!"</p>
              <p><strong>Censored:</strong> "This is a d**n good example!"</p>
              {strictMode && <p className="text-red-600"><strong>Strict Mode:</strong> Message would be blocked</p>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CensorshipSettings;
