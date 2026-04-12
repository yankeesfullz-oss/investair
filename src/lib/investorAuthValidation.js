const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const MAX_EMAIL_LENGTH = 320;
const MAX_EMAIL_LOCAL_LENGTH = 64;
const MAX_EMAIL_DOMAIN_LENGTH = 255;
const DOMAIN_LABEL_REGEX = /^[A-Za-z0-9-]+$/;
const LOCAL_PART_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;

export const PASSWORD_REQUIREMENTS_TEXT = 'Use at least 8 characters with uppercase, lowercase, a number, and a special character.';

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || normalizedEmail.length > MAX_EMAIL_LENGTH || /\s/.test(normalizedEmail)) {
    return false;
  }

  const emailParts = normalizedEmail.split('@');
  if (emailParts.length !== 2) {
    return false;
  }

  const [localPart, domain] = emailParts;
  if (!localPart || !domain || localPart.length > MAX_EMAIL_LOCAL_LENGTH || domain.length > MAX_EMAIL_DOMAIN_LENGTH) {
    return false;
  }

  if (
    localPart.startsWith('.')
    || localPart.endsWith('.')
    || domain.startsWith('.')
    || domain.endsWith('.')
    || localPart.includes('..')
    || domain.includes('..')
  ) {
    return false;
  }

  if (!LOCAL_PART_REGEX.test(localPart)) {
    return false;
  }

  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) {
    return false;
  }

  if (!domainLabels.every((label) => label && label.length <= 63 && DOMAIN_LABEL_REGEX.test(label) && !label.startsWith('-') && !label.endsWith('-'))) {
    return false;
  }

  const topLevelDomain = domainLabels[domainLabels.length - 1];
  return /^[A-Za-z]{2,24}$/.test(topLevelDomain);
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