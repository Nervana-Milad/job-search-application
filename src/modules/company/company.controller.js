import {Router} from "express";
const router = Router();
import * as companyService from "./service/company.service.js";
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import { endPoint } from "./company.authorization.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./company.validation.js";
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import jobController from "../job/job.controller.js"; 

router.use("/:companyId", jobController);

router.post("/", authentication(), authorization(endPoint.addCompany), validation(validators.addCompany), companyService.addCompany);

router.patch("/:companyId", authentication(), validation(validators.updateCompanyData), companyService.updateCompany);
router.patch("/:companyId/logo", authentication(), uploadCloudFile(fileValidations.image).single('attachment'), validation(validators.companyLogo), companyService.uploadCompanyLogo)
router.patch("/:companyId/cover-pic", authentication(), uploadCloudFile(fileValidations.image).single('attachment'), validation(validators.companyCoverPic), companyService.uploadCompanyCover)


router.delete("/:companyId", authentication(), authorization(endPoint.softDeleteCompany), validation(validators.softDeleteCompany), companyService.softDeleteCompany);
router.delete("/:companyId/logo", authentication(), companyService.deleteCompanyLogo);
router.delete("/:companyId/cover-pic", authentication(), companyService.deleteCompanyCoverPic);


router.get("/:companyId/company-with-jobs", authentication(), authorization(endPoint.getCompanyWithJobs), validation(validators.getCompanyWithJobs), companyService.getCompanyWithJobs);
router.get("/:companyName", authentication(), authorization(endPoint.searchByName), validation(validators.searchByName), companyService.searchByName);

export default router;