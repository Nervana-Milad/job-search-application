import {userModel} from "../../../DB/model/User.model.js";
import { asyncHandler } from "../../../utils/response/error.response.js";
import { successRespone } from "../../../utils/response/success.response.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import {
  decodedToken,
  generateToken,
  verifyToken,
} from "../../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";
import * as dbService from "../../../DB/db.service.js";
import { emailEvent } from "../../../utils/events/email.event.js";
import { providerTypes, roleTypes, tokenTypes } from "../../../utils/types/data.types.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email, provider: providerTypes.system, isDeleted: false },
  });
  if (!user) {
    return next(new Error("In-valid Account", { cause: 404 }));
  }

  if (!user.isConfirmed) {
    return next(new Error("Please confirm you email first!", { cause: 400 }));
  }

  if (!compareHash({ plainText: password, hashValue: user.password })) {
    return next(new Error("Password or Email not valid", { cause: 400 }));
  }

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 604800, // 7d
  });

  return successRespone({
    res,
    data: { token: { access_token, refresh_token } },
  });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const payload = await verify();

  if (!payload.email_verified) {
    return next(new Error("In-valid Account", { cause: 400 }));
  }

  let user = await dbService.findOne({
    model: userModel,
    filter: { email: payload.email },
  });
  if (!user) {
    user = await dbService.create({
      model: userModel,
      data: {
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        isConfirmed: payload.email_verified,
        profilePic: payload.picture,
        provider: providerTypes.google,
      },
    });
  }

  if (user.provider != providerTypes.google) {
    return next(new Error("In-valid provider", { cause: 400 }));
  }

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 604800, // 7d
  });

  return successRespone({
    res,
    data: {
      token: { access_token, refresh_token },
    },
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  
  const user = await decodedToken({authorization, tokenType: tokenTypes.refresh, next})

  const access_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_ACCESS_TOKEN
        : process.env.USER_ACCESS_TOKEN,
  });

  const refresh_token = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleTypes.admin
        ? process.env.ADMIN_REFRESH_TOKEN
        : process.env.USER_REFRESH_TOKEN,
    expiresIn: 604800, // 7d
  });

  return successRespone({
    res,
    data: { token: { access_token, refresh_token } },
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });
  if (!user) {
    return next(new Error("In-valid account", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please confirm your account first", { cause: 400 }));
  }
  emailEvent.emit("forgotPassword", { id: user._id, email });

  return successRespone({ res });
});

export const validateForgotPassword = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });
  if (!user) {
    return next(new Error("In-valid account", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please confirm your account first", { cause: 400 }));
  }
  const otpEntry = user.OTP.find((otp) => otp.type === "forgetPassword");
  if (!otpEntry) {
    return next(new Error("No OTP found for forgot password", { cause: 404 }));
  }

  if (!compareHash({ plainText: code, hashValue: otpEntry.code })) {
    return next(new Error("In-valid reset OTP code", { cause: 400 }));
  }

  return successRespone({ res });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: false },
  });
  if (!user) {
    return next(new Error("In-valid account", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please confirm your account first", { cause: 400 }));
  }
  const otpEntry = user.OTP.find((otp) => otp.type === "forgetPassword");
  if (!otpEntry) {
    return next(new Error("No OTP found for forgot password", { cause: 404 }));
  }

  if (!compareHash({ plainText: code, hashValue: otpEntry.code })) {
    return next(new Error("In-valid reset OTP code", { cause: 400 }));
  }

  await dbService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      password: generateHash({plainText: password}),
      changeCredentialTime: Date.now(),
      $pull: { OTP: { type: "forgetPassword" } },
      $unset: {
        expiresIn: 1,
      },
    },
  });

  return successRespone({ res });
});
