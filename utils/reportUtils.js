// utils/reportUtils.js

// Calculate BMI categories
export const calculateBmiStats = (patients) => {
  const stats = {
    underweight: 0,
    normal: 0,
    overweight: 0,
    obese: 0
  };

  patients.forEach(patient => {
    const bmi = patient.medicalInfo?.bmi;
    if (typeof bmi !== 'number') return;
    
    if (bmi < 18.5) stats.underweight++;
    else if (bmi < 25) stats.normal++;
    else if (bmi < 30) stats.overweight++;
    else stats.obese++;
  });

  return stats;
};

// Calculate HbA1c categories
export const calculateHba1cStats = (patients) => {
  const stats = {
    normal: 0,
    prediabetes: 0,
    diabetes: 0
  };

  patients.forEach(patient => {
    const hba1c = patient.medicalInfo?.hba1c;
    if (typeof hba1c !== 'number') return;
    
    if (hba1c < 5.7) stats.normal++;
    else if (hba1c < 6.5) stats.prediabetes++;
    else stats.diabetes++;
  });

  return stats;
};

// Calculate cholesterol categories
export const calculateCholesterolStats = (patients) => {
  const stats = {
    normal: 0,
    borderline: 0,
    high: 0
  };

  patients.forEach(patient => {
    const cholesterol = patient.medicalInfo?.cholesterol;
    if (typeof cholesterol !== 'number') return;
    
    if (cholesterol < 200) stats.normal++;
    else if (cholesterol < 240) stats.borderline++;
    else stats.high++;
  });

  return stats;
};

// Calculate HIV status distribution
export const calculateHivStats = (patients) => {
  const stats = {
    negative: 0,
    positive: 0,
    inconclusive: 0,
    unknown: 0
  };

  patients.forEach(patient => {
    const status = patient.medicalInfo?.hivStatus?.toLowerCase() || 'unknown';
    
    if (status.includes('negative')) stats.negative++;
    else if (status.includes('positive')) stats.positive++;
    else if (status.includes('inconclusive')) stats.inconclusive++;
    else stats.unknown++;
  });

  return stats;
};

// Calculate glucose type distribution
export const calculateGlucoseStats = (patients) => {
  const stats = {
    fasting: 0,
    random: 0,
    postprandial: 0,
    unknown: 0
  };

  patients.forEach(patient => {
    const type = patient.medicalInfo?.glucoseType?.toLowerCase() || 'unknown';
    
    if (type.includes('fast')) stats.fasting++;
    else if (type.includes('random')) stats.random++;
    else if (type.includes('post') || type.includes('meal')) stats.postprandial++;
    else stats.unknown++;
  });

  return stats;
};

// Calculate sex distribution
export const calculateSexStats = (patients) => {
  const stats = {
    male: 0,
    female: 0,
    other: 0,
    unknown: 0
  };

  patients.forEach(patient => {
    const sex = patient.personalInfo?.sex?.toLowerCase() || 'unknown';
    
    if (sex.includes('male')) stats.male++;
    else if (sex.includes('female')) stats.female++;
    else if (sex.includes('other')) stats.other++;
    else stats.unknown++;
  });

  return stats;
};

// Calculate age distribution
export const calculateAgeStats = (patients) => {
  const stats = {
    adults: 0,       // 18-39
    middleAged: 0,   // 40-59
    seniors: 0       // 60+
  };

  const currentYear = new Date().getFullYear();
  
  patients.forEach(patient => {
    const dob = patient.personalInfo?.dateOfBirth;
    if (!dob) return;
    
    const birthYear = new Date(dob).getFullYear();
    const age = currentYear - birthYear;
    
    if (age < 18) return; // Exclude minors
    if (age < 40) stats.adults++;
    else if (age < 60) stats.middleAged++;
    else stats.seniors++;
  });

  return stats;
};