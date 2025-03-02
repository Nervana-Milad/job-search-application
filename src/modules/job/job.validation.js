import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addJob = joi.object().keys({
    jobTitle: generalFields.jobTitle.required(),
    jobLocation: generalFields.jobLocation.required(),
    workingTime: generalFields.workingTime.required(),
    seniorityLevel: generalFields.seniorityLevel.required(),
    jobDescription: generalFields.jobDescription.required(),
    technicalSkills: generalFields.technicalSkills.required(),
    softSkills: generalFields.softSkills.required(),
    companyId: generalFields.id.required()
}).required();

export const updateJob = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
}).required();

export const deleteJob = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
}).required();

export const getMatchedJobs = joi.object().keys({
    companyId: generalFields.id.required(),
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    technicalSkills: generalFields.technicalSkills,
    page: joi.number(),
    size: joi.number()
}).required();

export const getApplications = joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
    page: joi.number(),
    size: joi.number(),
    sort: joi.string()
}).required();

export const addApplication = joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id.required(),
    file: generalFields.file.required()
}).required();