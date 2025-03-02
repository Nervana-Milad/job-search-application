import { tokenTypes } from "../../utils/types/data.types.js";
import { verifyToken } from "../../utils/security/token.security.js";
import * as dbService from "../../DB/db.service.js";
import { userModel } from "../../DB/model/User.model.js";


export const authentication = async({authorization = "", tokenType = tokenTypes.access, accessRoles=[], checkAuthorization=false} = {}) => {

  const [bearer, token] = authorization?.split(" ") || [];
  if (!bearer || !token) {
    throw new Error("Missing token");
  };
  let access_signature = "";
  let refresh_signature = "";
  switch (bearer) {
    case "System":
      access_signature = process.env.ADMIN_ACCESS_TOKEN;
      refresh_signature = process.env.ADMIN_REFRESH_TOKEN;
      break;
    case "Bearer":
      access_signature = process.env.USER_ACCESS_TOKEN;
      refresh_signature = process.env.USER_REFRESH_TOKEN;
      break;
    default:
      break;
  };
  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypes.access ? access_signature : refresh_signature,
  });
  if (!decoded?.id) {
    throw new Error("In-valid token payload");
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id, isDeleted: false },
  });
  if (!user) {
    throw new Error("Not registered account");
  };
  if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
    throw new Error("In-valid login credentials");
  };
  if(checkAuthorization && !accessRoles.includes(user.role)){
    throw new Error("Not authorized account")
  }
  return user;
};
