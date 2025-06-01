export const calculateBMI = (height, weight) => {
  const h = parseFloat(height);
  const w = parseFloat(weight);

  if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
    return null; // Invalid input
  }

  const bmi = w / ((h / 100) ** 2);
  return parseFloat(bmi.toFixed(1)); // Round to 1 decimal
};
