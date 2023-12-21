const { Client, Message } = require("discord.js");
const pool = require("../../Functions/poolMySQL");

module.exports = {
  name: "messageCreate",
  on: true,
  /**
   *
   * @param {Message} message
   * @param {Client} client
   *
   */
  async execute(message, client) {
    const config = client.config;
    if (
      message.content.startsWith("!") ||
      message.content.includes(client.user.id) ||
      message.mentions.has(client.user)
    ) {
      const { chatGPT } = require("./Conditions/chatGPT.js");
      chatGPT(message, client);
    }

    if (message.content.toLowerCase().startsWith(config.Prefix + "avatar")) {
      const { avatar } = require("./Conditions/avatar.js");
      avatar(message, client);
    }
    if (
      message.content.toLowerCase().startsWith(config.Prefix + "demotivator")
    ) {
      const { demotivator } = require("./Conditions/demotivator.js");
      demotivator(message);
    }
    if (message.content.toLowerCase().startsWith(config.Prefix + "question")) {
      const { questions } = require("./Conditions/questions+leaderboard.js");
      questions(message, client, pool);
    }
    if (
      message.content
        .toLowerCase()
        .startsWith(config.Prefix + "leaderboardquestion")
    ) {
      const { leaderboard } = require("./Conditions/questions+leaderboard.js");
      leaderboard(message, client, pool);
    }
    const { sendGifs } = require("./Conditions/sendGifs.js");
    sendGifs(message);
  },
};
