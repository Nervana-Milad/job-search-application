import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { genderTypes, providerTypes } from "../../../utils/types/data.types.js";

export const genderTypeEnum = new GraphQLEnumType({
  name: "genderTypes",
  values: {
    MALE: { value: genderTypes.male },
    FEMALE: { value: genderTypes.female },
  },
});

export const providerTypeEnum = new GraphQLEnumType({
  name: "providerTypes",
  values: {
    SYSTEM: { value: providerTypes.system },
    GOOGLE: { value: providerTypes.google },
  },
});

export const profilePicType = new GraphQLObjectType({
  name: "prifileImageType",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const coverPicType = new GraphQLObjectType({
  name: "coverType",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const oneUserResponse = new GraphQLObjectType({
  name: "oneUserResponse",
  fields: {
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    provider: { type: providerTypeEnum },
    gender: { type: genderTypeEnum },
    profilePic: { type: profilePicType },
    coverPic: { type: coverPicType },
    DOB: { type: GraphQLString },
    mobileNumber: { type: GraphQLString },
    isConfirmed: { type: GraphQLBoolean },
    deletedAt: { type: GraphQLString },
    isDeleted: { type: GraphQLBoolean },
    bannedAt: { type: GraphQLString },
    updatedBy: { type: GraphQLID },
    changeCredentialTime: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  },
});

export const userListResponse = new GraphQLObjectType({
  name: "userListResponse",
  fields: {
    message: { type: GraphQLString },
    statusCode: { type: GraphQLInt },
    data: {
      type: new GraphQLList(oneUserResponse),
    },
  },
});


export const banUserResponse = new GraphQLObjectType({
    name: "banUserResponse",
    fields: {
      message: { type: GraphQLString },
      statusCode: { type: GraphQLInt },
      data: {
        type: oneUserResponse,
      },
    },
  });