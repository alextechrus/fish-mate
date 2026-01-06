import { Fish, CompatibilityResult, CompatibilityCheck, CompatibilityStatus } from '../types/fish';
import { getFishById } from '../data/fish-database';

// Check if water parameters overlap
const checkWaterParameterOverlap = (fish1: Fish, fish2: Fish): { compatible: boolean; issues: string[] } => {
  const issues: string[] = [];

  const tempOverlap =
    fish1.waterParameters.temperatureMax >= fish2.waterParameters.temperatureMin &&
    fish1.waterParameters.temperatureMin <= fish2.waterParameters.temperatureMax;

  const phOverlap =
    fish1.waterParameters.phMax >= fish2.waterParameters.phMin &&
    fish1.waterParameters.phMin <= fish2.waterParameters.phMax;

  const hardnessOverlap =
    fish1.waterParameters.hardnessMax >= fish2.waterParameters.hardnessMin &&
    fish1.waterParameters.hardnessMin <= fish2.waterParameters.hardnessMax;

  if (!tempOverlap) {
    issues.push(`Temperature requirements don't overlap: ${fish1.commonName} needs ${fish1.waterParameters.temperatureMin}-${fish1.waterParameters.temperatureMax}°F, ${fish2.commonName} needs ${fish2.waterParameters.temperatureMin}-${fish2.waterParameters.temperatureMax}°F`);
  }

  if (!phOverlap) {
    issues.push(`pH requirements don't overlap: ${fish1.commonName} needs pH ${fish1.waterParameters.phMin}-${fish1.waterParameters.phMax}, ${fish2.commonName} needs pH ${fish2.waterParameters.phMin}-${fish2.waterParameters.phMax}`);
  }

  if (!hardnessOverlap) {
    issues.push(`Water hardness requirements don't overlap`);
  }

  return {
    compatible: tempOverlap && phOverlap && hardnessOverlap,
    issues
  };
};

// Check aggression compatibility
const checkAggressionCompatibility = (fish1: Fish, fish2: Fish): { status: CompatibilityStatus; reasons: string[] } => {
  const reasons: string[] = [];

  // Aggressive fish with peaceful fish
  if (fish1.temperament === 'aggressive' && fish2.temperament === 'peaceful') {
    reasons.push(`${fish1.commonName} is aggressive and may harm the peaceful ${fish2.commonName}`);
    return { status: 'incompatible', reasons };
  }

  if (fish2.temperament === 'aggressive' && fish1.temperament === 'peaceful') {
    reasons.push(`${fish2.commonName} is aggressive and may harm the peaceful ${fish1.commonName}`);
    return { status: 'incompatible', reasons };
  }

  // Two aggressive fish
  if (fish1.temperament === 'aggressive' && fish2.temperament === 'aggressive') {
    reasons.push(`Both ${fish1.commonName} and ${fish2.commonName} are aggressive - may fight`);
    return { status: 'conditional', reasons };
  }

  // Semi-aggressive with peaceful
  if ((fish1.temperament === 'semi-aggressive' && fish2.temperament === 'peaceful') ||
      (fish2.temperament === 'semi-aggressive' && fish1.temperament === 'peaceful')) {
    const aggressive = fish1.temperament === 'semi-aggressive' ? fish1 : fish2;
    const peaceful = fish1.temperament === 'peaceful' ? fish1 : fish2;
    reasons.push(`${aggressive.commonName} is semi-aggressive and may occasionally harass ${peaceful.commonName}`);
    return { status: 'conditional', reasons };
  }

  return { status: 'compatible', reasons };
};

// Check size compatibility
const checkSizeCompatibility = (fish1: Fish, fish2: Fish): { status: CompatibilityStatus; reasons: string[] } => {
  const reasons: string[] = [];
  const sizeDiff = Math.abs(fish1.maxSize - fish2.maxSize);
  const smallerFish = fish1.maxSize < fish2.maxSize ? fish1 : fish2;
  const largerFish = fish1.maxSize >= fish2.maxSize ? fish1 : fish2;

  // If one fish is more than 3x the size of the other
  if (largerFish.maxSize > smallerFish.maxSize * 3) {
    reasons.push(`${largerFish.commonName} (${largerFish.maxSize}") may eat or harm the much smaller ${smallerFish.commonName} (${smallerFish.maxSize}")`);
    return { status: 'incompatible', reasons };
  }

  // If significant size difference
  if (sizeDiff > 4) {
    reasons.push(`Significant size difference between ${fish1.commonName} and ${fish2.commonName}`);
    return { status: 'conditional', reasons };
  }

  return { status: 'compatible', reasons };
};

// Check water type compatibility
const checkWaterTypeCompatibility = (fish1: Fish, fish2: Fish): { compatible: boolean; reason?: string } => {
  if (fish1.waterType !== fish2.waterType) {
    return {
      compatible: false,
      reason: `${fish1.commonName} is ${fish1.waterType} and ${fish2.commonName} is ${fish2.waterType} - they cannot live together`
    };
  }
  return { compatible: true };
};

// Main compatibility check between two fish
export const checkTwoFishCompatibility = (fish1: Fish, fish2: Fish): CompatibilityResult => {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let overallStatus: CompatibilityStatus = 'compatible';

  // Check if same fish
  if (fish1.id === fish2.id) {
    // Check if fish can be kept together
    if (fish1.id === 'betta') {
      return {
        status: 'incompatible',
        fish1,
        fish2,
        reasons: ['Male Bettas cannot be kept together - they will fight'],
        warnings: [],
        suggestions: ['Keep only one male Betta per tank, or consider a sorority of females in a large tank'],
      };
    }
    if (fish1.schoolingFish) {
      return {
        status: 'compatible',
        fish1,
        fish2,
        reasons: [`${fish1.commonName} is a schooling fish and should be kept in groups of ${fish1.minSchoolSize}+`],
        suggestions: [`Keep at least ${fish1.minSchoolSize} ${fish1.commonName} together`],
      };
    }
  }

  // Water type check - fundamental incompatibility
  const waterCheck = checkWaterTypeCompatibility(fish1, fish2);
  if (!waterCheck.compatible) {
    return {
      status: 'incompatible',
      fish1,
      fish2,
      reasons: [waterCheck.reason!],
    };
  }

  // Check explicit compatibility lists
  if (fish1.incompatibleWith.includes(fish2.id) || fish2.incompatibleWith.includes(fish1.id)) {
    reasons.push(`${fish1.commonName} and ${fish2.commonName} are known to be incompatible`);
    overallStatus = 'incompatible';
  } else if (fish1.conditionalWith.includes(fish2.id) || fish2.conditionalWith.includes(fish1.id)) {
    warnings.push(`${fish1.commonName} and ${fish2.commonName} can sometimes coexist with caution`);
    if (overallStatus === 'compatible') overallStatus = 'conditional';
  }

  // Water parameters check
  const paramCheck = checkWaterParameterOverlap(fish1, fish2);
  if (!paramCheck.compatible) {
    reasons.push(...paramCheck.issues);
    overallStatus = 'incompatible';
  }

  // Aggression check
  const aggressionCheck = checkAggressionCompatibility(fish1, fish2);
  if (aggressionCheck.status === 'incompatible') {
    reasons.push(...aggressionCheck.reasons);
    overallStatus = 'incompatible';
  } else if (aggressionCheck.status === 'conditional') {
    warnings.push(...aggressionCheck.reasons);
    if (overallStatus === 'compatible') overallStatus = 'conditional';
  }

  // Size check
  const sizeCheck = checkSizeCompatibility(fish1, fish2);
  if (sizeCheck.status === 'incompatible') {
    reasons.push(...sizeCheck.reasons);
    overallStatus = 'incompatible';
  } else if (sizeCheck.status === 'conditional') {
    warnings.push(...sizeCheck.reasons);
    if (overallStatus === 'compatible') overallStatus = 'conditional';
  }

  // Add suggestions based on issues
  if (overallStatus === 'conditional') {
    suggestions.push('Consider adding more hiding spaces and plants to reduce stress');
    suggestions.push('Monitor fish behavior closely after introduction');
    if (fish1.schoolingFish || fish2.schoolingFish) {
      suggestions.push('Keep schooling fish in proper groups to reduce aggression');
    }
  }

  // If fully compatible
  if (overallStatus === 'compatible' && reasons.length === 0) {
    reasons.push(`${fish1.commonName} and ${fish2.commonName} are compatible tank mates`);
  }

  return {
    status: overallStatus,
    fish1,
    fish2,
    reasons,
    warnings,
    suggestions,
  };
};

// Check compatibility of multiple fish
export const checkMultipleFishCompatibility = (fishIds: string[], tankSize?: number): CompatibilityCheck => {
  const results: CompatibilityResult[] = [];
  const suggestions: string[] = [];
  let overallStatus: CompatibilityStatus = 'compatible';
  let tankSizeWarning: string | undefined;

  const fish = fishIds.map(id => getFishById(id)).filter((f): f is Fish => f !== undefined);

  if (fish.length < 2) {
    return {
      overallStatus: 'compatible',
      results: [],
      suggestions: fish.length === 1 && fish[0].schoolingFish
        ? [`${fish[0].commonName} is a schooling fish - consider adding ${fish[0].minSchoolSize! - 1} more`]
        : [],
    };
  }

  // Check tank size
  if (tankSize) {
    const minRequired = Math.max(...fish.map(f => f.minTankSize));
    const totalBioload = fish.reduce((sum, f) => sum + f.maxSize, 0);

    if (tankSize < minRequired) {
      tankSizeWarning = `Tank size (${tankSize}g) is too small. Minimum ${minRequired}g required.`;
      overallStatus = 'incompatible';
    } else if (totalBioload > tankSize * 0.5) {
      tankSizeWarning = `Tank may be overstocked. Consider a larger tank for long-term health.`;
      if (overallStatus === 'compatible') overallStatus = 'conditional';
    }
  }

  // Check each pair
  for (let i = 0; i < fish.length; i++) {
    for (let j = i + 1; j < fish.length; j++) {
      const result = checkTwoFishCompatibility(fish[i], fish[j]);
      results.push(result);

      if (result.status === 'incompatible') {
        overallStatus = 'incompatible';
      } else if (result.status === 'conditional' && overallStatus === 'compatible') {
        overallStatus = 'conditional';
      }
    }
  }

  // Add general suggestions
  const schoolingFish = fish.filter(f => f.schoolingFish);
  schoolingFish.forEach(f => {
    const count = fish.filter(fish => fish.id === f.id).length;
    if (count < (f.minSchoolSize || 6)) {
      suggestions.push(`${f.commonName} should be kept in groups of ${f.minSchoolSize}+`);
    }
  });

  const needsPlants = fish.some(f => f.needsPlants);
  const needsHiding = fish.some(f => f.needsHidingSpaces);

  if (needsPlants) {
    suggestions.push('Add live or silk plants for fish that prefer planted environments');
  }
  if (needsHiding) {
    suggestions.push('Provide caves, driftwood, or decorations for hiding spaces');
  }

  return {
    overallStatus,
    results,
    tankSizeWarning,
    suggestions,
  };
};

// Get suggested compatible fish
export const getSuggestedCompatibleFish = (currentFishIds: string[], allFish: Fish[]): Fish[] => {
  const currentFish = currentFishIds.map(id => getFishById(id)).filter((f): f is Fish => f !== undefined);

  if (currentFish.length === 0) return allFish.filter(f => f.careLevel === 'beginner');

  const waterType = currentFish[0].waterType;

  return allFish.filter(potentialFish => {
    // Must be same water type
    if (potentialFish.waterType !== waterType) return false;

    // Not already in tank
    if (currentFishIds.includes(potentialFish.id)) return false;

    // Check compatibility with all current fish
    const isCompatible = currentFish.every(current => {
      const result = checkTwoFishCompatibility(current, potentialFish);
      return result.status !== 'incompatible';
    });

    return isCompatible;
  });
};
