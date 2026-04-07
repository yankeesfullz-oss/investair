const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const PASSWORD_REQUIREMENTS_TEXT = 'Use at least 8 characters with uppercase, lowercase, a number, and a special character.';

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email || '').trim());
}

export function isStrongPassword(password) {
  return STRONG_PASSWORD_REGEX.test(String(password || ''));
}

export function validateInvestorLoginForm(values) {
  const errors = {};

  if (!String(values.email || '').trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!String(values.password || '')) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateInvestorSignupForm(values) {
  const errors = validateInvestorLoginForm(values);

  if (!String(values.fullName || '').trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!String(values.password || '')) {
    errors.password = 'Password is required.';
  } else if (!isStrongPassword(values.password)) {
    errors.password = PASSWORD_REQUIREMENTS_TEXT;
  }

  if (!String(values.confirmPassword || '')) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}