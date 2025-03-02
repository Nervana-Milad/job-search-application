import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";


export const userList = async (parent, args)=>{
    const users = await dbService.find({
        model: userModel,
        filter:{ deletedAt: null}
    });

    return {message: "Done", statusCode: 200, data: users};
}