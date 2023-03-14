// пример загрузки функций с параметром messageCreate
const { Configuration, OpenAIApi } = require("openai");
const { Client, EmbedBuilder, Message } = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const conf = JSON.parse(fs.readFileSync("./config.json"));

const configuration = new Configuration({
  apiKey: conf.OpenAI_KEY,
  organization: conf.OpenAI_ORG,
});

const openai = new OpenAIApi(configuration);
const userCooldowns = {}; // задержка для использования apenai api

module.exports = {
  name: "messageCreate",
  on: true,
  /**
   *
   * @param {Message} message
   * @param {Client} client
   *
   */
  async execute(message, client) {
    try {
      if (message.content.startsWith("!")) {
        if (message.author.bot) return;
        const userId = message.author.id;
        const now = Date.now();
        if (
          !conf.Developers.includes(message.author.id) == true &&
          !(message.channel.id === conf.MyChannel) &&
          userCooldowns.hasOwnProperty(userId) &&
          userCooldowns[userId] + 60000 > now // проверяем, прошла ли уже минута с момента последнего использования функции
        ) {
          const remainingTime = userCooldowns[userId] + 60000 - now;
          const remainingSeconds = Math.ceil(remainingTime / 1000);
          const reply = await message.reply({
            content: `Вы можете использовать эту команду только один раз в минуту.\nПожалуйста, попробуйте еще раз через ${remainingSeconds} секунд(ы).`,
            ephemeral: true,
          });
          setTimeout(() => {
            reply.delete();
          }, remainingTime);
          return;
        }
        userCooldowns[userId] = now;

        let conversationLog = [
          {
            role: "system",
            content: "You are a frendly chatbot.", // задание поведения боту
          },
        ];

        await message.channel.sendTyping();

        let prevMessages = await message.channel.messages.fetch({ limit: 15 });
        prevMessages.reverse(); // извлечение последних 15 сообщений пользователя, и их реверс

        prevMessages.forEach((msg) => {
          if (!message.content.startsWith("!")) return;
          if (msg.author.id !== client.user.id && message.author.bot) return;
          if (msg.author.id !== message.author.id) return;

          conversationLog.push({
            role: "user",
            content: msg.content, // запись всех 15 сообщений боту в "память"
          });
        });

        const result = await openai
          .createChatCompletion({
            model: "gpt-3.5-turbo", // использование модели бота из openai api
            messages: conversationLog,
            max_tokens: 1500, // лимит допустимых символов, однако ограничение не воспринимается. символы пишутся вплоть до 6000, больше не доводилось увидеть
          })
          .catch((error) => {
            console.log(`OPENAI ERR: ${error}`);
          });
        let useReply = true;
        const responseText = result.data.choices[0].message.content;
        console.log(responseText.length); // вывод длины сообщения данного чатботом
        if (responseText.length > 2000) {
          // допустимая длина символов в дискогда для ответа равна 2000
          const responseArray = responseText.match(/.{1,2000}/g);
          responseArray.forEach((responseArray) => {
            if (useReply) {
              message.reply(responseArray);
              useReply = !useReply;
            } else {
              message.channel.send(responseArray);
            }
          });
        } else {
          message.reply(result.data.choices[0].message).then((sentMessage) => {
            sentMessage.react("👍");
            sentMessage.react("👎");
          });
        }
        return;
      }
    } catch (error) {
      console.log(`ERR: ${error}`);
      message.reply("Повторите запрос, превышено время ожидания"); // 99% ошибок error 429
      return;
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    ///                                     KISS                                          ///
    /////////////////////////////////////////////////////////////////////////////////////////
    try {
      if (message.content.toLowerCase().startsWith("a!kiss")) {
        const url = `http://api.giphy.com/v1/gifs/search?q=${"kiss"}&api_key=${
          conf.GIPHY_KEY
        }&rating=r`;
        const member1 = message.member.displayName;
        const member2 = message.mentions.members.first().displayName;
        if (message.member.id == message.mentions.members.first().id) {
          message.channel.send("***Поцеловал... Себя?***");
          return;
        }
        const res = await fetch(url); // извлечение ссылки из giphy.com, получение случайной гиф и преобразование её для дискорда
        const json = await res.json();
        const randomIndex = Math.floor(Math.random() * json.data.length);
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        const embed = new EmbedBuilder()
          .setTitle(`**${member1}** *поцеловал(а)* **${member2}**`)
          .setImage(json.data[randomIndex].images.original.url)
          .setColor(randomColor)
          .setFooter({
            text: "Powered By Giphy.com",
            url: "https://i.imgur.com/kXy7KSf.png",
          });

        message.channel.send({
          embeds: [embed],
        });
        return;
      }
      /////////////////////////////////////////////////////////////////////////////////////////
      ///                                     MIND                                          ///
      /////////////////////////////////////////////////////////////////////////////////////////
      if (message.content.includes(client.user.id)) {
        // при упоминании бота в сообщении выводит случайную запись из массива
        const answers = ["Да! Это я!"];
        const randomIndex = Math.floor(Math.random() * answers.length);
        message.reply(`**${answers[randomIndex]}**`);
      }
    } catch (error) {
      console.log(error);
    }
  },
};
