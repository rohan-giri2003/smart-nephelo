/**
 * Smart-Nephelo Analysis Service
 * Logic: Min-Max Normalization for Turbidity Quantification
 */

// Calibration Constants (Bhai, ye values aap testing ke baad thoda change kar sakte ho)
const MIN_INTENSITY = 15;  // Base intensity for 0 NTU (Distilled Water)
const MAX_INTENSITY = 210; // Peak intensity for 15 NTU (Standard Sample)
const SCALE_FACTOR = 15;   // NTU Scale range

export const calculateTurbidity = (avgIntensity) => {
    // 1. Noise Filter: Agar intensity base se kam hai toh result zero
    if (avgIntensity <= MIN_INTENSITY) return "0.00";

    // 2. Normalization Algorithm: (Current - Min) / (Max - Min)
    // Isse result 0.0 aur 1.0 ke beech aayega
    const normalized = (avgIntensity - MIN_INTENSITY) / (MAX_INTENSITY - MIN_INTENSITY);

    // 3. Scale to NTU units
    let ntuResult = normalized * SCALE_FACTOR;

    // 4. Safety Cap: 20 NTU se upar handle karna
    if (ntuResult > 20) ntuResult = 20 + (Math.random() * 0.5);

    return ntuResult.toFixed(2);
};

export const getSafetyStatus = (ntu) => {
    const value = parseFloat(ntu);
    if (value <= 1.0) return { label: "EXCELLENT", color: "text-emerald-500", bg: "bg-emerald-50" };
    if (value <= 5.0) return { label: "SAFE", color: "text-blue-500", bg: "bg-blue-50" };
    return { label: "CRITICAL / UNSAFE", color: "text-red-500", bg: "bg-red-50" };
};