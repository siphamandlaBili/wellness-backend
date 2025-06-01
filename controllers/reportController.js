import { Report } from "../models/reportModel.js";
import { Event } from "../models/eventModel.js";
import { PatientFile } from "../models/patientFileModel.js";
import mongoose from "mongoose";
import OpenAI from "openai";
// controllers/reportController.js
import { 
  calculateBmiStats,
  calculateHba1cStats,
  calculateCholesterolStats,
  calculateHivStats,
  calculateGlucoseStats,
  calculateSexStats,
  calculateAgeStats,
} from "../utils/reportUtils.js";
import { calculateAverageBmi,calculateAverageBloodPressure,calculateAverageHba1c,calculateAverageCholesterol,calculateAverageGlucose } from "../utils/averageUtils.js";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate AI opinion for an event
export const generateEventOpinion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { nurseId } = req.body;

    // Verify event assignment
    const event = await Event.findById(eventId);
    if (!event || event.assignedNurse.toString() !== nurseId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to generate report for this event",
      });
    }

    // Get all patients for the event
    const patients = await PatientFile.find({ event: eventId });

    // Calculate statistics
    const stats = {
  patientCount: patients.length,
  averageBloodPressure: calculateAverageBloodPressure(patients),
  averageBmi: calculateAverageBmi(patients),
  averageHba1c: calculateAverageHba1c(patients),
  averageCholesterol: calculateAverageCholesterol(patients),
  averageGlucose: calculateAverageGlucose(patients),
  bmiStats: calculateBmiStats(patients),
  hba1cStats: calculateHba1cStats(patients),
  cholesterolStats: calculateCholesterolStats(patients),
  hivStats: calculateHivStats(patients),
  glucoseStats: calculateGlucoseStats(patients),
  sexStats: calculateSexStats(patients),
  ageStats: calculateAgeStats(patients)
};

    // Generate AI opinion
    const prompt = `
  You are a medical professional analyzing health screening data from a corporate wellness event.
  Here are the key statistics:
  - Number of participants: ${stats.patientCount}
  - Average Blood Pressure: ${stats.averageBloodPressure}
  - Average BMI: ${stats.averageBmi}
  - Average HbA1c: ${stats.averageHba1c}%
  - Average Cholesterol: ${stats.averageCholesterol} mg/dL
  - Average Glucose: ${stats.averageGlucose} mmol/L
  
  Health Risk Distribution:
  - BMI: ${stats.bmiStats.underweight} underweight, ${stats.bmiStats.normal} normal, ${stats.bmiStats.overweight} overweight, ${stats.bmiStats.obese} obese
  - HbA1c: ${stats.hba1cStats.normal} normal, ${stats.hba1cStats.prediabetes} prediabetic, ${stats.hba1cStats.diabetes} diabetic
  - Cholesterol: ${stats.cholesterolStats.normal} normal, ${stats.cholesterolStats.borderline} borderline, ${stats.cholesterolStats.high} high
  
  Provide a professional medical opinion summarizing the overall health status of participants,
  highlighting key concerns, and recommending follow-up actions for the organization.
  Focus on actionable insights and maintain a professional tone.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.7,
    });

    const generatedOpinion = completion.choices[0].message.content;

    // Create or update report
    const report = await Report.findOneAndUpdate(
      { event: eventId, nurse: nurseId },
      {
        generatedOpinion,
        status: "draft",
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Save edited opinion
export const saveEventOpinion = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { editedOpinion } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Verify ownership
    if (report.nurse.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this report",
      });
    }

    report.editedOpinion = editedOpinion;
    report.status = "finalized";
    await report.save();

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get report for an event
export const getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    const nurseId = req.user._id;

    const report = await Report.findOne({ event: eventId, nurse: nurseId })
      .populate("event", "eventName eventDate")
      .populate("nurse", "fullName");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get statistics for graphs
export const getEventStatistics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const nurseId = req.user._id;

    // Validate eventId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Verify event assignment
    if (!event.assignedNurse || event.assignedNurse.toString() !== nurseId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view statistics for this event"
      });
    }

    // Get all patients for the event
    const patients = await PatientFile.find({ event: eventId });

    // Calculate statistics
    const stats = {
      patientCount: patients.length,
      averageBloodPressure: calculateAverageBloodPressure(patients),
      averageBmi: calculateAverageBmi(patients),
      averageHba1c: calculateAverageHba1c(patients),
      averageCholesterol: calculateAverageCholesterol(patients),
      averageGlucose: calculateAverageGlucose(patients),
      // bloodPressure: calculateBloodPressureStats(patients),
      bmi: calculateBmiStats(patients),
      hba1c: calculateHba1cStats(patients),
      cholesterol: calculateCholesterolStats(patients),
      hiv: calculateHivStats(patients),
      glucose: calculateGlucoseStats(patients),
      sex: calculateSexStats(patients),
      age: calculateAgeStats(patients)
    };

    res.status(200).json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server errors"
    });
  }
};