import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import * as userGraphController from "./user/user.graph.controller.js";
import * as companyGraphController from "./company/company.graph.controller.js";


export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "JobSearchQuery",
        description: "",
        fields: {
            ...userGraphController.query,
            ...companyGraphController.query
        }
    }),
    mutation: new GraphQLObjectType({
        name: "JobSearchMutation",
        fields: {
            ...userGraphController.mutation,
            ...companyGraphController.mutation
        }
    })
});