const { ChatInputCommandInteraction, Client } = require("discord.js");
const fs = require("fs");
const { loadCommands } = require("../../../Handlers/commandHandler");

module.exports = {
  subCommand: "base.serverlist",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const guilds = client.guilds.cache.map(async (guild) => ({
      // создание массива серверов на котором находится бот и запись краткой информации о сервере и его владельце в память
      name: guild.name,
      id: guild.id,
      owner: {
        id: await guild
          .fetchOwner()
          .then((owner) => owner.user.id)
          .catch(() => null),
        tag: await guild
          .fetchOwner()
          .then((owner) => owner.user.tag)
          .catch(() => null),
      },
    }));

    const json = JSON.stringify(await Promise.all(guilds), null, 2);

    fs.writeFile("guilds.json", json, (err) => {
      if (err) {
        interaction.reply({
          content: "Ошибка при сохранении файла!",
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: "Список серверов успешно сохранен!",
          ephemeral: true,
        });
      }
    });
  },
};
