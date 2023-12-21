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
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=0s", //😀
    });

    loadCommands(client);
  },
};
