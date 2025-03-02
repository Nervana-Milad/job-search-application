import multer from "multer";

export const fileValidations = {
    image: ["image/jpeg", "image/png", "image/gif", "image/jfif", "image/jpg"],
    document: ["application/pdf", "application/msword"],
}

export const uploadCloudFile = (fileValidation = []) => {


    const storage = multer.diskStorage({});

    function fileFilter(req, file, cb){
        if(fileValidation.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb("In-valid file format", false)
        }
    }

    return multer({des: "tempPath", fileFilter, storage})
}