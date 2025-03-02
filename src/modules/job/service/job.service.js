import { asyncHandler } from "../../../utils/response/error.response.js";
import * as dbService from "../../../DB/db.service.js";
import { companyModel } from "../../../DB/model/Company.model.js";
import { successRespone } from "../../../utils/response/success.response.js";
import { jobOpportunityModel } from "../../../DB/model/Job.model.js";
import { paginate } from "../../../utils/pagination.js";
import { applicationModel } from "../../../DB/model/Application.model.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";
import { statusTypes } from "../../../utils/types/data.types.js";

export const addJob = asyncHandler(async (req, res, next) => {
  const jobData = req.body;
  const addedBy = req.user._id;
  const company = await dbService.findById({
    model: companyModel,
    id: jobData.companyId,
  });
  if (!company) {
    return next(new Error("Company not found.", { cause: 404 }));
  }

  const isHR = company.HRs.includes(addedBy);
  const isOwner = company.createdBy.equals(addedBy);

  if (!isHR && !isOwner) {
    return next(
      new Error("Only company HRs or the owner can add jobs.", { cause: 403 })
    );
  }

  const newJob = await dbService.create({
    model: jobOpportunityModel,
    data: { ...jobData, addedBy },
  });
  return successRespone({ res, data: { newJob } });
});

export const updateJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  const job = await dbService.findById({
    model: jobOpportunityModel,
    id: jobId,
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  const isCreator = job.addedBy.equals(userId.toString());
  if (!isCreator) {
    return next(
      new Error("Only the job creator can update this job.", { cause: 403 })
    );
  }
  const updatedJob = await dbService.findByIdAndUpdate({
    model: jobOpportunityModel,
    id: jobId.toString(),
    data: { ...updateData },
    options: { new: true },
  });
  return successRespone({ res, data: { updatedJob } });
});

export const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  const job = await dbService.findById({
    model: jobOpportunityModel,
    id: jobId,
  });
  if (!job) {
    return next(new Error("Job not found", { cause: 404 }));
  }

  const company = await dbService.findById({
    model: companyModel,
    id: job.companyId,
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  const isHR = company.HRs.includes(userId);
  if (!isHR) {
    return next(
      new Error("Only company HRs can delete this job", { cause: 403 })
    );
  }

  const deleteJob = await dbService.findByIdAndUpdate({
    model: jobOpportunityModel,
    id: jobId,
    data: { closed: true },
    options: { new: true },
  });

  return successRespone({ res, data: { deleteJob } });
});

export const getJobs = asyncHandler(async (req, res, next) => {
    const { jobId, companyId } = req.params;
    let { page, size, search, sort } = req.query; 
  
    let filter = { closed: false }; 
  
    if (companyId) {
      filter.companyId = companyId;
    }
  
    if (search) {
      const companies = await dbService.find({
        model: companyModel,
        filter: { companyName: { $regex: search, $options: "i" } },
      });
  
      if (companies.length === 0) {
        return next(
          new Error("No companies found with the given name", { cause: 404 })
        );
      }
  
      const companyIds = companies.map((company) => company._id);
      filter.companyId = { $in: companyIds };
    }
  
    if (jobId) {
      const job = await dbService.findOne({
        model: jobOpportunityModel,
        filter: { _id: jobId, ...filter },
        populate: {
          path: "companyId",
          select: "_id companyName",
        },
      });
  
      if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
      }
  
      return successRespone({ res, status: 200, data: { job } });
    }
  
    const result = await paginate({
      page,
      size,
      model: jobOpportunityModel,
      filter,
      populate: {
        path: "companyId",
        select: "_id companyName", 
      },
      sort: sort || "-createdAt",
    });
  
    return successRespone({
      res,
      status: 200,
      data: {
        jobs: result.data,
        totalCount: result.count,
        currentPage: result.page,
        totalPages: Math.ceil(result.count / result.size),
      },
    });
});

export const getMatchedJobs = asyncHandler(async (req, res, next) => {
    const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query; 
    let { page, size, sort } = req.query; 
    let filter = { closed: false };
    if (workingTime) {
        filter.workingTime = workingTime;
      }
      if (jobLocation) {
        filter.jobLocation = jobLocation;
      }
      if (seniorityLevel) {
        filter.seniorityLevel = seniorityLevel;
      }
      if (jobTitle) {
        filter.jobTitle = { $regex: jobTitle, $options: "i" };
      }
      if (technicalSkills) {
        filter.technicalSkills = { $in: technicalSkills.split(",") };
      }
    
    const result = await paginate({
      page,
      size,
      model: jobOpportunityModel,
      filter,
      populate: {
        path: "companyId",
        select: "_id companyName", 
      },
      sort: sort || "-createdAt",
    });
  
    return successRespone({
      res,
      status: 200,
      data: {
        jobs: result.data,
        totalCount: result.count,
        currentPage: result.page,
        totalPages: Math.ceil(result.count / result.size),
      },
    });
});

export const getApplications = asyncHandler(async (req, res, next) => {
  const {jobId, companyId} = req.params;
  const {page, size, sort = "-createdAt"} = req.query;

  const job = await dbService.findById({model: jobOpportunityModel, id: jobId});
  if(!job){
    return next(new Error("Job not found", {cause: 404}));
  };

  const company = await dbService.findById({model: companyModel, id: companyId});
  if(!company){
    return next(new Error("Company not found", {cause: 404}));
  };

  const isAuthorized = req.user._id.equals(company.createdBy) || company.HRs.includes(req.user._id);
  if(!isAuthorized){
    return next(new Error("Unauthorized to access these applications", { cause: 403 }));
  };

  const result = await paginate({
    page, size, model: applicationModel,
    filter: {jobId},
    populate: [
      {
        path: "userId",
        select: "_id firstName lastName email"
      }
    ],
    sort
  });

  return successRespone({res, data: {applications: result.data, totalCount: result.count,
    currentPage: result.page,
    totalPages: Math.ceil(result.count / result.size)}})
});

export const addApplication = asyncHandler(async(req, res, next)=>{
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/Applications/CVs`});

      const {jobId} = req.params;
      const userId = req.user._id;

      const job = await dbService.findById({model: jobOpportunityModel, id: jobId});
      if (!job) {
        return next(new Error("Job not found", { cause: 404 }));
      }
      if (job.closed) {
        return next(new Error("This job is no longer accepting applications", { cause: 400 }));
      };
      const existingApplication = await dbService.findOne({ model: applicationModel, filter: {jobId, userId} });
      if (existingApplication) {
        return next(new Error("You have already applied for this job", { cause: 400 }));
      };

        const application = await dbService.create({
          model: applicationModel,
          data: {
            jobId,
            userId,
            userCV: { secure_url, public_id },
            status: statusTypes.pending
          },
          options: { new: true },
        });
      
        // const hrSicketIo = socketConnections.get(job.addedBy.toString());
        // if(hrSicketIo){
        //   req.app.get("io").to(hrSicketIo).emit("newApplication", {
        //     message: "A new application has been submitted",
        //     application
        //   })
        // }

        return successRespone({res, statusCode: 201, data: application});

    
});