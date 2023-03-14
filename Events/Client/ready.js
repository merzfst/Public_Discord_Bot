const { loadCommands } = require("../../Handlers/commandHandler");
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log("Клиент уже готов.");
    client.user.setActivity({
      name: "Название_Стрима",
      type: ActivityType.Streaming,
      url: "", // любая ссылка с ютуба, либо с твитча
    });

    loadCommands(client);
  },
};
