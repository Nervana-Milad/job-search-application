import * as userQueryService from "./service/user.query.service.js";
import * as userTypes from "./types/user.types.js";
import * as userMutationService from "./service/user.mutation.service.js";
import { GraphQLID, GraphQLNonNull, GraphQLString, GraphQLEnumType } from "graphql";

export const query = {
  userList: {
    type: userTypes.userListResponse,
    resolve: userQueryService.userList,
  },
};


export const mutation = {
    banUser:{
        type: userTypes.banUserResponse,
        args: {
            userId: {type: new GraphQLNonNull(GraphQLID)},
            action: {type: new GraphQLNonNull(new GraphQLEnumType({
                name: "userActionType",
                values: {
                    ban: {type: GraphQLString},
                    unBan: {type: GraphQLString}
                }
            }))},
            authorization: {type: new GraphQLNonNull(GraphQLString)}
        },
        resolve: userMutationService.banUser
    }
}