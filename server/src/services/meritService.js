import Scheme from '../models/Scheme.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

/**
 * Compute normalized merit score and detailed breakdown for an application
 */
export const calculateApplicationMeritScore = (application, scheme) => {
  const weights = scheme.meritWeights || { marksPercent: 0.5, entranceScore: 0.3, interviewScore: 0.2 };
  const applicant = application.applicantId;
  const formData = application.formData || {};
  const profile = applicant?.profile || {};

  // Extract raw values
  const marks = Number(formData.marksPercent ?? profile.education?.marksPercent ?? 0);
  const entranceScore = Number(formData.entranceScore ?? formData.gateScore ?? formData.greScore ?? formData.ugcNetScore ?? 0);
  const interviewScore = Number(formData.interviewScore ?? 0);
  const researchScore = Number(formData.researchPapersPublished ? Math.min(formData.researchPapersPublished * 20, 100) : 0);

  // Normalize scores to 0 - 100
  const normMarks = Math.max(0, Math.min(100, marks));
  const normEntrance = Math.max(0, Math.min(100, entranceScore));
  const normInterview = Math.max(0, Math.min(100, interviewScore));
  const normResearch = Math.max(0, Math.min(100, researchScore));

  const breakdown = {};
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const w = Number(weight) || 0;
    totalWeight += w;
    let compValue = 0;
    let label = key;

    if (key === 'marksPercent') {
      compValue = normMarks;
      label = 'Academic Marks';
    } else if (key === 'entranceScore' || key === 'gateScore' || key === 'ugcNetScore') {
      compValue = normEntrance;
      label = 'Entrance / Qualifying Exam';
    } else if (key === 'interviewScore') {
      compValue = normInterview;
      label = 'Interview & Presentation';
    } else if (key === 'researchExperience' || key === 'publications') {
      compValue = normResearch;
      label = 'Research & Publications';
    } else {
      compValue = Number(formData[key] ?? 0);
      label = key.replace(/_/g, ' ');
    }

    const weightedPoints = parseFloat((compValue * w).toFixed(2));
    totalScore += weightedPoints;

    breakdown[key] = {
      label,
      rawScore: compValue,
      weight: w,
      weightedScore: weightedPoints
    };
  }

  // If weights don't sum to 1.0, scale to 100
  if (totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.01) {
    totalScore = (totalScore / totalWeight);
  }

  return {
    meritScore: parseFloat(totalScore.toFixed(2)),
    meritBreakdown: breakdown
  };
};

/**
 * Generate full provisional and waiting merit lists for a scheme with horizontal reservation quotas.
 */
export const generateSchemeMeritList = async (schemeId, { recommendedOnly = false } = {}) => {
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) throw Object.assign(new Error('Scheme not found'), { status: 404 });

  // Preview shows everyone still in the running; publishing uses only officer-recommended applications
  const statuses = recommendedOnly
    ? ['MERIT_LISTED', 'SELECTED', 'WAITLISTED']
    : ['ELIGIBLE', 'UNDER_SCRUTINY', 'MERIT_LISTED', 'SELECTED', 'WAITLISTED'];

  const eligibleApps = await Application.find({
    schemeId,
    status: { $in: statuses }
  }).populate('applicantId');

  if (eligibleApps.length === 0) {
    return {
      scheme,
      totalEligible: 0,
      totalSeats: scheme.totalSeats,
      provisionalList: [],
      waitingList: [],
      unallocatedList: []
    };
  }

  // Calculate scores for all
  const scoredApps = eligibleApps.map(app => {
    const { meritScore, meritBreakdown } = calculateApplicationMeritScore(app, scheme);
    const applicant = app.applicantId;
    const isFemale = applicant?.profile?.gender === 'female';
    const isDisability = Boolean(applicant?.profile?.disability);
    const isPvtg = Boolean(applicant?.profile?.pvtg || app.formData?.isPvtg);

    return {
      application: app,
      applicantId: applicant?._id,
      applicantName: applicant?.name || 'Applicant',
      gender: applicant?.profile?.gender || 'male',
      isFemale,
      isDisability,
      isPvtg,
      state: applicant?.profile?.state || 'Unknown',
      meritScore,
      meritBreakdown,
      currentStatus: app.status
    };
  });

  // Sort strictly by meritScore descending
  scoredApps.sort((a, b) => b.meritScore - a.meritScore);

  // Assign overall merit ranks
  scoredApps.forEach((item, index) => {
    item.meritRank = index + 1;
  });

  const totalSeats = scheme.totalSeats ?? 0;
  const quotas = scheme.reservationQuota || { female: 0.30, disability: 0.04, pvtg: 0.05 };

  const femaleSeatsRequired = Math.floor(totalSeats * (quotas.female ?? 0.30));
  const pwdSeatsRequired = Math.floor(totalSeats * (quotas.disability ?? 0.04));
  const pvtgSeatsRequired = Math.floor(totalSeats * (quotas.pvtg ?? 0.05));

  const selectedSet = new Set();
  const provisionalList = [];

  // 1. First Pass: Pure merit selection up to general capacity
  for (const item of scoredApps) {
    if (provisionalList.length < totalSeats) {
      provisionalList.push({ ...item, selectionCategory: 'Open Merit' });
      selectedSet.add(item.application._id.toString());
    }
  }

  // Meet horizontal quotas through replacements without exceeding the seat count.
  const quotaTargets = [['isFemale', femaleSeatsRequired, 'Female'], ['isDisability', pwdSeatsRequired, 'PwD'], ['isPvtg', pvtgSeatsRequired, 'PVTG']];
  for (const [key, target, label] of quotaTargets) {
    for (const candidate of scoredApps.filter(item => item[key] && !selectedSet.has(String(item.application._id)))) {
      const count = flag => provisionalList.filter(item => item[flag]).length;
      if (count(key) >= target) break;
      if (provisionalList.length >= totalSeats) {
        let replaceAt = -1;
        for (let index = provisionalList.length - 1; index >= 0; index--) {
          const current = provisionalList[index];
          if (current[key]) continue;
          const preservesQuotas = quotaTargets.every(([flag, minimum]) => !current[flag] || candidate[flag] || count(flag) > minimum);
          if (preservesQuotas) { replaceAt = index; break; }
        }
        if (replaceAt < 0) continue;
        const [removed] = provisionalList.splice(replaceAt, 1);
        selectedSet.delete(String(removed.application._id));
      }
      provisionalList.push({ ...candidate, selectionCategory: `Horizontal Quota (${label})` });
      selectedSet.add(String(candidate.application._id));
      provisionalList.sort((a, b) => b.meritScore - a.meritScore);
    }
  }

  // Re-sort provisional list by score
  provisionalList.sort((a, b) => b.meritScore - a.meritScore);

  // 3. Waiting List (Next 50% seats)
  const waitingSize = Math.ceil(totalSeats * 0.5);
  const remainingApps = scoredApps.filter(i => !selectedSet.has(i.application._id.toString()));
  const waitingList = remainingApps.slice(0, waitingSize).map((item, idx) => ({
    ...item,
    waitlistRank: idx + 1,
    selectionCategory: 'Waitlisted'
  }));

  // 4. Unallocated / Remaining
  const unallocatedList = remainingApps.slice(waitingSize);

  return {
    scheme,
    totalEligible: scoredApps.length,
    totalSeats,
    quotaBreakdown: {
      femaleSeats: femaleSeatsRequired,
      pwdSeats: pwdSeatsRequired,
      pvtgSeats: pvtgSeatsRequired,
      femaleSelected: provisionalList.filter(i => i.isFemale).length,
      pwdSelected: provisionalList.filter(i => i.isDisability).length,
      pvtgSelected: provisionalList.filter(i => i.isPvtg).length
    },
    provisionalList,
    waitingList,
    unallocatedList
  };
};
