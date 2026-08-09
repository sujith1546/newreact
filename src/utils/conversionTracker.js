import { logAuditEvent } from '../lib/auditLogger';

const SCORE_KEY = 'pcms_recruiter_intent_score_v1';
const HISTORY_KEY = 'pcms_recruiter_intent_history_v1';

const POINT_VALUES = {
  resume_view: 25,
  email_copy: 30,
  project_demo: 20,
  case_study_dwell: 15,
  contact_submit: 50,
  github_click: 15,
};

export function getRecruiterScore() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch (_) {
    return 0;
  }
}

export function getRecruiterIntentHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function trackRecruiterIntent(actionName, details = '') {
  const points = POINT_VALUES[actionName] || 10;
  const currentScore = getRecruiterScore();
  const newScore = currentScore + points;

  try {
    localStorage.setItem(SCORE_KEY, String(newScore));

    const history = getRecruiterIntentHistory();
    const entry = {
      id: Date.now() + Math.random(),
      action: actionName,
      points,
      details,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...history.slice(0, 49)]));
  } catch (_) {}

  // Log to audit Logger & dispatch custom event
  try {
    logAuditEvent('RECRUITER_INTENT', {
      action: actionName,
      points,
      details,
      totalScore: newScore,
    });
  } catch (_) {}

  window.dispatchEvent(new CustomEvent('pcms_intent_event', {
    detail: { actionName, points, totalScore: newScore, details }
  }));
}
