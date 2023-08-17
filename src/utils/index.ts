import { DashScraper } from "./Client";
import { handler } from "./handler";
import { onInteraction } from "../events/onInteraction";
import { Init } from "../events/Init";
import { Events } from "discord.js";
const client = new DashScraper();
client.mongoConnect();
client.login();
handler();

client.once(Events.ClientReady, async () => await Init(client));
client.on(Events.InteractionCreate, async (interaction) => {
  await onInteraction(interaction, client);
});
export { client };
