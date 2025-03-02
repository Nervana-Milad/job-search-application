import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";

const imageType = new GraphQLObjectType({
  name: "imageType",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const oneCompanyResponse = new GraphQLObjectType({
  name: "oneCompanyResponse",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: GraphQLString },
    companyEmail: { type: GraphQLString },
    createdBy: { type: GraphQLID },
    logo: { type: imageType },
    coverPic: { type: imageType },
    HRs: { type: new GraphQLList(GraphQLID) },
    bannedAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
    legalAttachment: { type: imageType },
    approvedByAdmin: { type: GraphQLBoolean },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  },
});

export const companyListResponse = new GraphQLObjectType({
  name: "companyListResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: {
      type: new GraphQLList(oneCompanyResponse),
    },
  },
});

export const banCompanyResponse = new GraphQLObjectType({
  name: "banCompanyResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: {
      type: oneCompanyResponse,
    },
  },
});

export const approveCompanyResponse = new GraphQLObjectType({
  name: "approveCompanyResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: {
      type: oneCompanyResponse,
    },
  },
});
