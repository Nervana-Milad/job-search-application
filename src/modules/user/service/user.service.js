import { asyncHandler } from "../../../utils/response/error.response.js";
import { successRespone } from "../../../utils/response/success.response.js";
import { generateDecryption, generateEncryption } from "../../../utils/security/encryption.security.js";
import * as dbService from "../../../DB/db.service.js";
import { userModel } from "../../../DB/model/User.model.js";
import { compareHash, generateHash } from "../../../utils/security/hash.security.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";




export const profile = asyncHandler(async(req, res, next)=>{
    const user = req.user;

    const decryptedMobileNumber = generateDecryption({ cipherText: user.mobileNumber });
  
    const userData = {
      ...user.toObject(),
      mobileNumber: decryptedMobileNumber,
    };
  
    return successRespone({ res, data: { user: userData } });
});

export const getUserProfile = asyncHandler(async(req, res, next) => {
    const {userId} = req.params;
    const user = await dbService.findById({model: userModel, id: userId});
    if(!user){
        return next(new Error("User not found", {cause: 404}));
    };
    const decryptedMobileNumber = generateDecryption({ cipherText: user.mobileNumber });
    const userProfile = {
        userName: `${user.firstName} ${user.lastName}`,
        mobileNumber: decryptedMobileNumber,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
      };

    return successRespone({res, data: {user: userProfile}})
});

export const updatePassword = asyncHandler(async(req, res, next) => {
    const {oldPassword, password} = req.body;

    if(!compareHash({plainText: oldPassword, hashValue: req.user.password})){
        return next(new Error("In-valid old password", {cause: 400}));
    };

    await dbService.updateOne({
        model: userModel,
        filter: {_id: req.user._id},
        data: {
            password: generateHash({plainText: password}),
            changeCredentialTime: Date.now()
        }
    })

    return successRespone({res, data: {}})
});

export const updateBasicDataProfile = asyncHandler(async(req, res, next)=>{
    const {firstName, lastName, DOB, mobileNumber, gender, role} = req.body;
    const updateData = {};
    if(mobileNumber){
        updateData.mobileNumber = generateEncryption({plaintext: mobileNumber});
    };
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (DOB) updateData.DOB = DOB;
    if (gender) updateData.gender = gender;
    if(role) updateData.role = role;

    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {_id: req.user._id},
        data: updateData,
        options: {new: true}
    });

    return successRespone({res, data: {user}});
});

export const uploadProfilePic = asyncHandler(async (req, res, next)=> {
    const {secure_url, public_id} = await cloud.uploader.upload(req.file?.path, {folder: `${process.env.APP_NAME}/user/${req.user._id}/profile`})
     const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: {_id: req.user._id},
        data: {
            profilePic: {secure_url, public_id}
        },
        options: {new: true}
    });
    if(user.profilePic?.public_id){
        await cloud.uploader.destroy(user.profilePic.public_id)
    }
    return successRespone({res, data: {user}})
});

export const uploadProfileCoverPic = asyncHandler(async (req, res, next)=> {
    const {secure_url, public_id} = await cloud.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/user/${req.user._id}/cover`})
    const user = await dbService.findOneAndUpdate({
       model: userModel,
       filter: {_id: req.user._id},
       data: {
           coverPic: {secure_url, public_id},
       },
       options: {new: true}
   });
   if(user.coverPic?.public_id){
    await cloud.uploader.destroy(user.coverPic.public_id)
}
   return successRespone({res, data: {user}})
});

export const deleteProfilePic = asyncHandler(async (req, res, next) => {
    const user = await dbService.findById({model: userModel, id: req.user._id});
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    };
    if (user.profilePic?.public_id) {
      await cloud.uploader.destroy(user.profilePic.public_id);
      await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
          $unset: { profilePic: 1 },
        },
        options: { new: true },
      });
    }
    return successRespone({ res, message: "Cover picture deleted successfully" });
});

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
    const user = await  dbService.findById({model: userModel, id: req.user._id});
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    };  
    if (user.coverPic?.public_id) {
      await cloud.uploader.destroy(user.coverPic.public_id);  
      await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
          $unset: { coverPic: 1 },
        },
        options: { new: true },
      });
    };
    return successRespone({ res, message: "Cover picture deleted successfully" });
});

export const softDeleteAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
      const user = await dbService.findByIdAndUpdate({
      model: userModel,
      id: userId,
      data: { deletedAt: new Date(), isDeleted: true },
      options: { new: true }
    });
  
    if (!user) {
      return next(new Error("User not found", { cause: 404 }));
    }
  
    return successRespone({ res, message: "Account soft-deleted successfully" });
});