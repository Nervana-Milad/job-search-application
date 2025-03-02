import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";
import { authentication } from "../../../middleware/graph/auth.middleware.js";
import { roleTypes } from "../../../utils/types/data.types.js";


export const banUser = async (parent, args)=>{
    const {userId, action, authorization} = args;

    const user = await authentication({authorization})
    if (user.role !== roleTypes.admin) {
        throw new Error("Only admins can ban or unban users");
      };

    const data = action === 'unBan' ? {bannedAt: null} : {bannedAt: new Date()};
    const updatedUser = await dbService.findOneAndUpdate({
        model: userModel,
        filter:{ deletedAt: null, _id: userId},
        data,
    });

    return {message: "Done", statusCode: 200, data: updatedUser};
}