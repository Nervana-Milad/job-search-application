import mongoose, { Schema, Types, model } from "mongoose";
import { statusTypes } from "../../utils/types/data.types.js";

const applicationSchema = new Schema(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "JobOpportunity", 
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCV: {
      type: {
        secure_url: String , 
        public_id: String,
      },
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(statusTypes), 
      default: statusTypes.pending,
    },
  },
  { timestamps: true }
);



export const applicationModel =
  mongoose.models.Application || model("Application", applicationSchema);