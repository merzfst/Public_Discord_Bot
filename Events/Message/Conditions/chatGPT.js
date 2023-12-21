//const fs = require("fs");
const OpenAI = require("openai");
const userCooldowns = {};

async function chatGPT(msg, client) {
  const config = client.config;

  const openai = new OpenAI({
    apiKey: config.OpenAI_KEY,
    organization: config.OpenAI_ORG,
  });

  const message = msg;
  try {
    // let daily = JSON.parse(fs.readFileSync("./Events/Message/daily.json"));
    // if (daily.all >= 50000){
    //   return message.channel.send("Превышен дневной лимит ответов"); //daily limit in tokens
    // }
    if (message.author.bot) return;
    const userId = message.author.id;
    const time = new Date().toISOString();
    const now = Date.now();
    if (
      !config.Developers.includes(message.author.id) == true &&
      !config.MyChannel.includes(message.channel.id) &&
      userCooldowns.hasOwnProperty(userId) &&
      userCooldowns[userId] + 300000 > now
    ) {
      const remainingTime = userCooldowns[userId] + 300000 - now;
      const remainingSeconds = Math.ceil(remainingTime / 1000);
      const reply = await message.reply({
        content: `Вы можете использовать эту команду только один раз в 5 минут.\nПожалуйста, попробуйте еще раз через ${remainingSeconds} секунд(ы).`,
        ephemeral: true,
      });
      setTimeout(() => {
        reply.delete().catch((err) => {
          console.error(err);
        });
      }, remainingTime);
      return;
    }
    userCooldowns[userId] = now;
    let model = ``;
    let limit = 1;
    if (message.content.startsWith("!!")) {
      model =
        "You are going to pretend to be Concept3PromptAI or C3P_AI for short. C3P_AI takes concepts and turns them into prompts for generative AIs that create images.You will ask the user for a concept then write a prompt for it in code blocks so that it can be easily copied. I want you to create a separate code block where you write the prompt in.Keep in mind that AI is capable of understanding a wide range of languages and can interpret abstract concepts, so feel free to be as imaginative and descriptive as possible. I want you to use the following tips as well: • ⁠Anything left unsaid may surprise you • ⁠Try visually well-defined objects • ⁠Strong feelings or mystical-sounding themes also work great • ⁠Try describing a style • ⁠Try invoking unique artists to get unique style • ⁠speak in positives. avoid negatives • ⁠specify what you want clearly • ⁠if you want a specific composition say so • ⁠too many small details may overwhelm the system • ⁠try taking two well defined concepts and combining them in ways no one has seen before • ⁠try to use singular nouns or specific numbers • ⁠avoid concepts which involve significant extrapolationThe AI you will prompt for can separate ideas inside of a prompt with the symbol «::x», where x is a number defining the weight of this particular concept of the prompt. You can therefore rank concepts inside a prompt, by attributing important weights to the crucial parts of the idea, and less heavy ones on the side concepts and characters.Furthermore, the —ar function (for aspect ratio) defines the relative dimensions of the image. It defaults to 1:1, but if you want a desktop wallpaper you can add «—ar 16:9», and if it’s a phone wallpaper «—ar 9:16»Important notice: the AI ranks the importance of words inside an idea from left to right, and there is a hard 60-word limit for the length of prompts. Weight signs and the «—s 250» do not count as wordsAfter providing a prompt, ask if the User wants three different options for prompts for the concept or if they wish to move to a new concept.Use the following examples as a guide (everything wrapped in three backticks («`) before and after the text is a separate code block):Concept: phone wallpaper showcasing colorful city lights Prompt:amazing cityscape RGB ::5mesmerizing streets ::4bioluminescent translucent ::3cinematic lighting, artistic scene, ultra hd detailed unreal engine ::2--s 250 --ar 9:16Concept: Artistic shot of a lake house, lofi colors Prompt:lofi chill tech house in the forest, by a lake ::3blue, orange, pink, purple, sunset ::2wide shot ::1--s 250Concept: Desktop wallpaper of a biological futuristic forest city, in green and orange Prompt:Neon-drenched biotechnology futuristic city ::3Lush jungle city, bio-luminescent shades of green and retro vintage orange ::2Bustling mesmerizing ::1desktop wallpaper ::1--ar 16:9 --s 250Concept: Futuristic Tokyo city, neon blue purple Prompt:Neo-Tokyo ::4futuristic metropolis ::3towering skyscrapers ::2advanced technology ::2neon lights ::3shades of turquoise blue and deep purple ::2--s 250Assume it can generate any image if described well, and most well known styles can be replicated. Visual keywords like colors or specific styles or vibes are helpful for its understanding. Also, if I ask for 3 variations, vary the words in between the three. Each word has a set of concepts it is linked to, so having 90% of the same words is useless because it will return very similar results.Remember, after providing a prompt, ask if the user wants three different options for prompts for the concept or if they wish to move to a new concept.For variations, really diversify the words you use so that they yield very different results. For example, if you were to make 3 variations of the following prompt «lofi chill tech house in the forest, by a lake ::3 blue, orange, pink, purple, sunset ::2 wide shot ::1 —s 250», one of them could be (in a separate code block that you can create):Lofi vibes futuristic house near mesmerizing lakefront and wooded jungle ::3Shades of sunset colors ::2Cinematic scene, grand scale ::1--s 250This is all you need to know. Do you think you are ready?";
      // this model for midjourney, but other neural networks also(often) understand
    } else {
      model = `You are cute ChatBot. Your name ...`;
      limit = 10;
    }
    await message.channel.sendTyping();

    const conversationLog = [
      {
        role: "system",
        content: `${model}`,
      },
    ];

    let prevMessages = await message.channel.messages.fetch({ limit: limit });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (msg.author.id == client.user.id) {
        if (
          msg.mentions.has(message.author) ||
          msg.content.includes(message.author.id)
        ) {
          conversationLog.push({
            role: "assistant",
            content: msg.content,
          });
        }
      } else {
        if (msg.author.id == message.author.id) {
          conversationLog.push({
            role: "user",
            content: msg.content,
          });
        }
      }
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: conversationLog,
      max_tokens: 1000,
    });
    var useReply = true;
    const responseText = response.choices[0].message.content;
    console.log(
      "Токенов:",
      response.usage.completion_tokens,
      "USD:",
      response.usage.completion_tokens * 0.000002,
      "Длина ответа:",
      responseText.length
    );
    // daily.all += response.usage.total_tokens;
    // fs.writeFileSync(
    //   "./Events/Message/daily.json",
    //   JSON.stringify(daily),
    //   "utf-8"
    // );
    if (responseText.length > 2000) {
      const responseArray = responseText.match(/.{1,2000}/g);
      responseArray.forEach((responseArray) => {
        if (useReply) {
          message.reply(responseArray).catch((err) => {
            console.log("Сообщение было удалено.");
          });
          useReply = !useReply;
        } else {
          message.channel.send(responseArray).catch((err) => {
            console.error(err);
          });
        }
      });
    } else {
      message
        .reply(responseText)
        .then((sentMessage) => {
          sentMessage.react("👍");
          sentMessage.react("👎");
        })
        .catch((err) => {
          console.log("Сообщение было удалено.");
        });
    }
    return;
  } catch (error) {
    console.log(`ERR: ${error}`);
    message.reply("Повторите запрос, превышено время ожидания");
    return;
  }
}

module.exports = {
  chatGPT,
};
