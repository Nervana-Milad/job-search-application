import { roleTypes } from "../../utils/types/data.types.js";


export const endPoint = {
    addJob: [roleTypes.user, roleTypes.admin],
    updateJob: [roleTypes.user],
    deleteJob: [roleTypes.user],
    getJobs: [roleTypes.user],
    getMatchedJobs: [roleTypes.user],
    getApplications: [roleTypes.user, roleTypes.admin]
}