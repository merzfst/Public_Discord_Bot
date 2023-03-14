const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Перезагрузка твоих команд/ивентов.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName("events").setDescription("Перезагрузка твоего ивента.")
    )
    .addSubcommand((options) =>
      options.setName("commands").setDescription("Перезагрузка твоих команд.")
    ),
};
