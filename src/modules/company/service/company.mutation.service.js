import * as dbService from "../../../DB/db.service.js";
import { companyModel } from "../../../DB/model/Company.model.js";
import { authentication } from "../../../middleware/graph/auth.middleware.js";
import { roleTypes } from "../../../utils/types/data.types.js";


export const banCompany = async (parent, args)=>{
    const {companyId, action, authorization} = args;
    const user = await authentication({authorization})
    if (user.role !== roleTypes.admin) {
        throw new Error("Only admins can ban or unban companies");
      };
    const data = action === 'unBan' ? {bannedAt: null} : {bannedAt: new Date()};
    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter:{ deletedAt: null, _id: companyId},
        data,
        options: {new: true}
    });
    return {message: "Done", statusCode: 200, data: updatedCompany};
}

export const approveCompany = async (parent, args)=>{
    const {companyId, action, authorization} = args;
    const user = await authentication({authorization})
    if (user.role !== roleTypes.admin) {
        throw new Error("Only admins can approve or reject companies");
      };
    const data = { approvedByAdmin: action };
    if (!data) {
        throw new Error("Invalid action. Use 'approve' or 'reject'");
      }

    const updatedCompany = await dbService.findOneAndUpdate({
        model: companyModel,
        filter:{ deletedAt: null, _id: companyId},
        data,
        options: {new: true}
    });
    return {message: "Done", statusCode: 200, data: updatedCompany};
}