import {
  APIEmbed,
  EmbedBuilder,
  EmbedData,
  isJSONEncodable,
  JSONEncodable,
} from "discord.js";
export class BEmbed extends EmbedBuilder {
  constructor(data?: EmbedData | APIEmbed) {
    super(data);
  }
  static from(other: JSONEncodable<APIEmbed> | APIEmbed) {
    if (isJSONEncodable(other)) {
      return new this(other.toJSON());
    }
    return new this(other);
  }
}
