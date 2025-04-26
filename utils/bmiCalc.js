export const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    return Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;
  };