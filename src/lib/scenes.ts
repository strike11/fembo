export const SCENE_IDS = ["default", "night", "rain", "tea", "walk", "couch"] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export type SceneDef = {
  id: SceneId;
  label: string;
  hint: string;
  prompt: string;
};

export const SCENES: SceneDef[] = [
  {
    id: "default",
    label: "Room",
    hint: "The usual soft light",
    prompt: "You are in a quiet cozy room together.",
  },
  {
    id: "night",
    label: "Night",
    hint: "Lamps low, unhurried",
    prompt: "It is late at night. Keep your voice softer and slower. The room is dim and peaceful.",
  },
  {
    id: "rain",
    label: "Rain",
    hint: "Window, weather, stay in",
    prompt: "Rain is on the window. Stay close, unhurried, a little cozy about the weather.",
  },
  {
    id: "tea",
    label: "Tea",
    hint: "Warm cups and check-ins",
    prompt: "You are sharing tea. Be gentle, curious, and present. Small details matter.",
  },
  {
    id: "walk",
    label: "Walk",
    hint: "Outside, side by side",
    prompt: "You are walking together in the evening. Talk like you are side by side, noticing the street.",
  },
  {
    id: "couch",
    label: "Couch",
    hint: "Blankets and soft talk",
    prompt: "You are curled up on the couch together. Blankets, quiet music, gentle check-ins.",
  },
];

export function sceneById(id: string | null | undefined): SceneDef {
  return SCENES.find((scene) => scene.id === id) ?? SCENES[0]!;
}
