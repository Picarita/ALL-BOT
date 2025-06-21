const { EmbedBuilder } = require('discord.js');

module.exports = function createLeaveDMEmbed(member) {
    return new EmbedBuilder()
        .setColor('#FF9900')
        .setTitle('👋 Saliste del servidor')
        .setDescription(`Te decimos adiós **${member.guild.name}**.\nEsperamos verte de nuevo!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
};
