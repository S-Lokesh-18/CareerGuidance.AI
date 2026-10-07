/**
 * Skill Gap Analysis Service
 * Evaluates missing and weak skills for a target career against user skill ratings.
 * No AI is needed for this rule-based analysis.
 */
export function analyzeSkillGap(career, userSkills = {}) {
  const requiredSkills = Array.isArray(career.required_skills)
    ? career.required_skills
    : JSON.parse(career.required_skills || '[]');

  const detailedGaps = [];
  const missingSkills = [];
  const weakSkills = [];
  const proficientSkills = [];

  let totalPossibleWeight = 0;
  let userEarnedWeight = 0;

  requiredSkills.forEach((item) => {
    const skillName = item.skill;
    const requiredWeight = Number(item.weight) || 3;
    totalPossibleWeight += requiredWeight * 5;

    // Find user rating
    let userLevel = 0;
    const reqLower = skillName.toLowerCase();

    for (const [sKey, rating] of Object.entries(userSkills)) {
      const lower = sKey.toLowerCase();
      if (lower === reqLower || lower.includes(reqLower) || reqLower.includes(lower)) {
        userLevel = Math.max(userLevel, Number(rating) || 0);
      }
    }

    userEarnedWeight += requiredWeight * userLevel;

    const gap = Math.max(0, requiredWeight - userLevel);
    const gapInfo = {
      skill: skillName,
      weight: requiredWeight,
      userLevel,
      requiredLevel: requiredWeight,
      gap,
    };

    detailedGaps.push(gapInfo);

    if (userLevel === 0) {
      missingSkills.push(gapInfo);
    } else if (userLevel < requiredWeight) {
      weakSkills.push(gapInfo);
    } else {
      proficientSkills.push(gapInfo);
    }
  });

  // Rank missing and weak skills by priority (weight descending, then gap descending)
  missingSkills.sort((a, b) => b.weight - a.weight || b.gap - a.gap);
  weakSkills.sort((a, b) => b.weight - a.weight || b.gap - a.gap);

  // Overall readiness percentage
  const readinessPercentage = totalPossibleWeight > 0
    ? Math.round((userEarnedWeight / totalPossibleWeight) * 100)
    : 0;

  // Chart data format ready for Recharts (BarChart & RadarChart)
  const chartData = detailedGaps.map((g) => ({
    skill: g.skill,
    required: g.requiredLevel,
    current: g.userLevel,
    gap: g.gap,
    fullMark: 5,
  }));

  return {
    careerId: career.id,
    careerTitle: career.title,
    readinessPercentage,
    totalSkillsCount: requiredSkills.length,
    missingSkills,
    weakSkills,
    proficientSkills,
    chartData,
  };
}

export default {
  analyzeSkillGap,
};
