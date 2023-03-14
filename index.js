require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  IntentsBitField,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember,
  ],
});

const { loadEvents } = require("./Handlers/eventHandler");

client.config = require("./config.json");
client.commands = new Collection();
client.subCommands = new Collection();
client.events = new Collection();

loadEvents(client);

client.login(client.config.token);
