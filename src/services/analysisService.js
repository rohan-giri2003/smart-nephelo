/**
 * Core Algorithm for the Smartphone Nephelometer
 * Principle: Green Channel Intensity is proportional to Light Scattering
 */
export const calculateTurbidity = (greenIntensity) => {
  // Calibration: Based on your prototype's green LED and CMOS sensor sensitivity
  // Replace these values based on your physical testing
  const slope = 0.52; 
  const intercept = -1.2;
  
  const ntuValue = (slope * greenIntensity) + intercept;
  return ntuValue > 0 ? ntuValue.toFixed(2) : "0.00";
};