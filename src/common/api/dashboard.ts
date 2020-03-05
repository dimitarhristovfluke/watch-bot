import axios from "axios";
import Moment from "moment";
import * as env from "dotenv";
import G from "../config/globals";
import {
  post,
  buildSlackMessage,
  SlackAttachmentField
} from "../../../integrations/slack";
import { ProcessInfo } from "../types";
import { isOlderThan } from "../functions";

env.config();

export const DashboardCheck = function() {
  axios
    .get(`${process.env.SERVER_URL}/api/dashboard`)
    .then((response: any) => {
      const data: ProcessInfo[] = response.data;

      data.map(p => {
        switch (p.PROCESSID.toUpperCase()) {
          case "PROCMON":
            DoProcMonValidation(p);
            break;
          default:
            ValidateProcess(p);
            break;
        }
      });
      console.log(`${process.env.SERVER_URL}/api/dashboard - DONE`);
    })
    .catch((error: any) => {
      console.log("error");
    });
};

const sendSlackMessage = (
  appName: string,
  msg: string,
  priority: string,
  fields: SlackAttachmentField[]
) => post(buildSlackMessage(appName, msg, undefined, priority, fields));

const sendProcMonAlert = (p: ProcessInfo, fields: SlackAttachmentField[]) => {
  sendSlackMessage(
    `${p.PNAME} (${p.PROCESSID})`,
    `ProcMon is not running on ${p.CSERVERID}`,
    "High",
    fields
  );
};

const hasStalled = (p: ProcessInfo) =>
  p.PENDING && isOlderThan(p.LASTCHECK, 300);

const hasErrors = (p: ProcessInfo) => !!p.ERRORS;

const DoProcMonValidation = (p: ProcessInfo) => {
  if (hasErrors(p))
    sendSlackMessage(
      `${p.PNAME} (${p.PROCESSID})`,
      `ProcMon is not running on ${p.CSERVERID}`,
      "High",
      buildProcmonInfo(p)
    );
};
const ValidateProcess = (p: ProcessInfo) => {
  const priority = hasStalled(p) ? "High" : hasErrors(p) ? "Medium" : "";
  if (priority.length) {
    switch (priority) {
      case "High":
        sendSlackMessage(
          `${p.PNAME} (${p.PROCESSID})`,
          `${p.PNAME} has stalled `,
          "High",
          buildInfo(p, priority)
        );
        break;
      case "Medium":
        sendSlackMessage(
          `${p.PNAME} (${p.PROCESSID})`,
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
    title: "Last known process run at",
    value: Moment(p.LASTCHECK).format(G.dateTimeFormat),
    short: true
  },
  {
    title: "Pending",
    value: (p.PENDING || 0).toString(),
    short: true
  },
  {
    title: "Errors",
    value: (p.ERRORS || 0).toString(),
    short: true
  }
];

const buildProcmonInfo = (p: ProcessInfo): SlackAttachmentField[] => [
  {
    title: "Last known process run at",
    value: Moment(p.LASTCHECK).format(G.dateTimeFormat),
    short: true
  }
];
