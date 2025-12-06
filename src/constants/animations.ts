const ANIMATION_NAMES = ["float-1", "float-2", "float-3", "float-4"] as const;

export function randomAnimationName() {
  return ANIMATION_NAMES[Math.floor(Math.random() * ANIMATION_NAMES.length)];
}
