const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const conf = JSON.parse(fs.readFileSync("./config.json"));

async function demotivator(message) {
  if (!message.attachments.size) {
    return message.channel.send("Прикрепи изображение.");
  }

  const input = message.content
    .slice(conf.Prefix.length + "demotivator".length)
    .trim();
  const text = input.length > 0 ? input : "";

  const canvas = Canvas.createCanvas(1920, 1080);
  const context = canvas.getContext("2d");

  const background = await Canvas.loadImage("./images/demotivator.jpg");
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const attachment = message.attachments.first();
  const image = await Canvas.loadImage(attachment.url);
  context.drawImage(image, 185, 85, 1550, 730);

  const maxTextWidth = 1920;
  const maxTextHeight = 200;
  const words = text.split(" ");

  let fontSize = 100;
  let textFits = false;

  while (!textFits && fontSize > 0) {
    context.font = `${fontSize}px Arial`;

    let testLine = "";
    let testHeight = 0;

    for (let i = 0; i < words.length; i++) {
      const testLineWidth = context.measureText(
        testLine + words[i] + " "
      ).width;

      if (testLineWidth > maxTextWidth) {
        testHeight += fontSize * 1.4;
        testLine = words[i] + " ";
      } else {
        testLine += words[i] + " ";
      }
    }

    testHeight += fontSize * 1.4;

    if (testHeight <= maxTextHeight) {
      textFits = true;
    } else {
      fontSize--;
    }
  }

  if (!textFits) {
    return message.channel.send("Текст не помещается на изображение.");
  }

  context.fillStyle = "#fff";
  context.font = `${fontSize}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  let line = "";
  let y = 880;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const testLineWidth = context.measureText(testLine).width;

    if (testLineWidth > maxTextWidth) {
      context.fillText(line, canvas.width / 2, y);
      line = words[i] + " ";
      y += fontSize * 1.4;
    } else {
      line = testLine;
    }
  }

  context.fillText(line, canvas.width / 2, y);
  const attachmentBuilder = new AttachmentBuilder(await canvas.encode("png"), {
    name: "demotivator.png",
  });
  message.channel.send({ files: [attachmentBuilder] });
}

module.exports = {
  demotivator,
};
