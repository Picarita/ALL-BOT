const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const {
  Snake, TwoZeroFourEight, Connect4, FastType, FindEmoji, Flood,
  Hangman, MatchPairs, Minesweeper, TicTacToe, Wordle, RockPaperScissors, Trivia
} = require('discord-gamecord');

// Guardar colecciones activas por usuario
const activeCollectors = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('¡Juega un juego!'),

  async execute(interaction) {
    const existingCollector = activeCollectors.get(interaction.user.id);
    if (existingCollector) {
      existingCollector.stop();
      activeCollectors.delete(interaction.user.id);
    }

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('game_select')
        .setPlaceholder('Selecciona un juego para jugar')
        .addOptions([
          { label: 'Snake', value: 'snake' },
          { label: '2048', value: '2048' },
          { label: 'Connect4', value: 'connect4' },
          { label: 'FastType', value: 'fasttype' },
          { label: 'Find Emoji', value: 'findemoji' },
          { label: 'Flood', value: 'flood' },
          { label: 'Hangman', value: 'hangman' },
          { label: 'Match Pairs', value: 'matchpairs' },
          { label: 'Minesweeper', value: 'minesweeper' },
          { label: 'TicTacToe', value: 'tictactoe' },
          { label: 'Wordle', value: 'wordle' },
          { label: 'Rock Paper Scissors', value: 'rps' },
          { label: 'Trivia', value: 'trivia' }
        ])
    );

    const response = await interaction.reply({
      content: 'Selecciona un juego para jugar:',
      components: [row],
      fetchReply: true
    });

    const filter = i => i.customId === 'game_select' && i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({ filter, time: 60000 });
    
    activeCollectors.set(interaction.user.id, collector);

    collector.on('collect', async i => {
      const game = i.values[0];
      const games = {
        snake: Snake,
        '2048': TwoZeroFourEight,
        connect4: Connect4,
        fasttype: FastType,
        findemoji: FindEmoji,
        flood: Flood,
        hangman: Hangman,
        matchpairs: MatchPairs,
        minesweeper: Minesweeper,
        tictactoe: TicTacToe,
        wordle: Wordle,
        rps: RockPaperScissors,
        trivia: Trivia
      };

      const gameConfigs = {
        rps: {
          embed: {
            title: 'Piedra Papel Tijeras',
            color: '#5865F2',
            description: 'Presiona un botón para elegir.'
          },
          buttons: {
            rock: 'Piedra',
            paper: 'Papel',
            scissors: 'Tijeras'
          },
          emojis: {
            rock: '🌑',
            paper: '📰',
            scissors: '✂️'
          },
          mentionUser: true,
          timeoutTime: 60000,
          buttonStyle: 'PRIMARY',
          pickMessage: 'Elegiste {emoji}.',
          winMessage: '**{player}** ganó el juego! ¡Felicidades!',
          tieMessage: '¡Empate! Nadie ganó el juego.',
          timeoutMessage: '¡El juego no se completó! Nadie ganó.',
          playerOnlyMessage: 'Solo {player} y {opponent} pueden usar estos botones.'
        },
        trivia: {
          embed: {
            title: 'Trivia',
            color: '#5865F2',
            description: 'Tienes 60 segundos para responder.'
          },
          timeoutTime: 60000,
          buttonStyle: 'PRIMARY',
          trueButtonStyle: 'SUCCESS',
          falseButtonStyle: 'DANGER',
          mode: 'multiple',
          difficulty: 'medium',
          winMessage: '¡Ganaste! La respuesta correcta es {answer}.',
          loseMessage: '¡Perdiste! La respuesta correcta es {answer}.',
          errMessage: '¡No se pudo obtener la pregunta! Inténtalo de nuevo.',
          playerOnlyMessage: 'Solo {player} puede usar estos botones.'
        }
      };

      collector.stop();
      activeCollectors.delete(interaction.user.id);

      const GameClass = games[game];
      const config = { message: interaction, isSlashGame: true, ...gameConfigs[game] };

      if (["connect4", "tictactoe", "rps"].includes(game)) {
        config.opponent = i.user;
      }

      const selectedGame = new GameClass(config);
      selectedGame.startGame();
      selectedGame.on('gameOver', result => console.log(result));
      await i.deferUpdate();
    });

    collector.on('end', (collected, reason) => {
      activeCollectors.delete(interaction.user.id);

      if (reason === 'time' && collected.size === 0) {
        interaction.editReply({
          content: '¡Tardaste demasiado en elegir un juego!',
          components: [] 
        }).catch(console.error);
      }
    });
  }
};
