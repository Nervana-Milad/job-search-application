import joi from "joi";
import { Types } from "mongoose";
import { genderTypes, jobLocationTypes, roleTypes, seniorityLevelTypes, workingTimeTypes } from "../utils/types/data.types.js";

export const isValidDOB = (value, helpers) => {
    const currentDate = new Date();
    const age = currentDate.getFullYear() - value.getFullYear();
    if (age < 18) {
      return helpers.error("any.invalid", {
        message: "You must be at least 18 years old.",
      });
    }
    return value;
  }

export const isValidObjectId  = (value, helper)=>{
  return Types.ObjectId.isValid(value) ? true : helper.message("In-valid object id");
}

const fileObj = {
  fieldname: joi.string().valid("attachment"),
originalname: joi.string(),
encoding: joi.string(),
mimetype: joi.string(),
finalPath: joi.string(),
destination: joi.string(),
filename: joi.string(),
path: joi.string(),
size: joi.number()
};

export const generalFields = {
        firstName: joi.string().min(2).max(50).trim(),
        lastName: joi.string().min(2).max(50).trim(),
        email: joi.string().email({minDomainSegments: 2, maxDomainSegments: 3, tlds: {allow: ["com", "net"]}}),
        password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#&<>@\"~;$^%{}?])(?=.*[a-zA-Z]).{8,}$/)),
        confirmationPassword: joi.string(),
        mobileNumber: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
        DOB: joi.date().less("now").custom(isValidDOB),
        code: joi.string().pattern(new RegExp(/^\d{4}$/)),
        id: joi.string().custom(isValidObjectId),
        role: joi.string().valid(...Object.values(roleTypes)),
        gender: joi.string().valid(...Object.values(genderTypes)),
        fileObj,
        file: joi.object().keys(fileObj),
        companyName: joi.string().min(2).max(100),
        description: joi.string().min(10).max(1000),
        industry: joi.string().min(2).max(100),
        address: joi.string().min(5).max(500),
        numberOfEmployees: joi.string().valid("1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001+"),
        HRs: joi.array().items(joi.string().custom(isValidObjectId)),
        jobTitle: joi.string().min(2).max(1000),
        jobLocation: joi.string().valid(...Object.values(jobLocationTypes)),
        workingTime: joi.string().valid(...Object.values(workingTimeTypes)),
        seniorityLevel: joi.string().valid(...Object.values(seniorityLevelTypes)),
        jobDescription: joi.string().min(2).max(1000),
        technicalSkills: joi.array().items(joi.string()),
        softSkills: joi.array().items(joi.string()),
}



export const validation = (Schema) => {
    return (req, res, next) => {
        const inputs = {...req.query, ...req.params, ...req.body};

        if(req.file || req.files?.length){
          inputs.file = req.file || req.files
        }
        const validationResult = Schema.validate(inputs, {abortEarly: false});
        if( validationResult.error){
            return res.status(400).json({message: "Validation Error", details: validationResult.error.details});
        };
        return next();
    }
}