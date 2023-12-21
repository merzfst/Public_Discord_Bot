const { loadFiles } = require("../Functions/fileLoader");

async function loadEvents(client) {
  console.time("Ивенты загружены");

  client.event = new Map();
  const events = new Array();
  const skippedEvents = new Array();

  const files = await loadFiles("Events");

  for (const file of files) {
    try {
      const event = require(file);

      if (event.execute && typeof event.execute === "function") {
        const execute = (...args) => event.execute(...args, client);
        const target = event.rest ? client.rest : client;

        target[event.once ? "once" : "on"](event.name, execute);
        client.events.set(event.name, execute);

        events.push({ Event: event.name, Status: "💚" });
      } else {
        skippedEvents.push({
          Event: file.split("\\").pop().slice(0, -3), // mb instead \\ nedd /
          Status: "💛",
        });
      }
    } catch (error) {
      events.push({ Event: file.split("/").pop().slice(0, -3), Status: "⚠" });
    }
  }

  console.table(events, ["Event", "Status"]);
  console.info("\x1b[36m%s\x1b[0m", "Ивенты загружены.");
  console.table(skippedEvents, ["Event", "Status"]);
  console.info("\x1b[36m%s\x1b[0m", "Отдельные модули загружены.");
  console.timeEnd("Ивенты загружены");
}

module.exports = { loadEvents };
