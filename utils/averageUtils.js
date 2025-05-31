// utils/averageUtils.js

// Calculate average blood pressure (returns string format "systolic/diastolic")
export const calculateAverageBloodPressure = (patients) => {
  let totalSystolic = 0;
  let totalDiastolic = 0;
  let count = 0;

  patients.forEach(patient => {
    const bp = patient.medicalInfo?.bloodPressure;
    if (bp && typeof bp === 'string') {
      const [systolic, diastolic] = bp.split('/').map(Number);
      if (!isNaN(systolic)) totalSystolic += systolic;
      if (!isNaN(diastolic)) totalDiastolic += diastolic;
      count++;
    }
  });

  if (count === 0) return 'N/A';
  
  const avgSystolic = Math.round(totalSystolic / count);
  const avgDiastolic = Math.round(totalDiastolic / count);
  return `${avgSystolic}/${avgDiastolic}`;
};

// Calculate average BMI
export const calculateAverageBmi = (patients) => {
  const validPatients = patients.filter(p => 
    p.medicalInfo?.bmi && typeof p.medicalInfo.bmi === 'number'
  );
  
  if (validPatients.length === 0) return 'N/A';
  
  const total = validPatients.reduce(
    (sum, patient) => sum + patient.medicalInfo.bmi, 0
  );
  return (total / validPatients.length).toFixed(1);
};

// Calculate average HbA1c
export const calculateAverageHba1c = (patients) => {
  const validPatients = patients.filter(p => 
    p.medicalInfo?.hba1c && typeof p.medicalInfo.hba1c === 'number'
  );
  
  if (validPatients.length === 0) return 'N/A';
  
  const total = validPatients.reduce(
    (sum, patient) => sum + patient.medicalInfo.hba1c, 0
  );
  return (total / validPatients.length).toFixed(1);
};

// Calculate average cholesterol
export const calculateAverageCholesterol = (patients) => {
  const validPatients = patients.filter(p => 
    p.medicalInfo?.cholesterol && typeof p.medicalInfo.cholesterol === 'number'
  );
  
  if (validPatients.length === 0) return 'N/A';
  
  const total = validPatients.reduce(
    (sum, patient) => sum + patient.medicalInfo.cholesterol, 0
  );
  return Math.round(total / validPatients.length);
};

// Calculate average glucose
export const calculateAverageGlucose = (patients) => {
  const validPatients = patients.filter(p => 
    p.medicalInfo?.glucoseLevel && typeof p.medicalInfo.glucoseLevel === 'number'
  );
  
  if (validPatients.length === 0) return 'N/A';
  
  const total = validPatients.reduce(
    (sum, patient) => sum + patient.medicalInfo.glucoseLevel, 0
  );
  return (total / validPatients.length).toFixed(1);
};