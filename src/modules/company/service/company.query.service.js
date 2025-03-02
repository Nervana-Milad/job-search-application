import * as dbService from "../../../DB/db.service.js";
import { companyModel } from "../../../DB/model/Company.model.js";


export const companyList = async (parent, args)=>{
    const companies = await dbService.find({
        model: companyModel,
        filter: {deletedAt: null}
    });

    return {message: "Done", statusCode: 200, data: companies};
}