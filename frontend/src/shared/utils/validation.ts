export function validatePassword(value: string): string | null {
  if (value.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(value)) return "Password must contain at least one digit.";
  if (!/[\W_]/.test(value)) return "Password must contain at least one special character.";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Email is required";
  const emailRegex = /^[^@]+@[^@]+\.[^@]{2,}$/;
  if (!emailRegex.test(value.trim())) return "Enter a valid email";
  return null;
}


