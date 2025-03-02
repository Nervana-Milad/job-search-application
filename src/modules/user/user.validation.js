import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const getUserProfile = joi.object().keys({
    userId: generalFields.id.required(),
}).required();

export const updatePassword = joi.object().keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref("password")).required(),
}).required();

export const updateBasicDataProfile = joi.object().keys({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    DOB: generalFields.DOB,
    gender: generalFields.gender,
    mobileNumber: generalFields.mobileNumber,
    role: generalFields.role
    
}).required();

export const profilePic = joi.object().keys({
    file: generalFields.file.required()
}).required();

export const coverPic = profilePic;