const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Помощь с командами"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction) {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    const embed = new EmbedBuilder()
      .setTitle(`**ДОСТУПНЫЕ ОБРАЩЕНИЯ К БОТУ**`)
      .setDescription("Здесь вы найдете список доступных команд.")
      .addFields(
        {
          name: "!",
          value:
            "Восклицательный знак перед предложением вызовет ответ чат гпт",
        },
        { name: "a!kiss *@member*", value: "Поцеловать кого-то" }
      )
      .setColor(randomColor)
      .setTimestamp();
    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
