// configuration for the app
export const BasePath = import.meta.env.VITE_BASE_URL || 'http://localhost:4001';

// time configurations - these might need tweaking later
export const TimeConfig = {
  minorTime: 20,
  majoreTime: 60, // TODO: change to 3600 for production (1 hour)
};
