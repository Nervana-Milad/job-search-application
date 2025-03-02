
import * as companyQueryService from "./service/company.query.service.js";
import * as companyTypes from "./types/company.types.js";
import * as companyMutationService from "../company/service/company.mutation.service.js";
import { GraphQLID, GraphQLNonNull, GraphQLString, GraphQLEnumType, GraphQLBoolean } from "graphql";

export const query = {
  companyList: {
    type: companyTypes.companyListResponse,
    resolve: companyQueryService.companyList,
  },
};

export const mutation = {
    banCompany:{
        type: companyTypes.banCompanyResponse,
        args: {
            companyId: {type: new GraphQLNonNull(GraphQLID)},
            action: {type: new GraphQLNonNull(new GraphQLEnumType({
                name: "campanyActionType",
                values: {
                    ban: {type: GraphQLString},
                    unBan: {type: GraphQLString}
                }
            }))},
            authorization: {type: new GraphQLNonNull(GraphQLString)}
        },
        resolve: companyMutationService.banCompany
    },
    approveCompany:{
        type: companyTypes.approveCompanyResponse,
        args: {
            companyId: {type: new GraphQLNonNull(GraphQLID)},
            action: {type: new GraphQLNonNull(GraphQLBoolean)},
            authorization: {type: new GraphQLNonNull(GraphQLString)}
        },
        resolve: companyMutationService.approveCompany
    },
    
}