export function visiblePresetWhere(userId: string) {
  return {
    OR: [{ ownerId: null }, { ownerId: userId, spritesReady: true }],
  };
}

export function canOpenPreset(
  preset: { ownerId: string | null; spritesReady: boolean },
  userId: string,
) {
  if (!preset.ownerId) return true;
  return preset.ownerId === userId && preset.spritesReady;
}
