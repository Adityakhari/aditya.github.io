export const normalizeName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const isSamePerson = (first, second) => {
  const normalizedFirst = normalizeName(first);
  const normalizedSecond = normalizeName(second);
  return normalizedFirst.length > 0 && normalizedFirst === normalizedSecond;
};

export const getDisplayName = (name) =>
  isSamePerson(name, "Aditya") ? "Aadi" : String(name ?? "");
