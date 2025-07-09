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
              searchStore(category: "freegames", count: 10) {
                elements {
                  title
                  description
                  keyImages { type url }
                  catalogNs {
                    mappings {
                      pageSlug
                    }
                  }
                }
              }
            }
          }
        `
      });

      const games = response.data.data.Catalog.searchStore.elements;

      let sentCount = 0;

      for (const game of games) {
        const pageSlug = game.catalogNs?.mappings?.[0]?.pageSlug;

        if (!pageSlug) {
          console.log(`❌ Sin URL válida: ${game.title}`);
          continue;
        }

        const url = `https://store.epicgames.com/es-ES/p/${pageSlug}`;
        const image = game.keyImages?.[0]?.url;

        const embed = new EmbedBuilder()
          .setTitle(game.title)
          .setURL(url)
          .setDescription(game.description?.slice(0, 300) || 'Sin descripción.')
          .setImage(image)
          .setColor(0x00AEFF);

        await interaction.followUp({ embeds: [embed] });
        sentCount++;
      }

      if (sentCount === 0) {
        await interaction.editReply('No se pudieron encontrar juegos gratuitos válidos para mostrar.');
      } else {
        await interaction.editReply({ content: `🎁 Juegos gratuitos en Epic Games:`, ephemeral: false });
      }

    } catch (error) {
      console.error('❌ Error en /epicgratis:', error);
      await interaction.editReply('❌ Ocurrió un error al obtener los juegos.');
    }
  }
};
