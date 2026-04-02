export const useRole = () => localStorage.getItem("role");

export const isAtLeast = (role, minimum) => {
  const levels = ["Low", "Mid", "High", "Admin"];
  return levels.indexOf(role) >= levels.indexOf(minimum);
};
