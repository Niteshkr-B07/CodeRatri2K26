/**
 * SafeTrip Explainable Route & Area Safety Scoring Engine
 * Deterministic, transparent, and non-alarmist.
 */

import { SafetyScoreData, SafetyFactor, SafetyReport, GeoPoint } from '../types';
import { ASSISTANCE_POINTS } from './storage';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeSafetyScore(
  origin: GeoPoint,
  destination: GeoPoint,
  reports: SafetyReport[],
  simulatedHour?: number
): SafetyScoreData {
  const factors: SafetyFactor[] = [];
  let score = 85;

  const currentHour = simulatedHour !== undefined ? simulatedHour : new Date().getHours();
  const isNightTime = currentHour >= 20 || currentHour < 6;

  // 1. Time of Day & Visibility
  if (isNightTime) {
    score -= 15;
    factors.push({
      id: 'time-night',
      title: 'Nighttime Visibility',
      impact: -15,
      status: 'warning',
      description: 'Traveling during low-visibility hours (8:00 PM – 5:30 AM). Active Trip Guardian check-in recommended.',
    });
  } else {
    score += 10;
    factors.push({
      id: 'time-day',
      title: 'Daylight & Natural Visibility',
      impact: +10,
      status: 'positive',
      description: 'Active commercial hours with natural daylight and standard transit frequency.',
    });
  }

  // 2. Verified Community Reports along corridor (within 3km of origin or destination)
  const nearbyReports = reports.filter((r) => {
    const distToOrigin = calculateDistanceKm(origin.lat, origin.lng, r.location.lat, r.location.lng);
    const distToDest = calculateDistanceKm(destination.lat, destination.lng, r.location.lat, r.location.lng);
    return distToOrigin <= 3.0 || distToDest <= 3.0;
  });

  let reportPenaltyTotal = 0;
  nearbyReports.forEach((rep) => {
    let penalty = 0;
    if (rep.severity === 'high') penalty = 20;
    else if (rep.severity === 'medium') penalty = 10;
    else penalty = 5;

    // Recency decay: if older than 24 hours, cut impact by 40%
    const ageHours = (Date.now() - rep.createdAt) / (1000 * 60 * 60);
    if (ageHours > 24) {
      penalty = Math.round(penalty * 0.6);
    }

    reportPenaltyTotal += penalty;
  });

  if (nearbyReports.length > 0) {
    const clampedPenalty = Math.min(reportPenaltyTotal, 40);
    score -= clampedPenalty;

    const highSeverityCount = nearbyReports.filter((r) => r.severity === 'high').length;
    const lightingIssues = nearbyReports.filter((r) => r.category === 'poor_lighting').length;

    let desc = `${nearbyReports.length} verified community report(s) noted along this transit corridor.`;
    if (lightingIssues > 0) desc += ` Includes ${lightingIssues} note(s) regarding unlit stretches.`;
    if (highSeverityCount > 0) desc += ` ${highSeverityCount} elevated caution report(s).`;

    factors.push({
      id: 'hazards-nearby',
      title: 'Community Hazard Reports',
      impact: -clampedPenalty,
      status: clampedPenalty > 20 ? 'negative' : 'warning',
      description: desc,
    });
  } else {
    factors.push({
      id: 'hazards-none',
      title: 'No Active Corridor Concerns',
      impact: 0,
      status: 'positive',
      description: 'Zero recent hazard reports or infrastructure complaints filed on this segment.',
    });
  }

  // 3. Proximity to Emergency Assistance Points (Police, 24h Hospitals, Transit Hubs)
  const nearbyAssistance = ASSISTANCE_POINTS.filter((pt) => {
    const dist = calculateDistanceKm(origin.lat, origin.lng, pt.lat, pt.lng);
    return dist <= 2.5;
  });

  if (nearbyAssistance.length > 0) {
    score += 10;
    factors.push({
      id: 'assistance-proximity',
      title: 'Emergency Services Accessible',
      impact: +10,
      status: 'positive',
      description: `Emergency support within 2.5km (${nearbyAssistance.map((p) => p.name).slice(0, 2).join(', ')}).`,
    });
  } else {
    factors.push({
      id: 'assistance-sparse',
      title: 'Assistance Hub Distance',
      impact: 0,
      status: 'warning',
      description: 'Nearest verified police or 24/7 medical station is over 2.5km away.',
    });
  }

  // Clamp score between 15 and 98 (Never 100% to uphold non-negotiable rule #1: No false promises)
  const finalScore = Math.min(98, Math.max(15, score));

  // Determine rating label
  let ratingLabel: SafetyScoreData['ratingLabel'] = 'Low Concerns';
  if (finalScore < 60) {
    ratingLabel = 'Elevated Caution';
  } else if (finalScore < 80) {
    ratingLabel = 'Moderate Concerns';
  }

  // Determine confidence based on community data volume
  let confidence: SafetyScoreData['confidence'] = 'Low';
  if (nearbyReports.length >= 4) {
    confidence = 'High';
  } else if (nearbyReports.length >= 2) {
    confidence = 'Medium';
  }

  return {
    score: finalScore,
    ratingLabel,
    confidence,
    factors,
    disclaimer: 'Advisory only. Not a prediction of crime or danger. Always trust your surroundings.',
    policeStationsNearby: nearbyAssistance.filter((a) => a.type === 'police').length,
    verifiedHazardsCount: nearbyReports.length,
    isNightTime,
  };
}
