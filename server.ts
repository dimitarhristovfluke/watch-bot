import { DashboardCheck } from "./src/common/api/dashboard";
import * as env from "dotenv";
env.config();

setInterval(DashboardCheck, parseInt(process.env.INTERVAL) * 1000);
