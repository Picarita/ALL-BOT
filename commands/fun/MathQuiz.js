/*
☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆

  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  

DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Comando Verificado : ✓  
Sitio Web        : ssrr.tech  
Prueba Aprobada  : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageCollector } = require('discord.js');

let activeQuizzes = new Map();
let lastPermissionMessage = null;

function generateQuestion() {
    let num1 = Math.floor(Math.random() * 100) + 1;
    let num2 = Math.floor(Math.random() * 100) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let question, answer;

    switch (operation) {
        case '+':
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
            break;
    }

    return { question, answer };
}

async function deleteQuizMessages(quizData) {
    if (quizData.messages) {
        for (const msg of quizData.messages) {
            try {
                await msg.delete();
            } catch (err) {
                if (err.code !== 10008) {
                    console.error('No se pudo eliminar el mensaje:', err);
                }
            }
        }
    }
    if (lastPermissionMessage) {
        try {
            await lastPermissionMessage.delete();
            lastPermissionMessage = null;
        } catch (err) {
            if (err.code !== 10008) {
                console.error('No se pudo eliminar el último mensaje de permiso:', err);
            }
        }
    }
}

async function endQuiz(interaction, channelId, reason) {
    const quizData = activeQuizzes.get(channelId);

    if (quizData) {
        if (quizData.collector) {
            quizData.collector.stop();
        }
        await deleteQuizMessages(quizData);
        activeQuizzes.delete(channelId);

        const channel = await interaction.client.channels.fetch(channelId);
        if (channel) {
            const endEmbed = new EmbedBuilder()
                .setTitle('📚 ¡Quiz de Matemáticas Finalizado! 🧠')
                .setDescription(reason)
                .setColor(0xff0000);

            await channel.send({ embeds: [endEmbed] });
        }
    } else {
        await interaction.reply({ content: 'No hay un quiz activo para finalizar.', ephemeral: true });
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mathquiz')
        .setDescription('Inicia un quiz de matemáticas.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Inicia un quiz de matemáticas en este canal.')
        ),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const channelId = interaction.channel.id;
            const userId = interaction.user.id;

            if (subcommand === 'start') {
                if (activeQuizzes.has(channelId)) {
                    await interaction.reply({ content: 'Ya hay un quiz activo en este canal.', ephemeral: true });
                    return;
                }

                const quizData = {
                    commandUser: userId,
                    questions: Array.from({ length: 5 }, generateQuestion),
                    currentQuestionIndex: 0,
                    correctAnswers: 0,
                    timeoutCount: 0,
                    collector: null,
                    messages: [],
                };
                activeQuizzes.set(channelId, quizData);

                const startNextQuestion = async () => {
                    if (quizData.currentQuestionIndex >= quizData.questions.length) {
                        await endQuiz(interaction, channelId, `🎉 ¡Quiz completado! Tu puntaje fue ${quizData.correctAnswers}/${quizData.questions.length}.`);
                        return;
                    }

                    const { question, answer } = quizData.questions[quizData.currentQuestionIndex];

                    const quizEmbed = new EmbedBuilder()
                        .setTitle('🧠 Pregunta de Quiz de Matemáticas')
                        .setDescription(`**Pregunta ${quizData.currentQuestionIndex + 1}/5:** ¿Cuánto es ${question}? Responde con \`!<tu respuesta>\``)
                        .setColor(0x0099ff)
                        .setFooter({ text: '⏳ Tienes 30 segundos para responder esta pregunta.' });

                    if (quizData.messages.length > 0) {
                        await deleteQuizMessages(quizData);
                        quizData.messages = [];
                    }

                    const message = await interaction.channel.send({ embeds: [quizEmbed] });
                    quizData.messages.push(message);

                    const filter = response => response.content.startsWith('!') && response.channel.id === channelId;
                    quizData.collector = new MessageCollector(interaction.channel, { filter, time: 30000 });

                    quizData.collector.on('collect', async response => {
                        const userAnswer = parseInt(response.content.slice(1).trim(), 10);
                        const correctAnswer = quizData.questions[quizData.currentQuestionIndex].answer;

                        if (response.author.id !== quizData.commandUser) {
                            await response.delete();
                            if (lastPermissionMessage) {
                                await lastPermissionMessage.delete();
                            }
                            lastPermissionMessage = await response.channel.send({ content: `❌ ${response.author} no tiene permiso para responder. Solo el usuario que inició el quiz puede contestar.`, ephemeral: true });
                            return;
                        }

                        clearTimeout(quizData.questionTimer);

                        if (userAnswer === correctAnswer) {
                            quizData.correctAnswers++;
                            await response.reply({ content: '✅ ¡Correcto!', ephemeral: true });
                        } else {
                            await response.reply({ content: `❌ ¡Incorrecto! La respuesta correcta era ${correctAnswer}.`, ephemeral: true });
                        }

                        quizData.currentQuestionIndex++;
                        quizData.collector.stop();
                        startNextQuestion();
                    });

                    quizData.collector.on('end', async collected => {
                        if (collected.size === 0) {
                            quizData.timeoutCount++;

                            if (quizData.timeoutCount >= 3) {
                                await endQuiz(interaction, channelId, `🛑 El quiz terminó por inactividad después de 3 tiempos agotados.`);
                                return;
                            } else {
                                const timeoutMessage = await interaction.channel.send(`⏳ ¡Tiempo agotado! Pasando a la pregunta ${quizData.currentQuestionIndex + 1}/5. ⏭️`);
                                quizData.messages.push(timeoutMessage);
                                quizData.currentQuestionIndex++;
                                startNextQuestion();
                            }
                        }
                    });
                };

                await interaction.reply({ content: '🎉 ¡Quiz de matemáticas iniciado! Responde con `!<tu respuesta>`. ', ephemeral: true });
                startNextQuestion();
            }
        } catch (error) {
            console.error('Error al ejecutar el comando math quiz:', error);
            await interaction.reply({ content: 'Ocurrió un error al ejecutar el comando.', ephemeral: true });
        }
    },
};

/*
☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆

  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  

DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Comando Verificado : ✓  
Sitio Web        : ssrr.tech  
Prueba Aprobada  : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/
