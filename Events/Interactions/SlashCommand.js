const { ChatInputCommandInteraction } = require("discord.js");
const fs = require("fs");
const conf = JSON.parse(fs.readFileSync("./config.json"));

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "Эта команда устаревшая.",
        ephemeral: true,
      });

    if (command.developer && !conf.Developers.includes(interaction.user.id))
      return interaction.reply({
        content: "Эта команда доступна только для разработчика.",
        ephemeral: true,
      });

    const subCommand = interaction.options.getSubcommand(false);
    if (subCommand) {
      const subCommandFile = client.subCommands.get(
        `${interaction.commandName}.${subCommand}`
      );
      if (!subCommandFile)
        return interaction.reply({
          content: "Эта sub-команда устарела.",
          ephemeral: true,
        });
      subCommandFile.execute(interaction, client);
    } else command.execute(interaction, client);
  },
};
