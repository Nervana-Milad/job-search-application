import {Router} from "express"
import { authentication, authorization } from "../../middleware/auth.middleware.js";
import * as jobService from "./service/job.service.js";
import * as validators from "./job.validation.js";
import { endPoint } from "./job.authorization.js";
import { validation } from "../../middleware/validation.middleware.js";
import { fileValidations, uploadCloudFile } from "../../utils/multer/cloud.multer.js";


const router = Router({mergeParams:true});


router.post("/job", authentication(), authorization(endPoint.addJob), validation(validators.addJob), jobService.addJob);

router.patch("/job/:jobId/update", authentication(), authorization(endPoint.updateJob), validation(validators.updateJob), jobService.updateJob);
router.delete("/job/:jobId/delete", authentication(), authorization(endPoint.deleteJob), validation(validators.deleteJob), jobService.deleteJob);

router.get("/jobs/:companyId?/:jobId?", authentication(), authorization(endPoint.getJobs), jobService.getJobs);
router.get("/jobs-filter", authentication(), authorization(endPoint.getMatchedJobs), validation(validators.getMatchedJobs), jobService.getMatchedJobs);

router.get("/job/:jobId/applications", authentication(), authorization(endPoint.getApplications), validation(validators.getApplications), jobService.getApplications);

router.post("/job/:jobId/apply", authentication(), uploadCloudFile(fileValidations.document).single('attachment'), validation(validators.addApplication), jobService.addApplication)

export default router;