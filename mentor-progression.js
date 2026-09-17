(function (root) {
  "use strict";
  const thresholds = [0, 100, 150, 220, 320];
  const specialties = ["観察と気づき", "背景と根拠", "構造と関係", "分野をつなぐ", "実践と改善"];
  function level(value) { return Math.max(1, Math.min(5, Math.floor(Number(value) || 1))); }
  function normalize(value = {}) {
    const met = Array.isArray(value?.met) ? value.met.filter((item) => item && typeof item.eventId === "string" && item.eventId && item.metAt).map((item) => ({ eventId: item.eventId, name: String(item.name || "師匠"), level: level(item.level), metAt: String(item.metAt) })) : [];
    return { unlockedAt: String(value?.unlockedAt || met[0]?.metAt || ""), selectedEventId: met.some((item) => item.eventId === value?.selectedEventId) ? value.selectedEventId : "", met };
  }
  function playerLevel(quest) { return thresholds.reduce((result, threshold, index) => Number(quest) >= threshold ? index + 1 : result, 1); }
  function meet(value, character, eventId, quest, at) {
    const progress = normalize(value);
    if (!character || character.mentorEnabled === false || level(character.mentorLevel) > playerLevel(quest) || progress.met.some((item) => item.eventId === eventId)) return { progress, changed: false };
    progress.met.push({ eventId, name: character.name, level: level(character.mentorLevel), metAt: at });
    progress.unlockedAt ||= at;
    return { progress, changed: true };
  }
  root.MentorProgression = { thresholds, specialties, level, normalize, playerLevel, meet };
})(globalThis);
