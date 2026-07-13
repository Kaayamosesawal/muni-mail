/**
 * Input & Logic Validation
 */

// Ensures the email is a valid Muni University email
export const isValidMuniEmail = (email) => {
  const muniRegex = /^[a-zA-Z0-9._%+-]+@muni\.ac\.ug$/;
  return muniRegex.test(email);
};

// Password strength check
export const isStrongPassword = (password) => {
  return password.length >= 8;
};

// Validate election eligibility
// Only students who are active club members can vote
export const canUserVote = (userProfile, clubMembershipStatus) => {
  if (!userProfile || userProfile.role !== 'Student') return false;
  return clubMembershipStatus === true;
};

// Clean text inputs (prevent basic XSS)
export const sanitizeInput = (text) => {
  return text.trim().replace(/[<>]/g, "");
};