const originalToLocaleString = Number.prototype.toLocaleString;

Number.prototype.toLocaleString = function (locales, options) {
  // Call the original method with the 'en-US' locale
  // which uses a comma as the thousands separator
  // and dots for decimals
  const result = originalToLocaleString.call(this, "en-US", options);
  // Replace comma with space for thousands separator
  return result.replace(/,/g, " ");
};
