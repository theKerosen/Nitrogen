import axios from "axios";
import { BEmbed } from "../Constructors/Embed";

export class getItems {
  public item: string;
  public has_sticker: "" | 1 = "";
  public has_stattrak: "" | 1 = "";
  public is_souvenir: "" | 1 = "";
  public is_instant: "" | 1 = "";
  constructor(options: {
    item: string;
    has_sticker: "" | 1;
    has_stattrak: "" | 1;
    is_souvenir: "" | 1;
    is_instant: "" | 1;
  }) {
    this.item = options.item;
    this.has_sticker = options.has_sticker;
    this.has_stattrak = options.has_stattrak;
    this.is_souvenir = options.is_souvenir;
    this.is_instant = options.is_instant;
  }
  async run() {
    await this.getDashItems();
    await this.getAndSortDashDiscountItems();
    return await this.generateEmbeds();
  }
  async getDashItems() {
    //trocar para o link do Aridium
    const data = await axios.get(
      `http://localhost:3000/dash/${this.item}?has_stickers=${this.has_sticker}&has_stattrak=${this.has_stattrak}&is_souvenir=${this.is_souvenir}&is_instant=${this.is_instant}`
    );
    return data.data;
  }
  async getAndSortDashDiscountItems() {
    const items = await this.getDashItems();
    const filterByDiscount = items.dashQuery.filter(
      (i: typeof items) => i.discount && i.discount > 0
    );
    const sortItems = filterByDiscount.sort(
      (a: { discount: number }, b: { discount: number }) =>
        b.discount - a.discount
    );
    return sortItems;
  }
  async generateEmbeds() {
    const Items = await this.getAndSortDashDiscountItems();
    const embeds: BEmbed[] = [];
    for (const item of Items) {
      const stickers: string[] = [];

      item.stickers.forEach((e: { name: string }) => stickers.push(e.name));

      const data = new Date(item.availableAt);
      const embed = new BEmbed()
        .setTitle(item.market_hash_name)
        .setThumbnail(
          `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`
        )
        .setColor("Red")
        .addFields(
          {
            name: "💵 Preço (Dash)",
            value: `${item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 3,
            })} (${item.discount}% OFF)`,
          },
          {
            name: "📈 Float",
            value: `${item.wear_data.floatvalue ?? "Sem float"}`,
          },
          {
            name: "⏱️ Disponível quando?",
            value:
              data.getTime() - Date.now() > 0
                ? data.toLocaleString()
                : "Disponível agora!",
          },
          {
            name: "📄 Stickers",
            value: `${stickers.join(",\n") ?? "Sem Stickers"}\u200b`,
          }
        );

      embeds.push(embed);
    }
    return embeds;
  }
}
