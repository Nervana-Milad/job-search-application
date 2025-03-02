import { decodedToken } from "../utils/security/token.security.js";
import { asyncHandler } from "../utils/response/error.response.js";


export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    req.user = await decodedToken({ authorization, next });
    return next();
  });
};

export const authorization = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {

        if(!accessRoles.includes(req.user.role)){
            return next(new Error("Not authorized account", {cause: 403}));
        }
      return next();
    });
  };