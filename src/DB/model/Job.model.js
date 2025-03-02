import mongoose, { Schema, Types, model } from "mongoose";
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from "../../utils/types/data.types.js";


const jobOpportunitySchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    jobLocation: {
      type: String,
      required: true,
      enum: Object.values(jobLocationTypes),
    },
    workingTime: {
      type: String,
      required: true,
      enum: Object.values(workingTimeTypes),
    },
    seniorityLevel: {
      type: String,
      required: true,
      enum: Object.values(seniorityLevelTypes),
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    technicalSkills: {
      type: [String],
      required: true,
      validate: {
        validator: function (skills) {
          return skills.length > 0;
        },
        message: "At least one technical skill is required.",
      },
    },
    softSkills: {
      type: [String],
      required: true,
      validate: {
        validator: function (skills) {
          return skills.length > 0;
        },
        message: "At least one soft skill is required.",
      },
    },
    addedBy: {
      type: Types.ObjectId,
      ref: "User", 
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User", 
    },
    closed: {
      type: Boolean,
      default: false, 
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company", 
      required: true,
    },
  },
  { timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true} } 
);


jobOpportunitySchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId"
})

export const jobOpportunityModel =
  mongoose.models.JobOpportunity || model("JobOpportunity", jobOpportunitySchema);