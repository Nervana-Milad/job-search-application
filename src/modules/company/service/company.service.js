import { asyncHandler } from "../../../utils/response/error.response.js";
import { successRespone } from "../../../utils/response/success.response.js";
import * as dbService from "../../../DB/db.service.js";
import { companyModel } from "../../../DB/model/Company.model.js";
import { roleTypes } from "../../../utils/types/data.types.js";
import { cloud } from "../../../utils/multer/cloudinary.multer.js";

export const addCompany = asyncHandler(async (req, res, next) => {
  const companyData = req.body;
  const cexistingCompany = await dbService.findOne({
    model: companyModel,
    filter: { $or: [{ companyName: companyData.companyName }, { companyEmail: companyData.companyEmail }] },
  });
  if (cexistingCompany) {
    if (cexistingCompany.companyName === companyData.companyName) {
      return next(new Error("Company name already exists", { cause: 409 }));
    }
    if (cexistingCompany.companyEmail === companyData.companyEmail) {
      return next(new Error("Company email already exists", { cause: 409 }));
    }
  }
  const company = await dbService.create({
    model: companyModel,
    data: {
      ...companyData,
      createdBy: req.user._id,
    },
  });
  return successRespone({ res, statusCode: 201, data: { company } });
});

export const updateCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id;
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  if (company.createdBy.toString() !== userId.toString()) {
    return next(
      new Error("Unauthorized: Only the company owner can update the data", {
        cause: 403,
      })
    );
  }
  const updatedCompany = await dbService.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: req.body,
    options: { new: true },
  });
  return successRespone({
    res,
    message: "Company data updated successfully",
    data: { updatedCompany },
  });
});

export const softDeleteCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;

  const userId = req.user._id;
  const userRole = req.user.role;

  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId },
  });
  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  const isOwner = company.createdBy.toString() === userId.toString();
  const isAdmin = userRole === roleTypes.admin;

  if (!isOwner && !isAdmin) {
    return next(
      new Error(
        "Unauthorized: Only the company owner or admin can perform this action",
        {
          cause: 403,
        }
      )
    );
  }

  const updatedCompany = await dbService.findByIdAndUpdate({
    model: companyModel,
    id: { _id: companyId },
    data: { deletedAt: new Date() },
    options: { new: true },
  });

  return successRespone({
    res,
    message: "Company soft-deleted successfully",
    data: { company: updatedCompany },
  });
});

export const getCompanyWithJobs = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, deletedAt: null },
    populate: [
      {
        path: "jobs", 
        select: "-__v -createdAt -updatedAt",
      },
    ]
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }
  return successRespone({ res, data: { company } });
});

export const searchByName = asyncHandler(async (req, res, next) => {
  const { companyName } = req.params;
  const company = await dbService.findOne({
    model: companyModel,
    filter: { companyName, deletedAt: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  }

  return successRespone({ res, data: { company } });
});

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/company/logo`});
  const userId = req.user._id;
  const { companyId } = req.params;

  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: null},
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  };

  if (company.createdBy.toString() !== userId.toString()) {
    return next(new Error("Unauthorized: Only the company owner can upload the logo", {cause: 403}));
  }

  const updatedCompany = await dbService.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: {
      logo: { secure_url, public_id },
    },
    options: { new: true },
  });

  if (company.logo?.public_id) {
    await cloud.uploader.destroy(company.logo.public_id);
  }
  return successRespone({ res, data: { company: updatedCompany } });
});

export const uploadCompanyCover = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {folder: `${process.env.APP_NAME}/company/cover`});
  const userId = req.user._id;
  const { companyId } = req.params;

  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  };

  if (company.createdBy.toString() !== userId.toString()) {
    return next(new Error("Unauthorized: Only the company owner can upload the logo", {cause: 403}));
  }

  const updatedCompany = await dbService.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId },
    data: {
      coverPic: { secure_url, public_id },
    },
    options: { new: true },
  });

  if (company.coverPic?.public_id) {
    await cloud.uploader.destroy(company.coverPic.public_id);
  }
  return successRespone({ res, data: { company: updatedCompany } });
});

export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { companyId } = req.params;

  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  };

  if (company.createdBy.toString() !== userId.toString()) {
    return next(new Error("Unauthorized: Only the company owner can delete the logo", {cause: 403}));
  };


  if (company.logo?.public_id) {
    await cloud.uploader.destroy(company.logo.public_id);

    await dbService.findOneAndUpdate({
      model: companyModel,
      filter: { _id: companyId },
      data: {
        $unset: { logo: 1 }, 
      },
      options: { new: true },
    });
  }
    return successRespone({ res, message: "Logo company deleted successfully" });
});

export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { companyId } = req.params;

  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: null },
  });

  if (!company) {
    return next(new Error("Company not found", { cause: 404 }));
  };

  if (company.createdBy.toString() !== userId.toString()) {
    return next(new Error("Unauthorized: Only the company owner can delete the logo", {cause: 403}));
  };


  if (company.coverPic?.public_id) {
    await cloud.uploader.destroy(company.coverPic.public_id);

    await dbService.findOneAndUpdate({
      model: companyModel,
      filter: { _id: companyId },
      data: {
        $unset: { coverPic: 1 }, 
      },
      options: { new: true },
    });
  }
    return successRespone({ res, message: "Cover company deleted successfully" });
});