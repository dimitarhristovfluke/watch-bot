import axios from "axios";
import Moment from "moment";
import * as env from "dotenv";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import G from "../config/globals";
import {
  post,
  buildSlackMessage,
  SlackAttachmentField
} from "../../../integrations/slack";
import { ProcessInfo } from "../types";
import { isOlderThan } from "../functions";
import moment from "moment";

env.config();

// Add locale-specific relative date/time formatting rules.
TimeAgo.addLocale(en);

// Create relative date/time formatter.
const timeAgo = new TimeAgo("en-US");

export const DashboardCheck = function() {
  process.stdout.write(`${process.env.SERVER_URL}/api/dashboard...`);
  axios
    .get(`${process.env.SERVER_URL}/api/dashboard`)
    .then((response: any) => {
      const data: ProcessInfo[] = response.data;

      data.map(p => {
        switch (p.processid.toUpperCase()) {
          case "PROCMON":
            DoProcMonValidation(p);
            break;
          default:
            ValidateProcess(p);
            break;
        }
      });
      process.stdout.write(`done\n`);
    })
    .catch((error: any) => {
      process.stdout.write("error\n");
    });
};

const sendSlackMessage = (
  appName: string,
  msg: string,
  priority: string,
  fields: SlackAttachmentField[]
) => post(buildSlackMessage(undefined, msg, undefined, priority, fields)); // appname was appName

const sendProcMonAlert = (p: ProcessInfo, fields: SlackAttachmentField[]) => {
  sendSlackMessage(
    `${p.pname} (${p.processid})`,
    `ProcMon is not running on ${p.cserverid}`,
    "High",
    fields
  );
};

const hasStalled = (p: ProcessInfo) =>
  p.stalled > 0 || (p.pending && isOlderThan(p.lastcheck, 300));

const hasErrors = (p: ProcessInfo) => !!p.errors;

const DoProcMonValidation = (p: ProcessInfo) => {
  if (hasStalled(p) && process.env.ALERT_ON_STALLED == "yes")
    sendSlackMessage(
      undefined,
      `ProcMon is not running on ${p.cserverid}`,
      "High",
      buildProcmonInfo(p)
    );
};
const ValidateProcess = (p: ProcessInfo) => {
  const priority = hasStalled(p) ? "High" : hasErrors(p) ? "Medium" : "";
  if (priority.length) {
    switch (priority) {
      case "High":
        if (process.env.ALERT_ON_STALLED == "yes")
          sendSlackMessage(
            undefined,
            `${p.pname} has stalled `,
            "High",
            buildInfo(p, priority)
          );
        break;
      case "Medium":
        if (process.env.ALERT_ON_ERROR == "yes")
          sendSlackMessage(
            `${p.pname} (${p.processid})`,
            `One or more processes completed with errors`,
            "Medium",
            buildInfo(p, priority)
          );
        break;
    }
  }
};

const buildInfo = (
  p: ProcessInfo,
  priority: string
): SlackAttachmentField[] => [
  {
    title: "Priority",
    value: priority,
    short: true
  },
  {
    title: "Last known process run",
    value: timeAgo.format(moment(p.lastcheck).toDate()),
    short: true
  },
  {
    title: "Pending",
    value: (p.pending || 0).toString(),
    short: true
  },
  {
    title: "Errors",
    value: (p.errors || 0).toString(),
    short: true
  }
];

const buildProcmonInfo = (p: ProcessInfo): SlackAttachmentField[] => [
  {
    title: "Last known process run ",
    value: timeAgo.format(moment(p.lastcheck).toDate()),
    short: true
  }
];
