// Environment variables validation and typing

// Validate required environment variables
const requiredEnvVars = {
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL
} as const;

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.warn(`Missing environment variables: ${missingEnvVars.join(", ")}`);
}

export { requiredEnvVars };
