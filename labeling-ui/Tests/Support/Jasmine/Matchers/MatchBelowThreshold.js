module.exports = function toMatchBelowThreshold() {
  return {
    compare: function compare(diffData, threshold = 0.01) {
      return {
        pass: diffData.isSameDimensions && parseFloat(diffData.misMatchPercentage) <= threshold,
        message: `Images do not match: Mismatch percentage: ${diffData.misMatchPercentage}`,
        actual: diffData,
      };
    },
  };
};
