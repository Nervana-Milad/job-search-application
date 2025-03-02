import {Router} from "express";
import * as profileService from "./service/user.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./user.validation.js"
import { fileValidations } from "../../utils/multer/local.multer.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
const router = Router();


router.get("/profile", authentication(), profileService.profile );
router.get("/:userId/user-data", validation(validators.getUserProfile), authentication(), profileService.getUserProfile);

router.patch("/profile/password", validation(validators.updatePassword), authentication(), profileService.updatePassword);
router.patch("/profile", validation(validators.updateBasicDataProfile), authentication(), profileService.updateBasicDataProfile );
router.patch("/profile/image", authentication(), uploadCloudFile(fileValidations.image).single('attachment'), validation(validators.profilePic), profileService.uploadProfilePic)
router.patch("/profile/image/cover", authentication(), uploadCloudFile(fileValidations.image).single('attachment'), validation(validators.coverPic), profileService.uploadProfileCoverPic)

router.delete("/profile/image", authentication(), profileService.deleteProfilePic);
router.delete("/profile/image/cover", authentication(), profileService.deleteCoverPic);
router.delete("/profile", authentication(), profileService.softDeleteAccount);

export default router;