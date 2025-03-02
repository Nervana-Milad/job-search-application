import { EventEmitter } from "node:events";
import { customAlphabet } from "nanoid";
import { generateHash } from "../security/hash.security.js";
import { userModel } from "../../DB/model/User.model.js";
import { sendEmail } from "../email/send.email.js";
import { verifyAccountTemplate } from "../email/template/verifyAccount.template.js";
import * as dbService from "../../DB/db.service.js";
import { otpTypes } from "../types/data.types.js";

export const emailEvent = new EventEmitter();

const emailSubject = {
  confirmEmail: "Confirm-email",
  resetPassword: "Reset-password",
};

export const sendCode = async ({data = {}, subject = emailSubject.confirmEmail} = {}) => {
  const { id, email } = data;
  const otp = customAlphabet("0123456789", 4)();
  const hashOTP = generateHash({ plainText: otp });
  const expiresIn = new Date(Date.now() + 10 * 60 * 1000);

  let updateData = {};
  switch (subject) {
    case emailSubject.confirmEmail:
      updateData = { $push: { OTP : {code: hashOTP, type: otpTypes.confirmEmail, expiresIn} } };
      break;
    case emailSubject.resetPassword:
      updateData = { $push: { OTP : {code: hashOTP, type: otpTypes.forgetPassword, expiresIn} } };
      break;
    default:
      break;
  }
  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: id },
    data: updateData,
    options: {new: true}
  });
  const html = verifyAccountTemplate({ otpCode: otp });

  await sendEmail({ to: email, subject, html });
};

emailEvent.on("sendConfirmEmail", async (data) => {
  await sendCode({data});
});

emailEvent.on("forgotPassword", async (data) => {
  await sendCode({data, subject: emailSubject.resetPassword})
})