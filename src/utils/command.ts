import {
  CommandInteraction,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { DashScraper } from "../utils/Client";

export interface Command {
  data: SlashCommandBuilder;
  execute(
    interaction: CommandInteraction | ChatInputCommandInteraction,
    client?: DashScraper
  ): Promise<void>;
}
