export const getInitials = (name: string) => {
  if (!name) return "";

  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
};
