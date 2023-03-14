const { Client, EmbedBuilder, Message, ReactionEmoji } = require("discord.js");
const fs = require("fs");
const conf = JSON.parse(fs.readFileSync("./config.json"));

module.exports = {
  name: "messageAddReaction",
  on: true,
  /**
   *
   * @param {Message} message
   * @param {Client} client
   * @param {ReactionEmoji} reaction
   */
  async execute(reaction, client) {
    // пока в разработке
  },
};
