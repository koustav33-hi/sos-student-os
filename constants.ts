
export const BLUNT_MESSAGES = [
  "Focus on the work at hand.",
  "Discipline is a quiet choice.",
  "Eliminate noise. Cultivate silence.",
  "The timer represents your time.",
  "Consistency is the only metric.",
  "Clarity follows the work.",
  "Quiet confidence is the goal.",
  "Minimize distraction. Maximize intent."
];

export const DOPAMINE_CATEGORIES = [
  "Short Reels/TikTok",
  "Porn/Adult Content",
  "Junk Food/Binge",
  "Gaming (Brainless)",
  "Endless Scrolling"
];

export const PENALTIES = [
  "50 Pushups immediately",
  "Cold shower (3 minutes)",
  "No phone for 12 hours",
  "Donate $10 to a charity you hate",
  "Run 3 miles"
];

export const CHOOSE_PHRASE = () => BLUNT_MESSAGES[Math.floor(Math.random() * BLUNT_MESSAGES.length)];

export const getCoachGreeting = (streak: number, taskCompletion: number, relapses: number) => {
  if (streak === 0) return "Return to zero. Begin again.";
  if (relapses > 0) return "System compromise detected. Regain control.";
  if (taskCompletion === 100) return `${streak} days of consistency. Maintain the state.`;
  return `${streak}-day streak. Proceed with intent.`;
};

export const ADMIN_CREDENTIALS = {
  username: 'sos_admin',
  code: 'AX9-OMEGA-47'
};