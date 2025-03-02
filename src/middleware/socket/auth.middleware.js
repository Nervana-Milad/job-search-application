import { verifyToken } from "../../utils/security/token.security.js";
import { tokenTypes } from "../../utils/types/data.types.js";
import * as dbService from "../../DB/db.service.js";
import { userModel } from "../../DB/model/User.model.js";

export const authentication = async ({
    socket = {},
    tokenType = tokenTypes.access,
    accessRoles = [],
    checkAuthorization = false

} = {}) => {
    const [bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || [];
    if(!bearer || !token){
        return {data: {message: "Missing token", status: 400}};
    };
    let access_signature = '';
    let refresh_signature = '';
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
    }

    const decoded = verifyToken({token, signature: tokenType == tokenTypes.access ? access_signature : refresh_signature});
    if(!decoded?.id){
        return {data: {message: "In-valid token payload", status: 400}};
    };
    const user = await dbService.findOne({model: userModel, filter: {_id: decoded.id, deletedAt: null}});
    if(!user){
        return {data: {message: "Not registered account", status: 400}};
    };
    if(user.changeCredentialTime?.getTime() >= decoded.iat * 1000){
        return {data: {message: "In-valid login credentials", status: 400}};
    };
    if(checkAuthorization && !accessRoles.includes(user.role)){
        return {data: {message: "Not authorized account", status: 400}};
    }

    return {data: {message: "Done", user }, valid: true}

}