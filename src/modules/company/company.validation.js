import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const addCompany = joi.object().keys({
    companyName: generalFields.companyName.required(),
    description: generalFields.description.required(),
    industry: generalFields.industry.required(),
    address: generalFields.address.required(),
    numberOfEmployees: generalFields.numberOfEmployees.required(),
    companyEmail: generalFields.email.required(),
    HRs: generalFields.HRs.required()
}).required();

export const updateCompanyData = joi.object().keys({
    companyId: generalFields.id.required(),
    companyName: generalFields.companyName,
    description: generalFields.description,
    industry: generalFields.industry,
    address: generalFields.address,
    numberOfEmployees: generalFields.numberOfEmployees,
    companyEmail: generalFields.email,
    HRs: generalFields.HRs,
    
}).required();

export const softDeleteCompany = joi.object().keys({
    companyId: generalFields.id.required(),
}).required();

export const getCompanyWithJobs = softDeleteCompany;

export const searchByName = joi.object().keys({
    companyName: generalFields.companyName.required(),
}).required();

export const companyLogo = joi.object().keys({
    companyId: generalFields.id.required(),
    file: generalFields.file.required()
}).required();

export const companyCoverPic = companyLogo;