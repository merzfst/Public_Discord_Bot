const Canvas = require("@napi-rs/canvas");
const {
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const fs = require("fs");

const { request } = require("undici");

async function questions(message, client, pool) {
  const config = client.config;
  const args = message.content.slice(config.Prefix.length).trim().split(/\s+/);
  let counter1 = 1;
  if (args.length > 1) {
    counter1 = parseInt(args[1]);
    if (isNaN(counter1)) {
      counter1 = 1;
    }
  }
  let counter = 1;

  const answerQuestion = async () => {
    if (counter <= counter1) {
      const data = JSON.parse(
        fs.readFileSync("./Events/Message/questions.json")
      );

      if (
        message.content
          .toLowerCase()
          .startsWith(config.Prefix + "questionid") &&
        config.Developers.includes(message.author.id) == true
      ) {
        data.forEach((data, index) => {
          data.id = index + 1;
        });
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync("./Events/Message/questions.json", jsonString);
        message.reply("Id вопросов обновлено!");
        return;
      }

      try {
        const connection = await pool.getConnection();
        const [answeredQuestions, flags] = await connection.query(
          `SELECT question_id FROM answered_questions WHERE user_id = '${message.author.id}'`
        );
        const answeredQuestionIds = answeredQuestions.map(
          (row) => row.question_id
        );
        const filteredData = data.filter(
          (question) => !answeredQuestionIds.includes(question.id)
        );
        if (filteredData.length === 0) {
          message.reply("Вы ответили на все вопросы!");
          return;
        }

        const randomIndex = Math.floor(Math.random() * filteredData.length);
        const questionData = filteredData[randomIndex];
        const { answer, options, question } = questionData;
        const row = new ActionRowBuilder();

        const buttons = [];

        for (let i = 0; i < options.length; i++) {
          buttons.push(
            new ButtonBuilder()
              .setCustomId(`${i + 1}`)
              .setLabel(options[i])
              .setStyle(ButtonStyle.Primary)
          );
        }

        row.addComponents(buttons);

        const sentMessage = await message.reply({
          content: question,
          components: [row],
        });

        const filter = (interaction) => {
          if (interaction.message.id === sentMessage.id) return true;
          return false;
        };

        const collector = message.channel.createMessageComponentCollector({
          filter,
          time: 15000,
        });

        collector.on("collect", async (interaction) => {
          if (interaction.user.id !== message.author.id) {
            return;
          }
          const selectedOptionIndex = parseInt(interaction.customId) - 1;
          const sql = `INSERT INTO answered_questions (user_id, question_id, correct) VALUES (?, ?, ?)`;
          const questionId = questionData.id;
          const userId = message.author.id;
          const correct = options[selectedOptionIndex] === answer;
          try {
            await connection.query(sql, [userId, questionId, correct]);
            connection.release();
            if (options[selectedOptionIndex] === answer) {
              const updatedButtons = buttons.map((button, index) => {
                if (index === selectedOptionIndex) {
                  return button.setStyle(ButtonStyle.Success).setDisabled(true);
                } else {
                  return button.setDisabled(true);
                }
              });
              const updatedRow = new ActionRowBuilder().addComponents(
                updatedButtons
              );

              await interaction.update({ components: [updatedRow] });
            } else {
              const updatedButtons = buttons.map((button, index) => {
                if (index === selectedOptionIndex) {
                  return button.setStyle(ButtonStyle.Danger).setDisabled(true);
                } else {
                  return button.setDisabled(true);
                }
              });
              const updatedRow = new ActionRowBuilder().addComponents(
                updatedButtons
              );

              await interaction.update({ components: [updatedRow] });
            }

            counter++;
            collector.stop();
            await answerQuestion();
          } catch (error) {
            console.error(error);
            message.channel.send("Произошла ошибка при обработке ответа");
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            sentMessage.edit({
              content: "Время на ответ истекло",
              components: [],
            });
            connection.release();
          }
        });
      } catch (error) {
        console.error(error);
        message.channel.send("Произошла ошибка при получении вопроса");
        connection.release();
      }
    }
  };

  await answerQuestion();
}

async function leaderboard(message, client, pool) {
  try {
    const data = JSON.parse(fs.readFileSync("./Events/Message/questions.json"));
    const connection = await pool.getConnection();
    const upsertQuery = `
      INSERT INTO leaderboard (user_id, correct_answers, numberofquestions)
      SELECT user_id, SUM(correct) AS correct_answers, COUNT(correct = 0) AS numberofquestions 
      FROM answered_questions 
      GROUP BY user_id
      ON DUPLICATE KEY UPDATE 
          correct_answers = VALUES(correct_answers),
          numberofquestions = VALUES(numberofquestions)
    `;
    await connection.query(upsertQuery);
    const [rows, fields] = await connection.query(
      "SELECT user_id, correct_answers, numberofquestions FROM leaderboard ORDER BY correct_answers DESC"
    );
    connection.release();
    const canvas = Canvas.createCanvas(800, 1000);
    const context = canvas.getContext("2d");
    const background = await Canvas.loadImage("./images/wallpaper.png");
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#0099ff";
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.font = "36px Arial";
    context.fillStyle = "#ffffff";
    context.fillText("Лидеры:", 50, 50);

    for (let i = 0; i < 5; i++) {
      const user = await client.users.fetch(rows[i].user_id);
      const username = user.tag;
      const { body } = await request(
        user.displayAvatarURL({ extension: "jpg" })
      );
      const avatar = await Canvas.loadImage(await body.arrayBuffer());
      context.fillText(`${i + 1}.`, 50, 100 + 2 * i * 70);
      const radius = 50;
      const x = 100;
      const y = 75 + 2 * i * 70;

      context.save();
      context.beginPath();
      context.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
      context.closePath();
      context.clip();
      context.drawImage(avatar, x, y, radius * 2, radius * 2);
      context.restore();
      context.fillText(`${username}`, 210, 100 + 2 * i * 70);
      context.fillText(
        `Правильные ответы: ${rows[i].correct_answers}`,
        210,
        140 + 2 * i * 70
      );
      context.fillText(
        `Вопросов отвечено: ${rows[i].numberofquestions}/${data.length}`,
        210,
        180 + 2 * i * 70
      );
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].user_id == message.author.id) {
        context.fillText("Ваше место:", 50, 50 + 2 * 6 * 62);
        const user = await client.users.fetch(rows[i].user_id);
        const username = user.tag;
        const { body } = await request(
          user.displayAvatarURL({ extension: "jpg" })
        );
        const avatar = await Canvas.loadImage(await body.arrayBuffer());
        context.fillText(`${i + 1}.`, 50, 100 + 2 * 6 * 62);
        const radius = 50;
        const x = 100;
        const y = 75 + 2 * 6 * 62;

        context.save();
        context.beginPath();
        context.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(avatar, x, y, radius * 2, radius * 2);
        context.restore();
        context.fillText(`${username}`, 210, 100 + 2 * 6 * 62);
        context.fillText(
          `Правильные ответы: ${rows[i].correct_answers}`,
          210,
          140 + 2 * 6 * 62
        );
        context.fillText(
          `Вопросов отвечено: ${rows[i].numberofquestions}/${data.length}`,
          210,
          180 + 2 * 6 * 62
        );
      }
    }
    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
      name: "leaderboard.png",
    });
    message.channel.send({ files: [attachment] });
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  questions,
  leaderboard,
};
