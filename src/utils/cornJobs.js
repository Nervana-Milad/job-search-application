import cron from "node-cron";
import { asyncHandler } from "./response/error.response.js";
import { userModel } from "../DB/model/User.model.js";
import * as dbService from "../DB/db.service.js";

const deleteExpiredOTPs = asyncHandler(async () => {
  const currentTime = new Date();

  const result = await dbService.updateMany({
    model: userModel,
    filter: { "OTP.expiresIn": { $lt: currentTime } },
    data: { $pull: { OTP: { expiresIn: { $lt: currentTime } } } },
  });

  console.log(`Deleted ${result.modifiedCount} expired OTPs at ${currentTime}`);
});

cron.schedule(
  "0 */6 * * *",
  () => {
    deleteExpiredOTPs().catch((error) => {
      console.error("Error in CRON job:", error);
    });
  },
  {
    timezone: "UTC",
  }
);

console.log("CRON job scheduled to delete expired OTPs every 6 hours.");
