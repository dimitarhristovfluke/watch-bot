import axios from "axios";
import Moment from "moment";
import G from "../../src/common/config/globals";

const webHookUrl =
  "https://hooks.slack.com/services/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";

export interface SlackAttachmentField {
  title: string;
  value: string;
  short: boolean;
}
interface SlackAttachment {
  fallback: string;
  color: string;
  pretext?: string;
  author_name: string;
  author_link: string;
  author_icon: string;
  title: string;
  text: string;
  fields: SlackAttachmentField[];
}
interface SlackPayload {
  username?: string;
  channel?: string;
  attachments: SlackAttachment[];
}

export const buildSlackMessage = (
  serviceApp: string,
  title: string,
  text: string,
  priority: string,
  fields: SlackAttachmentField[]
) => {
  const slackMessage: SlackPayload = {
    username: "X4 Service Watcher ",
    channel: "#x4alarms-t1-zone",
    attachments: [
      {
        fallback: text,
        color: priority == "High" ? "#ff0000" : "#ffbf00",
        author_name: serviceApp,
        author_link: "http://flickr.com/bobby/",
        author_icon: "http://flickr.com/icons/bobby.jpg",
        title,
        text,
        fields: fields
      }
    ]
  };
  return slackMessage;
};

/* [
          {
            title: "Priority",
            value: priority,
            short: true
          },
          {
            title: "Last known process run at",
            value: Moment(lastCheck).format(G.dateTimeFormat),
            short: true
          }
        ]*/

export const post = (payload: SlackPayload) => {
  axios
    .post(webHookUrl, payload)
    .then((response: any) => {
      //
    })
    .catch((error: any) => {
      console.log("error sending slack message");
    });
};
