import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const signup = joi.object().keys({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref("password")).required(),
    mobileNumber: generalFields.mobileNumber.required(),
    DOB: generalFields.DOB.required(),
}).required();

export const confirmEmailOTP = joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
}).required();

export const login = joi.object().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
}).required();

export const forgotPassword = joi.object().keys({
    email: generalFields.email.required(),
}).required();

export const validateForgotPassword = confirmEmailOTP;

export const resetPassword =  joi.object().keys({
    email: generalFields.email.required(),
    code: generalFields.code.required(),
    password: generalFields.password.required(),
    confirmationPassword: generalFields.confirmationPassword.valid(joi.ref("password")).required()
}).required();