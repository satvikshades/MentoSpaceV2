// Small helpers for showing people (avatars, mentor areas).

export function avatarUrl(person) {
  if (person?.profilePic) return person.profilePic;
  const name = encodeURIComponent(person?.name || "M");
  return `https://ui-avatars.com/api/?name=${name}&background=eef0ff&color=4a54ff&bold=true&format=svg`;
}

export const EXPERTISE_LABELS = {
  personal: "Personal growth",
  spiritual: "Spiritual growth",
  career: "Career & business",
  educational: "Studies & exams",
};

export function expertiseList(value) {
  const arr = Array.isArray(value) ? value : value ? [value] : [];
  return arr.filter(Boolean).map((v) => ({ key: v, label: EXPERTISE_LABELS[v] || v }));
}
