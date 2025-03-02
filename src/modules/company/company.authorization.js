import { roleTypes } from "../../utils/types/data.types.js";

export const endPoint = {
    addCompany: [roleTypes.user, roleTypes.admin],
    updateCompanyData: [roleTypes.user],
    softDeleteCompany: [roleTypes.user, roleTypes.admin],
    getCompanyWithJobs: [roleTypes.user],
    searchByName: [roleTypes.user, roleTypes.admin],
    
}