export const EMOTION_PROGRESSIONS: Record<string, string[]> = {
  // High frequency, negative → reduce arousal to low arousal, positive
  anxious: ["calm", "grounded", "peaceful"],
  worried: ["calm", "accepting", "peaceful"],
  stressed: ["relaxed", "calm", "peaceful"],

  // High frequency, negative → reduce intensity OR shift valence
  angry: ["calm", "accepting", "peaceful"],
  frustrated: ["patient", "calm", "accepting"],
  irritated: ["calm", "patient", "accepting"],

  // Low frequency, negative → shift valence to positive
  sad: ["accepting", "content", "peaceful"],
  depressed: ["accepting", "hopeful", "calm"],
  lonely: ["connected", "accepting", "peaceful"],

  // Mid-range states can move multiple directions
  bored: ["curious", "interested", "content"],
  confused: ["clear", "focused", "understanding"],
  tired: ["rested", "peaceful", "calm"],

  // Already positive states
  content: ["grateful", "joyful", "energized"],
  calm: ["peaceful", "grateful", "content"],
  happy: ["joyful", "grateful", "energized"]
};

export function getTargetEmotions(currentEmotion: string | null): string[] {
  if (!currentEmotion) return ["calm", "peaceful", "content"];
  return (
    EMOTION_PROGRESSIONS[currentEmotion.toLowerCase()] || [
      "calm",
      "peaceful",
      "content"
    ]
  );
}

export const EMOTION_DISPLAY: Record<
  string,
  {
    label: string;
    description: string;
    emoji: string;
    color: string;
  }
> = {
  calm: {
    label: "Calm",
    description: "Peace and serenity",
    emoji: "🌿",
    color: "bg-teal-600"
  },
  peaceful: {
    label: "Peaceful",
    description: "Inner stillness",
    emoji: "☮️",
    color: "bg-blue-600"
  },
  content: {
    label: "Content",
    description: "Gentle satisfaction",
    emoji: "😊",
    color: "bg-orange-600"
  },
  accepting: {
    label: "Accepting",
    description: "Allowing what is",
    emoji: "🤲",
    color: "bg-amber-600"
  },
  patient: {
    label: "Patient",
    description: "Steady and calm",
    emoji: "🐢",
    color: "bg-yellow-600"
  },
  grounded: {
    label: "Grounded",
    description: "Centered and stable",
    emoji: "🌱",
    color: "bg-green-700"
  },
  hopeful: {
    label: "Hopeful",
    description: "Looking forward",
    emoji: "🌈",
    color: "bg-sky-500"
  },
  connected: {
    label: "Connected",
    description: "In touch with others",
    emoji: "🤝",
    color: "bg-rose-500"
  },
  curious: {
    label: "Curious",
    description: "Open to discovery",
    emoji: "🪶",
    color: "bg-indigo-500"
  },
  joyful: {
    label: "Joyful",
    description: "Light and radiant",
    emoji: "☀️",
    color: "bg-yellow-400"
  },
  energized: {
    label: "Energized",
    description: "Alive and vibrant",
    emoji: "⚡",
    color: "bg-lime-500"
  },
  relaxed: {
    label: "Relaxed",
    description: "Ease and comfort",
    emoji: "😌",
    color: "bg-cyan-600"
  }
};

export function getEmotionDisplay(targetEmotion: string) {
  return (
    EMOTION_DISPLAY[targetEmotion] || {
      label: targetEmotion,
      description: "Finding balance",
      emoji: "✨",
      color: "bg-purple-600"
    }
  );
}
