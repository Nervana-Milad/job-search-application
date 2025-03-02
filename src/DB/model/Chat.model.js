import mongoose, { Schema, Types, model } from "mongoose";
import * as dbService from "db.service.js";
const chatSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User", 
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User", 
      required: true,
    },
    messages: [
      {
        message: {
          type: String,
          required: true,
          trim: true,
          minlength: 1,
          maxlength: 1000,
        },
        senderId: {
          type: Types.ObjectId,
          ref: "User", 
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, 
        },
      },
    ],
  },
  { timestamps: true }
);

export const chatModel = mongoose.models.Chat || model("Chat", chatSchema);