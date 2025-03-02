import multer from "multer";
import path from "node:path";
import fs from "node:fs";


export const fileValidations = {
    image: ["image/jpeg", "image/png", "image/gif", "image/jfif", "image/jpg"],
    document: ["application/pdf", "application/msword"],
}

export const uploadFileDisk = (customPath = "general", fileValidation = []) => {
    const basePath = `uploads/${customPath}`;
    const fullPath = path.resolve(`./src/${basePath}`)

    if(!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath, {recursive: true});
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            cb(null, fullPath);
        },
        filename: (req, file, cb)=>{
            const finalFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + file.originalname;
            file.finalPath = basePath+"/"+finalFileName
            cb(null, finalFileName);
        },
    });

    function fileFilter(req, file, cb){
        if(fileValidation.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb("In-valid file format", false)
        }
    }

    return multer({des: "tempPath", fileFilter, storage})
}