// src/lib/emotionProgressions.ts

export const EMOTION_PROGRESSIONS: Record<string, string[]> = {
  // High arousal, negative → reduce arousal to low arousal, positive
  anxious: ["calm", "grounded", "peaceful"],
  worried: ["calm", "accepting", "peaceful"],
  stressed: ["relaxed", "calm", "peaceful"],

  // High arousal, negative → reduce arousal OR shift valence
  angry: ["calm", "accepting", "peaceful"],
  frustrated: ["patient", "calm", "accepting"],
  irritated: ["calm", "patient", "accepting"],

  // Low arousal, negative → shift valence to positive
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

// In lib/emotionProgressions.ts
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
  }
  // ... add all emotions you use
};

export function getEmotionDisplay(emotionId: string) {
  return (
    EMOTION_DISPLAY[emotionId] || {
      label: emotionId,
      description: "Finding balance",
      emoji: "✨",
      color: "bg-purple-600"
    }
  );
}
