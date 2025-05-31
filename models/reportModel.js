import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  generatedOpinion: {
    type: String,
    required: true,
  },
  editedOpinion: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["draft", "finalized"],
    default: "draft",
  },
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema);