/**
 * Performance testing utilities for user list components
 * This helps test how the app handles large numbers of users
 */

import type { User } from '../types/auth';

// Generate mock users for performance testing
export const generateMockUsers = (count: number): User[] => {
  const users: User[] = [];
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica',
    'Matthew', 'Ashley', 'Andrew', 'Amanda', 'Joshua', 'Stephanie', 'Daniel',
    'Jennifer', 'Ryan', 'Elizabeth', 'James', 'Lauren', 'Justin', 'Hannah',
    'Robert', 'Megan', 'Nicholas', 'Rachel', 'Tyler', 'Samantha', 'Brandon',
    'Nicole', 'Kevin', 'Kayla', 'Zachary', 'Kelly', 'Cody', 'Michelle'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
    'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
  ];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    users.push({
      _id: `mock_user_${i}`,
      name: `${firstName} ${lastName}`,
      profile: Math.random() > 0.3 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${i}` : '', // 70% have avatars
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last year
      updatedAt: new Date().toISOString(),
    });
  }

  return users;
};

// Performance measurement utilities
export const measureRenderTime = (name: string, fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  console.log(`${name} took ${duration.toFixed(2)}ms`);
  return duration;
};

// Memory usage measurement (if available)
export const getMemoryUsage = (): string => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return `Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB, Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`;
  }
  return 'Memory info not available';
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  return {
    log: (message: string) => {
      const currentTime = performance.now();
      console.log(`[${componentName}] ${message} (${(currentTime - startTime).toFixed(2)}ms)`);
    },
    measure: (operationName: string, fn: () => void) => {
      return measureRenderTime(`${componentName} - ${operationName}`, fn);
    }
  };
};

// Test scenarios for performance
export const PERFORMANCE_TEST_SCENARIOS = {
  SMALL: { users: 50, description: 'Small user base (50 users)' },
  MEDIUM: { users: 500, description: 'Medium user base (500 users)' },
  LARGE: { users: 2000, description: 'Large user base (2000 users)' },
  HUGE: { users: 5000, description: 'Huge user base (5000 users)' },
  EXTREME: { users: 10000, description: 'Extreme user base (10000 users)' },
};

// Utility to check if browser can handle the user count
export const canHandleUserCount = (count: number): { canHandle: boolean; recommendation: string } => {
  const memoryEstimate = count * 0.5; // Rough estimate: 0.5KB per user in memory
  
  if (count <= 100) {
    return { canHandle: true, recommendation: 'Standard list is fine' };
  } else if (count <= 1000) {
    return { canHandle: true, recommendation: 'Consider using infinite scroll' };
  } else if (count <= 5000) {
    return { canHandle: true, recommendation: 'Virtualized list recommended' };
  } else {
    return { 
      canHandle: false, 
      recommendation: `Use virtualized list with pagination. Estimated memory: ${memoryEstimate.toFixed(1)}KB` 
    };
  }
};

export default {
  generateMockUsers,
  measureRenderTime,
  getMemoryUsage,
  usePerformanceMonitor,
  PERFORMANCE_TEST_SCENARIOS,
  canHandleUserCount,
};
