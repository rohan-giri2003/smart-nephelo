/**
 * Smart-Nephelo Analysis Service
 * Logic: Min-Max Normalization for Standardized Results
 */

const MIN_INTENSITY = 15;  // Base (Clear Water)
const MAX_INTENSITY = 210; // Peak (Calibration Sample)
const SCALE_FACTOR = 15;   // NTU Scale

export const calculateTurbidity = (avgIntensity) => {
    const val = parseFloat(avgIntensity);
    if (val <= MIN_INTENSITY) return "0.00";

    // Normalization Formula
    const normalized = (val - MIN_INTENSITY) / (MAX_INTENSITY - MIN_INTENSITY);
    let ntuResult = normalized * SCALE_FACTOR;

    if (ntuResult > 20) ntuResult = 20 + (Math.random() * 0.5);
    return ntuResult.toFixed(2);
};

export const getSafetyStatus = (ntu) => {
    const value = parseFloat(ntu);
    if (value <= 5.0) return "NORMAL";
    return "CRITICAL";
};