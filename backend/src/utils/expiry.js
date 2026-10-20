// Document expiry helpers used by alerts and validation.
const DAY = 24 * 60 * 60 * 1000;

exports.daysUntil = (date, from = new Date()) => Math.ceil((new Date(date).getTime() - from.getTime()) / DAY);

exports.severityFor = (days) => {
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'high';
  if (days <= 90) return 'medium';
  return 'ok';
};

// Passport must normally be valid for 6+ months beyond the intended travel/entry date.
exports.sixMonthRule = (expiryDate, travelDate = new Date()) => {
  const need = new Date(travelDate);
  need.setMonth(need.getMonth() + 6);
  return new Date(expiryDate) >= need;
};
