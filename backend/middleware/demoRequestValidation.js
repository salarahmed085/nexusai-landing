const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const INTERESTS = ['Product Demo', 'Enterprise Plan', 'Partnership', 'Integration Support', 'Other'];

export const validateDemoRequest = (req, res, next) => {
  const { fullName, email, company, companySize, preferredDate, interest, message } = req.body;
  const errors = {};

  if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) {
    errors.fullName = 'Full name must be between 2 and 100 characters.';
  }

  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!company || company.trim().length < 2 || company.trim().length > 150) {
    errors.company = 'Company name must be between 2 and 150 characters.';
  }

  if (!companySize || !COMPANY_SIZES.includes(companySize)) {
    errors.companySize = `Company size must be one of: ${COMPANY_SIZES.join(', ')}.`;
  }

  if (!preferredDate || isNaN(Date.parse(preferredDate))) {
    errors.preferredDate = 'A valid preferred date is required.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(preferredDate);
    if (chosen < today) {
      errors.preferredDate = 'Preferred date cannot be in the past.';
    }
  }

  if (!interest || !INTERESTS.includes(interest)) {
    errors.interest = `Area of interest must be one of: ${INTERESTS.join(', ')}.`;
  }

  if (!message || message.trim().length < 10 || message.trim().length > 1000) {
    errors.message = 'Message must be between 10 and 1000 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
