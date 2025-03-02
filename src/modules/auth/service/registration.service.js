import { userModel } from "../../../DB/model/User.model.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successRespone } from "../../../utils/response/success.response.js";
import { compareHash } from "../../../utils/security/hash.security.js";
import * as dbService from "../../../DB/db.service.js";


export const signup = asyncHandler(async (req, res, next)=> {
    const {firstName, lastName, email, password, mobileNumber, DOB} = req.body;

    if(await dbService.findOne({
        model: userModel,
        filter: {email}
    })){
        return next(new Error("Email Exists", {cause: 409}));
    }
    const user = await dbService.create({
        model: userModel,
        data: {firstName, lastName, email, password, mobileNumber, DOB},
        
         });
    emailEvent.emit("sendConfirmEmail", {id: user._id, email});

    return successRespone({res, message: "Done", statusCode: 201, data: {user}});
});


export const confirmEmailOTP = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;
  
    const user = await dbService.findOne({model: userModel, filter: {email}});
    if (!user) {
      return next(new Error("In-valid account", { cause: 404 }));
    }
    if (user.isConfirmed) {
      return next(new Error("Already verified", { cause: 409 }));
    };

    const otpEntry = user.OTP.find((otp) => otp.type === "confirmEmail");
    if (!otpEntry) {
      return next(new Error("No OTP found for email confirmation", { cause: 404 }));
    };

    if (otpEntry.expiresIn < new Date()) {
        return next(new Error("OTP expired", { cause: 400 }));
    };

    if (!compareHash({ plainText: code, hashValue: otpEntry.code })) {
        return next(new Error("In-valid OTP code", { cause: 400 }));
    }
  
    await dbService.updateOne({
        model: userModel,
        filter: {email},
        data: {
            isConfirmed: true,
            $pull: { OTP: { type: "confirmEmail" } },
            $unset: {
              expiresIn: 1,
            },
          }
    });
    return successRespone({ res, message: "Email confirmed successfully" });
});
  