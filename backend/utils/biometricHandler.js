const crypto = require('crypto');

// Simulate fingerprint verification
const verifyFingerprint = (fingerprint1, fingerprint2) => {
  // In a real scenario, this would use advanced biometric comparison algorithms
  // For now, we do a simple comparison
  if (!fingerprint1 || !fingerprint2) {
    return { verified: false, confidence: 0 };
  }

  // Calculate similarity score (0-100)
  const similarity = calculateSimilarity(fingerprint1, fingerprint2);
  const threshold = 85; // 85% similarity threshold

  return {
    verified: similarity >= threshold,
    confidence: similarity,
  };
};

// Verify Face Descriptor (Euclidean Distance)
// Now supports voting (multiple stored descriptors)
const verifyFaceDescriptor = (storedDescriptors, liveDescriptor) => {
  // If storedDescriptors is null or empty
  if (!storedDescriptors || storedDescriptors.length === 0) {
    return { verified: false, score: 0 };
  }

  // Ensure liveDescriptor is a float array
  if (!liveDescriptor || liveDescriptor.length !== 128) {
    console.log("[FACE_MATCH] Invalid live descriptor length");
    return { verified: false, score: 0 };
  }

  // Threshold for face-api.js
  const threshold = 0.45; // Strict threshold as per reference
  let matchCount = 0;

  // Compare live descriptor against ALL stored samples
  storedDescriptors.forEach((stored, index) => {
    const distance = calculateEuclideanDistance(stored, liveDescriptor);
    console.log(`[FACE_MATCH] Sample ${index + 1}: Dist ${distance.toFixed(4)}`);

    if (distance < threshold) {
      matchCount++;
    }
  });

  const isVerified = matchCount >= 3; // Require at least 3 matches (out of 5)
  console.log(`[FACE_MATCH] Result: ${matchCount} matches. Verified: ${isVerified}`);

  return {
    verified: isVerified,
    confidence: (matchCount / storedDescriptors.length) * 100,
  };
};

// Helper: Calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const len = Math.min(str1.length, str2.length);
  let matches = 0;

  for (let i = 0; i < len; i++) {
    if (str1[i] === str2[i]) matches++;
  }

  return (matches / Math.max(str1.length, str2.length)) * 100;
};

// Helper: Calculate Euclidean distance between two arrays
const calculateEuclideanDistance = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

// Generate fingerprint hash for simulation
const generateFingerprintHash = (imageData) => {
  // Simulate fingerprint extraction - in production use actual biometric libs
  const hash = crypto.createHash('sha256');
  hash.update(imageData);
  return hash.digest('hex');
};

// Generate face descriptor for simulation
// Generate face descriptor (Pass-through if already array)
const generateFaceDescriptor = (input) => {
  // If input is already an array (from frontend face-api.js), use it directly
  if (Array.isArray(input)) {
    return input;
  }

  // If we receive raw image data (fallback/legacy), we technically can't 
  // generate a valid 128-float descriptor without a backend library.
  // For now, return empty or throw error if real auth is expected.
  return [];
};

module.exports = {
  verifyFingerprint,
  verifyFaceDescriptor,
  generateFingerprintHash,
  generateFaceDescriptor,
};
