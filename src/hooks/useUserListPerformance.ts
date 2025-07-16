// Performance monitoring hook for user list
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  domNodes: number;
  memoryUsage: string;
  visibleItems: number;
  totalItems: number;
}

export const useUserListPerformance = (
  totalUsers: number, 
  visibleUsers: number,
  isEnabled: boolean = true
): PerformanceMetrics => {
  const renderStartTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    domNodes: 0,
    memoryUsage: '0 MB',
    visibleItems: 0,
    totalItems: 0
  });

  useEffect(() => {
    if (!isEnabled) return;

    renderStartTime.current = performance.now();
    
    // Use requestAnimationFrame to measure after render
    const measureRender = () => {
      const renderTime = performance.now() - renderStartTime.current;
      const domNodes = document.querySelectorAll('[data-user-card]').length;
      
      // Estimate memory usage
      let memoryUsage = '0 MB';
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        memoryUsage = `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`;
      }

      metricsRef.current = {
        renderTime: Math.round(renderTime * 100) / 100,
        domNodes,
        memoryUsage,
        visibleItems: visibleUsers,
        totalItems: totalUsers
      };

      // Log performance metrics
      console.log('User List Performance Metrics:', {
        'Render Time': `${metricsRef.current.renderTime}ms`,
        'DOM Nodes': metricsRef.current.domNodes,
        'Memory Usage': metricsRef.current.memoryUsage,
        'Efficiency': `${visibleUsers}/${totalUsers} users rendered (${((visibleUsers/totalUsers)*100).toFixed(1)}%)`,
        'Performance': renderTime < 16 ? 'Excellent (<16ms)' : 
                      renderTime < 33 ? 'Good (<33ms)' : 
                      'Needs optimization (>33ms)'
      });
    };

    requestAnimationFrame(measureRender);
  }, [totalUsers, visibleUsers, isEnabled]);

  return metricsRef.current;
};

export default useUserListPerformance;
