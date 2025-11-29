import React from 'react';

interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  bold?: boolean;
  hasEOL?: boolean;
}

interface ResumeParserAlgorithmProps {
  textItems: TextItem[];
  parsedData: any;
}

const ResumeParserAlgorithm: React.FC<ResumeParserAlgorithmProps> = ({ textItems, parsedData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Parser Algorithm Overview</h2>
      
      <div className="space-y-6">
        {/* Step 1 */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Step 1: Extract Text Items</h3>
          <p className="text-gray-600 mb-3">
            Extract {textItems.length} text items from PDF with position and formatting data.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <div className="text-sm space-y-1">
              {textItems.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="truncate mr-4">{item.text}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    X:{Math.round(item.x)} Y:{Math.round(item.y)} {item.bold && 'Bold'}
                  </span>
                </div>
              ))}
              {textItems.length > 10 && (
                <div className="text-xs text-gray-400">... and {textItems.length - 10} more items</div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Step 2: Group into Lines</h3>
          <p className="text-gray-600 mb-3">
            Combine adjacent text items into readable lines based on position proximity.
          </p>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              Algorithm groups text items with distance &lt; average character width
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Step 3: Identify Sections</h3>
          <p className="text-gray-600 mb-3">
            Detect section headers (bold + uppercase) and group related content.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm font-medium text-green-800">Section Detection Rules:</div>
              <ul className="text-xs text-green-700 mt-1 space-y-1">
                <li>• Bold text</li>
                <li>• Uppercase letters</li>
                <li>• Single line item</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-800">Common Sections:</div>
              <ul className="text-xs text-purple-700 mt-1 space-y-1">
                <li>• Profile/Contact</li>
                <li>• Experience</li>
                <li>• Education</li>
                <li>• Skills</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Step 4: Extract Information</h3>
          <p className="text-gray-600 mb-3">
            Use feature scoring to identify and extract specific resume attributes.
          </p>
          
          {parsedData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Extraction Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{parsedData.name || 'Not detected'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{parsedData.email || 'Not detected'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{parsedData.phone || 'Not detected'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Skills:</span>
                  <span className="ml-2 text-gray-900">
                    {parsedData.skills?.length || 0} detected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Scoring */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Feature Scoring System</h3>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-800 space-y-2">
              <div><strong>Email Detection:</strong> Pattern matching for xxx@xxx.xxx format</div>
              <div><strong>Phone Detection:</strong> Pattern matching for (xxx) xxx-xxxx format</div>
              <div><strong>Name Detection:</strong> Letters, spaces, periods only + position scoring</div>
              <div><strong>Skills Detection:</strong> Keyword matching + context analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeParserAlgorithm;