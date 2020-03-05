import moment from "moment";
import "moment-timezone";
import G from "./config/globals";

import Moment from "moment";
import {
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { ProcDefType } from "../../db/definitions";

export const isOlderThan = (date: Date, seconds: number) =>
  !date ||
  Moment(toCurrentTimeZone(date))
    .add(seconds, "s")
    .toDate()
    .valueOf() <
    Moment(Date.now())
      .toDate()
      .valueOf();

export const isFutureDate = (date: Date) =>
  Moment(toCurrentTimeZone(date))
    .toDate()
    .valueOf() >
  Moment(Date.now())
    .toDate()
    .valueOf();

export const isAlive = (lastCheck: Date, validityFor: number = 60) =>
  Moment(toCurrentTimeZone(lastCheck))
    .add(validityFor, "s")
    .toDate()
    .valueOf() >
  Moment(Date.now())
    .toDate()
    .valueOf();

export const getProcMonItems = (items: ProcDefType[]) =>
  items.filter(r => r.PROCNAME === "PROCMON");

export const getProcMonItem = (items: ProcDefType[], serverId: string) =>
  items.find(r => r.PROCNAME === "PROCMON" && r.CSERVERID === serverId);

export const isProcMonAlive = (items: ProcDefType[], serverId: string) =>
  isAlive(getProcMonItem(items, serverId).LASTCHECK);

export const isProcMon = (item: ProcDefType) =>
  item && item.PROCNAME === "PROCMON";

export const cardIcon = (item: ProcDefType) =>
  isAlive(item.LASTCHECK) ? faCheckCircle : faTimesCircle;

export const cardColor = (item: ProcDefType) =>
  isAlive(item.LASTCHECK) ? "green" : "red";

export const clientZoneOffset = moment.parseZone(new Date()).utcOffset();
export const toCurrentTimeZone = (date: Date) =>
  moment(date).add(-G.serverZoneOffset + clientZoneOffset, "minutes");

export const properCase = function(s: string) {
  return s.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
