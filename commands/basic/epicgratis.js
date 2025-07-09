const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('epicgratis')
    .setDescription('Muestra los juegos semanales gratuitos de Epic Games'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await axios.post('https://graphql.epicgames.com/graphql', {
        query: `
          query {
            Catalog {
              searchStore(
                category: "freegames",
                count: 30,
                country: "US",
                locale: "es-ES"
              ) {
                elements {
                  title
                  description
                  keyImages { type url }
                  catalogNs { mappings { pageSlug } }
                  price {
                    totalPrice { discountPrice }
                  }
                  promotions {
                    promotionalOffers {
                      promotionalOffers {
                        startDate
                        endDate
                      }
                    }
                  }
                }
              }
            }
          }
        `
      });

      const now = new Date();
      const games = response.data?.data?.Catalog?.searchStore?.elements || [];

      let sentCount = 0;

      for (const game of games) {
        const discount = game.price?.totalPrice?.discountPrice;
        if (discount !== 0) continue;

        const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
        if (!promo?.startDate || !promo?.endDate) continue;

        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        if (!(now >= start && now <= end)) continue;

        const pageSlug = game.catalogNs?.mappings?.[0]?.pageSlug;
        if (!pageSlug) continue;

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
        await interaction.editReply('🎮 No hay juegos gratuitos activos esta semana.');
      } else {
        await interaction.editReply({ content: '🎁 Juegos semanales gratuitos de Epic Games:', ephemeral: false });
      }

    } catch (error) {
      if (error.response?.data?.errors) {
        console.error('GraphQL Errors:', error.response.data.errors);
      }
      console.error('❌ Error en /epicgratis:', error.message);
      await interaction.editReply('❌ Ocurrió un error al obtener los juegos de Epic.');
    }
  }
};
