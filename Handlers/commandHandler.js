const { loadFiles } = require("../Functions/fileLoader");

async function loadCommands(client) {
  console.time("Команды загружены");
  await client.commands.clear();
  await client.subCommands.clear();

  let commandsArray = [];
  const ncommand = new Array();

  const commandFiles = await loadFiles("Commands"); // загрузка команд из папки Commands

  for (const file of commandFiles) {
    try {
      const command = require(file);
      if (command.subCommand) {
        try {
          client.subCommands.set(command.subCommand, command);
          ncommand.push({ SubCommand: command.subCommand, Status: "😊" });
        } catch (error) {
          ncommand.push({
            SubCommand: file.split("/").pop().slice(0, -3),
            Status: "😥",
          });
        }
      }
      client.commands.set(command.data.name, command);
      commandsArray.push(command.data.toJSON());
      ncommand.push({ Command: command.data.name, Status: "😊" });
      var sc = command.subCommand;
    } catch (error) {
      if (sc) {
        ncommand.push({
          Command: file.split("/").pop().slice(0, -3),
          Status: "😥",
        });
      }
    }
  }

  await client.application.commands.set(commandsArray);
  console.table(ncommand, ["Command", "Status", "SubCommand"]);
  console.info("\x1b[33m%s\x1b[0m", "Команды загружены.");
  console.timeEnd("Команды загружены");
}

module.exports = { loadCommands };
