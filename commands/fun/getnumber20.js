const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const activeGames = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getnumber20')
        .setDescription('¡Un juego donde debes llegar al número 20 antes que tu oponente!')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Modo de juego')
                .setRequired(true)
                .addChoices(
                    { name: 'VS Bot', value: 'vsbot' },
                    { name: 'VS Usuario', value: 'vsuser' }
                )
        )
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('El usuario contra el que quieres jugar.')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const serverId = interaction.guild.id;
            const mode = interaction.options.getString('mode');
            const opponent = interaction.options.getUser('opponent') || interaction.client.user;
            const targetScore = 20;

            if (mode === 'vsbot' && opponent.id !== interaction.client.user.id) {
                return interaction.reply({ content: '🚫 No puedes mencionar a un oponente cuando juegas contra el bot.', ephemeral: true });
            }

            if (mode === 'vsuser' && opponent.id === interaction.client.user.id) {
                return interaction.reply({ content: '🚫 No puedes jugar contra el bot en modo VS Usuario. Elige otro oponente.', ephemeral: true });
            }

            if (activeGames[serverId]) {
                return interaction.reply({
                    content: '🚫 ¡Ya hay un juego en progreso en este servidor! Espera a que termine el juego actual.',
                    ephemeral: true
                });
            }

            const startingUserId = mode === 'vsbot' ? interaction.user.id : Math.random() < 0.5 ? interaction.user.id : opponent.id;

            activeGames[serverId] = {
                gameEnded: false,
                currentTurnUserId: startingUserId,
                score: 0,
                lastMoveTime: Date.now(),
                inactivityTimer: null,
                interaction: interaction,
                opponent: opponent,
                mode: mode
            };

            await interaction.deferReply();

            const gameInstructionsEmbed = new EmbedBuilder()
                .setTitle('🎮 Instrucciones del Juego')
                .setDescription(
                    `**Objetivo:**\nLlega al número **${targetScore}** antes que tu oponente.\n\n` +
                    `**Cómo jugar:**\n- En tu turno, suma **1** o **2** al puntaje actual.\n` +
                    `- Se turnan tú y tu oponente.\n` +
                    `- El primero en llegar a **${targetScore}** gana.\n\n` +
                    `**Reglas:**\n- Solo puedes sumar **1** o **2** por turno.\n` +
                    `- Si haces un movimiento inválido o no es tu turno, se te avisará.\n` +
                    `- Si hay inactividad durante 5 minutos, el juego terminará automáticamente.\n\n` +
                    `**Ejemplo:**\n` +
                    `- Si el puntaje es **5**, puedes elegir **6** o **7**.\n` +
                    `- Si eliges **6**, el nuevo puntaje será **6** y es turno del oponente.\n` +
                    `- Sigue hasta que alguien llegue a **${targetScore}**!\n\n` +
                    `¡Buena suerte y diviértete! 🎉`
                )
                .setColor('#00FF00')
                .setFooter({ text: 'Escribe un número para comenzar a jugar!' })
                .setTimestamp();

            const gameStartEmbed = new EmbedBuilder()
                .setTitle('🎮 Juego Iniciado')
                .setDescription(
                    `${interaction.user.username} vs ${mode === 'vsbot' ? 'Bot' : opponent.username}\n` +
                    `¡El primero en llegar a ${targetScore} gana!\n\n` +
                    `🔄 ¡Es el turno de <@${activeGames[serverId].currentTurnUserId}>!`
                )
                .setColor('#00FF00')
                .setFooter({ text: 'Escribe un número para jugar!' })
                .setTimestamp();

            await interaction.editReply({ embeds: [gameInstructionsEmbed, gameStartEmbed] });

            const filter = m => [interaction.user.id, opponent.id].includes(m.author.id) && !isNaN(m.content) && m.content.trim() !== '';
            const collector = interaction.channel.createMessageCollector({ filter, time: 300000 });

            const resetInactivityTimer = () => {
                if (!activeGames[serverId] || activeGames[serverId].gameEnded) return;
                clearTimeout(activeGames[serverId].inactivityTimer);
                activeGames[serverId].inactivityTimer = setTimeout(async () => {
                    if (!activeGames[serverId] || activeGames[serverId].gameEnded) return;
                    activeGames[serverId].gameEnded = true;

                    const endEmbed = new EmbedBuilder()
                        .setTitle('⏳ Juego Finalizado')
                        .setDescription('El juego ha terminado por inactividad (5 minutos sin respuesta).')
                        .setColor('#FF0000')
                        .setFooter({ text: '¡Intenta de nuevo más tarde!' })
                        .setTimestamp();

                    await interaction.followUp({ embeds: [endEmbed] });
                    delete activeGames[serverId];
                }, 300000);
            };

            const makeBotMove = () => {
                let botChoice = activeGames[serverId].score + (Math.random() < 0.5 ? 1 : 2);
                if (botChoice > targetScore) botChoice = targetScore;
                return botChoice;
            };

            const takeBotTurn = async () => {
                if (!activeGames[serverId] || activeGames[serverId].gameEnded) return;
                const botChoice = makeBotMove();
                activeGames[serverId].score = botChoice;

                await interaction.channel.send({ content: `El bot elige ${botChoice}` });

                if (activeGames[serverId].score >= targetScore) {
                    activeGames[serverId].gameEnded = true;
                    collector.stop();

                    const winEmbed = new EmbedBuilder()
                        .setTitle('🏆 ¡El Bot Gana!')
                        .setDescription(`¡Felicidades! 🎉 El Bot llegó a ${targetScore} primero.\n\nPuntaje final: ${activeGames[serverId].score}`)
                        .setColor('#FFD700')
                        .setTimestamp();

                    await interaction.followUp({ content: `<@${interaction.client.user.id}>`, embeds: [winEmbed] });
                    delete activeGames[serverId];
                } else {
                    activeGames[serverId].currentTurnUserId = interaction.user.id;

                    const turnEmbed = new EmbedBuilder()
                        .setTitle('🔄 Siguiente Turno')
                        .setDescription(`Es el turno de <@${activeGames[serverId].currentTurnUserId}>. Puntaje actual: ${activeGames[serverId].score}`)
                        .setColor('#00FF00')
                        .setFooter({ text: 'Escribe un número para jugar!' })
                        .setTimestamp();

                    await interaction.followUp({ content: `<@${activeGames[serverId].currentTurnUserId}>`, embeds: [turnEmbed] });

                    resetInactivityTimer();
                }
            };

            const handleUserTurn = async (m) => {
                if (!activeGames[serverId] || activeGames[serverId].gameEnded) return;

                const userId = m.author.id;
                let userChoice = parseInt(m.content);
                const minNumber = activeGames[serverId].score + 1;
                const maxNumber = activeGames[serverId].score + 2;

                if (userId !== activeGames[serverId].currentTurnUserId) {
                    const replyMessage = await m.reply({ content: `🚫 ¡No es tu turno! Espera el turno de <@${activeGames[serverId].currentTurnUserId}>.`, ephemeral: true });
                    setTimeout(() => replyMessage.delete(), 10000);
                    return;
                }

                if (userChoice < minNumber || userChoice > maxNumber) {
                    const replyMessage = await m.reply({ content: `🚫 Solo puedes sumar 1 o 2. Elige un número válido entre ${minNumber} y ${maxNumber}.`, ephemeral: true });
                    setTimeout(() => replyMessage.delete(), 10000);
                    return;
                }

                activeGames[serverId].score = userChoice;
                activeGames[serverId].lastMoveTime = Date.now();

                if (activeGames[serverId].score >= targetScore) {
                    activeGames[serverId].gameEnded = true;
                    collector.stop();

                    const winEmbed = new EmbedBuilder()
                        .setTitle('🏆 ¡Felicidades!')
                        .setDescription(`🎉 ${m.author.username} llegó a ${targetScore} primero y ganó el juego!\n\nPuntaje final: ${activeGames[serverId].score}`)
                        .setColor('#FFD700')
                        .setTimestamp();

                    await interaction.followUp({ embeds: [winEmbed] });
                    delete activeGames[serverId];
                } else {
                    activeGames[serverId].currentTurnUserId = activeGames[serverId].currentTurnUserId === interaction.user.id ? opponent.id : interaction.user.id;

                    const turnEmbed = new EmbedBuilder()
                        .setTitle('🔄 Siguiente Turno')
                        .setDescription(`Es el turno de <@${activeGames[serverId].currentTurnUserId}>. Puntaje actual: ${activeGames[serverId].score}`)
                        .setColor('#00FF00')
                        .setFooter({ text: 'Escribe un número para jugar!' })
                        .setTimestamp();

                    await interaction.followUp({ content: `<@${activeGames[serverId].currentTurnUserId}>`, embeds: [turnEmbed] });

                    resetInactivityTimer();

                    if (activeGames[serverId].mode === 'vsbot' && activeGames[serverId].currentTurnUserId === interaction.client.user.id) {
                        await takeBotTurn();
                    }
                }
            };

            collector.on('collect', handleUserTurn);
            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    if (!activeGames[serverId] || activeGames[serverId].gameEnded) return;

                    activeGames[serverId].gameEnded = true;

                    const endEmbed = new EmbedBuilder()
                        .setTitle('⏳ Juego Finalizado')
                        .setDescription('El juego ha terminado por inactividad.')
                        .setColor('#FF0000')
                        .setFooter({ text: '¡Intenta de nuevo más tarde!' })
                        .setTimestamp();

                    interaction.followUp({ embeds: [endEmbed] });
                    delete activeGames[serverId];
                }
            });

            resetInactivityTimer();
        } else {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "¡Alerta!", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- ¡Este comando solo puede usarse con slash commands!\n- Por favor usa `/getnumber20`')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};
