import {
  ButtonStyle,
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../utils/command";
import { BButton } from "../Constructors/Button";
import { getItems } from "../utils/API";

export = {
  data: new SlashCommandBuilder()
    .setName("dash")
    .setDescription("Procure items no BUFF & DashStore...")
    .addStringOption((sub) =>
      sub
        .setName("item")
        .setDescription("Pesquise qualquer item!")
        .setRequired(true)
    )
    .addIntegerOption((sub) =>
      sub
        .setName("apenas_instantâneo")
        .setDescription(
          "Procurar armas que podem ser retiradas instantaneamente?"
        )
        .addChoices(
          {
            name: "Sim",
            value: 1,
          },
          {
            name: "Não",
            value: 0,
          }
        )
    )
    .addIntegerOption((sub) =>
      sub
        .setName("apenas_stattrak")
        .setDescription("Procurar apenas armas com/sem stattrak?")
        .addChoices(
          {
            name: "Sim",
            value: 1,
          },
          {
            name: "Não",
            value: 0,
          }
        )
    )
    .addIntegerOption((sub) =>
      sub
        .setName("apenas_souvenir")
        .setDescription("Procurar/ignorar armas souvenir?")
        .addChoices(
          {
            name: "Sim",
            value: 1,
          },
          {
            name: "Não",
            value: 0,
          }
        )
    )
    .addIntegerOption((sub) =>
      sub
        .setName("apenas_stickers")
        .setDescription("Procurar apenas armas com/sem stickers?")
        .addChoices(
          {
            name: "Sim",
            value: 1,
          },
          {
            name: "Não",
            value: 0,
          }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction, client) {
    await interaction.deferReply({ ephemeral: true });
    const search = interaction.options.getString("item") ?? "redline";

    const instant = interaction.options.getInteger("apenas_instantâneo");
    const stattrak = interaction.options.getInteger("apenas_stattrak");
    const souvenir = interaction.options.getInteger("apenas_souvenir");
    const stickers = interaction.options.getInteger("apenas_stickers");

    const GlobalPages = await new getItems({
      item: search,
      has_stattrak: stattrak === null ? "" : 1,
      has_sticker: stickers === null ? "" : 1,
      is_instant: instant == null ? "" : 1,
      is_souvenir: souvenir === null ? "" : 1,
    }).run();

    const pages = {} as { [key: string]: number };
    pages[interaction.user.id] = pages[interaction.user.id] || 0;

    const Rows = (id: string) => {
      return new BButton()
        .addButton({
          customId: "previous",
          emoji: "<:previous_page:1098891318572363877>",
          style: ButtonStyle.Success,
          disabled: pages[id] === 0,
        })
        .addButton({
          customId: "next",
          emoji: "<:next_page:1098891315611193364>",
          style: ButtonStyle.Success,
          disabled: pages[id] === GlobalPages.length - 1,
        });
    };
    await interaction.editReply({
      embeds: [GlobalPages[pages[interaction.user.id]]],
      components: [Rows(interaction.user.id)],
    });
    const filterIn = (i: Interaction) => i.user.id === interaction.user.id;
    const collector = interaction.channel?.createMessageComponentCollector({
      filter: filterIn,
      time: 120000,
    });

    collector?.on("collect", async (buttonI) => {
      buttonI.deferUpdate();

      if (buttonI.customId === "previous" && pages[interaction.user.id] > 0)
        --pages[interaction.user.id];

      if (
        buttonI.customId === "next" &&
        pages[interaction.user.id] < GlobalPages.length - 1
      )
        ++pages[interaction.user.id];

      await interaction.editReply({
        embeds: [GlobalPages[pages[interaction.user.id]]],
        components: [Rows(interaction.user.id)],
      });
    });

    setTimeout(async () => {
      await interaction.editReply({
        content: "Sua sessão expirou.",
        embeds: [],
        components: [],
      });
    }, 120000);
  },
} as Command;
