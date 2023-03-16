// пример загрузки функций с параметром messageCreate
const { Configuration, OpenAIApi } = require("openai");
const { Client, EmbedBuilder, Message } = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const conf = JSON.parse(fs.readFileSync("./config.json"));

async function sendGif(message, query, title) {
  //асинхронная функция для отправки гиф в канал
  const url = `http://api.giphy.com/v1/gifs/search?q=${query}&api_key=${conf.GIPHY_KEY}&rating=r`;
  const res = await fetch(url);
  const json = await res.json();
  const randomIndex = Math.floor(Math.random() * json.data.length);
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setImage(json.data[randomIndex].images.original.url)
    .setColor(randomColor)
    .setTimestamp();

  message.channel.send({
    embeds: [embed],
  });
}

class SendMessage {
  //создание объекта
  constructor(nameMessage, titleMessage, titleMessage2) {
    this.nameMessage = nameMessage; //имя сообщения по типу kiss
    this.titleMessage = titleMessage; // заголовок ответа на сообщение
    this.titleMessage2 = titleMessage2; // второй вариант ответа на сообщение
  }
}

const sendArray = [
  "kiss", //0
  "hug", //1
];

const configuration = new Configuration({
  apiKey: conf.OpenAI_KEY,
  organization: conf.OpenAI_ORG,
});

const openai = new OpenAIApi(configuration);
const userCooldowns = {}; // задержка для использования openai api
let interval;

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
          // допустимая длина символов в дискорде для ответа равна 2000
          const responseArray = responseText.match(/.{1,2000}/g);
          responseArray.forEach((responseArray) => {
            if (useReply) {
              message.reply(responseArray).catch((err) => {
                // в случае, если пользователь удалит сообщение до ответа бота, выведется ошибка
                console.log("Сообщение было удалено.");
              });
              useReply = !useReply;
            } else {
              message.channel.send(responseArray).catch((err) => {
                console.log("Сообщение было удалено.");
              });
            }
          });
        } else {
          message
            .reply(result.data.choices[0].message)
            .then((sentMessage) => {
              sentMessage.react("👍");
              sentMessage.react("👎");
            })
            .catch((err) => {
              console.log("Сообщение было удалено.");
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
    ///                          RANDOM INTERACTION EVERY 2 HOURS                         ///
    /////////////////////////////////////////////////////////////////////////////////////////
    try {
      //if (message.author.bot) return;
      if (
        message.content.startsWith(".") &&
        conf.Developers.includes(message.author.id) == true
      ) {
        if (message.content == ".stop") {
          clearInterval(interval);
          return;
        }
        const channel = message.channel; // получаем объект канала
        const guild = message.guild;
        let res = await guild.members.fetch();
        let members = Array.from(res); // получаем массив пользователей
        interval = setInterval(() => {
          let randomMember =
            members[Math.floor(Math.random() * members.length)];
          channel.send(
            `${conf.Prefix}${sendArray[1]} ${randomMember.slice(1)}`
          );
        }, 86400000);
      }
      /////////////////////////////////////////////////////////////////////////////////////////
      ///                                     KISS                                          ///
      /////////////////////////////////////////////////////////////////////////////////////////
      const member1 = message.member.displayName; // получение имени автора сообщения и упоминающегося пользователя
      const mentionedMember = message.mentions.members.first();
      const member2 = mentionedMember
        ? mentionedMember.displayName
        : "no mentioned user"; // если вдруг пользователь не упоминается
      const message0 = new SendMessage(
        sendArray[0],
        `**${member1}** *поцеловал(а)* **${member2}**`,
        "***САМОЗАСОС***"
      ); //создание нового объекта
      const message1 = new SendMessage(
        sendArray[1],
        `**${member1}** *обнял(а)* **${member2}**`,
        "***ОДИНОЧНОЕ ОБЪЯТИЕ***"
      );

      //поцелуй
      if (
        message.content.toLowerCase().startsWith(conf.Prefix + sendArray[0])
      ) {
        if (message.member.id == message.mentions.members.first().id) {
          message.channel.send(message0.titleMessage2);
          return;
        }
        sendGif(message, sendArray[0], message0.titleMessage);
      }
      //объятье
      else if (
        message.content.toLowerCase().startsWith(conf.Prefix + sendArray[1])
      ) {
        if (message.member.id == message.mentions.members.first().id) {
          message.channel.send(message1.titleMessage2);
          return;
        }
        sendGif(message, sendArray[1], message1.titleMessage);
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
