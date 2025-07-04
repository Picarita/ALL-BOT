// commands/epicgratis.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('epicgratis')
    .setDescription('Muestra los juegos gratis de Epic Games'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await axios.post('https://graphql.epicgames.com/graphql', {
        query: `
          query {
            Catalog {
              searchStore(category: "freegames", count: 5) {
                elements {
                  title
                  productSlug
                  description
                  keyImages { type url }
                }
              }
            }
          }
        `
      });

      const games = response.data.data.Catalog.searchStore.elements;

      if (!games.length) {
        return interaction.editReply('No hay juegos gratuitos disponibles en este momento.');
      }

      for (const game of games) {
        const image = game.keyImages?.[0]?.url;
        const embed = new EmbedBuilder()
          .setTitle(game.title)
          .setURL(`https://www.epicgames.com/store/p/${game.productSlug}`)
          .setDescription(game.description?.slice(0, 300) || 'Sin descripción.')
          .setImage(image)
          .setColor(0x00AEFF);

        await interaction.followUp({ embeds: [embed] });
      }

      await interaction.editReply({ content: '🎮 Juegos gratuitos de Epic Games:', ephemeral: false });

    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Hubo un error al obtener los juegos.');
    }
  }
};
