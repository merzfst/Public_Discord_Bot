const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const conf = JSON.parse(fs.readFileSync("./config.json"));

async function sendGif(message, query, title) {
  const url = `http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${conf.GIPHY_KEY}&rating=r`;
  const res = await fetch(url);
  const json = await res.json();
  const randomIndex = Math.floor(Math.random() * json.data.length);
  const randomColor = parseInt(
    Math.floor(Math.random() * 16777215).toString(16),
    16
  );
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setImage(json.data[randomIndex].images.original.url)
    .setColor(randomColor)
    .setTimestamp();

  message.channel.send({ embeds: [embed] }).catch(() => {});
}

class SendMessage {
  constructor(nameMessage, titleMessage, titleMessage2) {
    this.nameMessage = nameMessage;
    this.titleMessage = titleMessage;
    this.titleMessage2 = titleMessage2;
  }
}

const sendArray = ["kiss", "hug"];

async function sendGifs(message) {
  const createSendMessage = (index, member1, member2) => {
    switch (index) {
      case 0:
        return new SendMessage(
          sendArray[index],
          `**${member1}** *поцеловал(а)* **${member2}**`,
          "***САМОЗАСОС***"
        );
      case 1:
        return new SendMessage(
          sendArray[index],
          `**${member1}** *обнял(а)* **${member2}**`,
          "***ОДИНОЧНОЕ ОБЪЯТИЕ***"
        );
    }
  };
  const member1 = message.author.username;
  const mentionedMember = message.mentions.users.first();
  const member2 = mentionedMember
    ? mentionedMember.username
    : "no mentioned user";
  const prefix = conf.Prefix.toLowerCase();

  for (let i = 0; i < sendArray.length; i++) {
    const prefixIndex = `${prefix}${sendArray[i]}`;

    if (message.content.toLowerCase().startsWith(prefixIndex)) {
      const messageIndex = createSendMessage(i, member1, member2);

      if (messageIndex) {
        if (message.author.id == mentionedMember) {
          message.channel.send(messageIndex.titleMessage2).catch(() => {});
          return;
        }

        sendGif(message, sendArray[i], messageIndex.titleMessage);
      }

      break;
    }
  }
}

module.exports = {
  sendGifs,
};
