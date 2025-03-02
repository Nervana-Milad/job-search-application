import mongoose, { Schema, Types, model } from "mongoose";
import { generateHash } from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import { genderTypes, otpTypes, providerTypes, roleTypes } from "../../utils/types/data.types.js";


const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: (data)=>{
        return data?.provider === providerTypes.google ? false : true
      }
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    DOB: {
      type: Date,
      required: (data) => {
        return data?.provider === providerTypes.google ? false : true;
      },
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {type: Boolean,
      default: false

    },
    bannedAt: {
      type: Date,
      default: null,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    changeCredentialTime: {
      type: Date,
    },
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: [
      {
        code: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(otpTypes),
          required: true,
        },
        expiresIn: {
          type: Date,
          required: true,
        },
      },
    ], 
  },
  { timestamps: true, toObject: {virtuals: true}, toJSON: { virtuals: true } }
);

userSchema.virtual("username").set(function (value) {
  this.firstName = value.split(" ")[0];
  this.lastName = value.split(" ")[1];
}).get(function(){
  return this.firstName + " " + this.lastName;
});

userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password = generateHash({plainText: this.password});
  };

  if(this.isModified("mobileNumber")){
    this.mobileNumber = generateEncryption({plaintext: this.mobileNumber});
  };
  next();
})

export const userModel = mongoose.models.User || model("User", userSchema);

export const socketConnections = new Map() 
