import { useState } from 'react';
import { useChatStore } from '../../store/messages.store';
import { generateMockUsers, PERFORMANCE_TEST_SCENARIOS, canHandleUserCount, getMemoryUsage } from '../../utils/performance';
import { Zap, Users, AlertTriangle, Info } from "lucide-react";

const PerformanceTestPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResults, setLastTestResults] = useState<{
    userCount: number;
    renderTime: number;
    memoryUsage: string;
  } | null>(null);

  const { setUsers } = useChatStore();

  const handleLoadTestUsers = async (count: number) => {
    setIsLoading(true);
    const startTime = performance.now();
    
    try {
      // Generate mock users
      const mockUsers = generateMockUsers(count);
      
      // Set them in the store
      setUsers(mockUsers);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setLastTestResults({
        userCount: count,
        renderTime,
        memoryUsage: getMemoryUsage(),
      });
      
      console.log(`Loaded ${count} test users in ${renderTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('Error loading test users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTestUsers = () => {
    setUsers([]);
    setLastTestResults(null);
    console.log('Cleared all test users');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Performance Testing Tools"
      >
        <Zap className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Performance Testing</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Test Scenarios */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Load Test Users
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(PERFORMANCE_TEST_SCENARIOS).map(
              ([key, scenario]) => {
                const { canHandle, recommendation } = canHandleUserCount(
                  scenario.users
                );

                return (
                  <button
                    key={key}
                    onClick={() => handleLoadTestUsers(scenario.users)}
                    disabled={isLoading}
                    className={`p-2 rounded border text-left transition-colors ${
                      canHandle
                        ? "border-green-300 bg-green-50 hover:bg-green-100 text-green-700"
                        : "border-red-300 bg-red-50 hover:bg-red-100 text-red-700"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={recommendation}
                  >
                    <div className="font-medium">{scenario.users} users</div>
                    <div className="text-xs opacity-75">
                      {key.toLowerCase()}
                    </div>
                    {!canHandle && (
                      <AlertTriangle className="h-3 w-3 inline ml-1" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Custom Count */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Custom Count
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="User count"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (value > 0) {
                    handleLoadTestUsers(value);
                  }
                }
              }}
            />
            <button
              onClick={handleClearTestUsers}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading test users...</span>
          </div>
        )}

        {/* Last test results */}
        {lastTestResults && !isLoading && (
          <div className="bg-gray-50 rounded p-3 text-sm">
            <div className="flex items-center gap-1 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Last Test Results</span>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Users: {lastTestResults.userCount.toLocaleString()}</div>
              <div>Load Time: {lastTestResults.renderTime.toFixed(2)}ms</div>
              <div>Memory: {lastTestResults.memoryUsage}</div>
            </div>
          </div>
        )}

        {/* Performance tips */}
        <div className="bg-blue-50 rounded p-3 text-xs">
          <div className="font-medium text-blue-700 mb-1">Testing Tips</div>
          <ul className="text-blue-600 space-y-1">
            <li>• Virtualized list handles any user count smoothly</li>
            <li>• Use search to test filtering performance</li>
            <li>• Monitor browser memory usage</li>
            <li>• Test scroll performance with large datasets</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTestPanel;
