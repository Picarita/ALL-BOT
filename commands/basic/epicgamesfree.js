// commands/epicgratis.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('epicgratis')
    .setDescription('Muestra los juegos gratis de Epic Games'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const res = await axios.post('https://graphql.epicgames.com/graphql', {
        query: `
          query {
            Catalog {
              searchStore(category: "freegames", count: 10) {
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

      const games = res.data.data.Catalog.searchStore.elements;
      if (!games.length) return interaction.editReply('No hay juegos gratuitos en este momento.');

      for (const game of games) {
        const embed = new MessageEmbed()
          .setTitle(game.title)
          .setURL(`https://www.epicgames.com/store/p/${game.productSlug}`)
          .setDescription(game.description?.slice(0, 2048) || 'Sin descripción')
          .setImage(game.keyImages?.[0]?.url)
          .setColor('#00aeff');

        await interaction.followUp({ embeds: [embed] });
      }

      await interaction.editReply(); // finaliza loading si no usaste followUp para el primero

    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Ocurrió un error al obtener los juegos.');
    }
  },
};
