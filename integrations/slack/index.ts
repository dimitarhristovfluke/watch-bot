import axios from "axios";
import Moment from "moment";
import env from "dotenv";
env.config();

const webHookUrl = process.env.SLACK_WEBHOOK_URL;

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
      process.stdout.write(`posting to slack - ${webHookUrl}\n`);
    })
    .catch((error: any) => {
      process.stdout.write(" - error sending slack message\n");
    });
};
