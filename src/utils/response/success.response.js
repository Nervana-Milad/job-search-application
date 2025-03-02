export const successRespone = ({res, statusCode=200, message="Done", data={}}={})=>{
    return res.status(statusCode).json({message, data})
}