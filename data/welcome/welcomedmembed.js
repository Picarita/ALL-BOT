const { EmbedBuilder } = require('discord.js');

module.exports = function createWelcomeDMEmbed(member) {
    const username = member.user.username;
    const serverName = member.guild.name;
    const avatar = member.user.displayAvatarURL({ dynamic: true });

    return new EmbedBuilder()
        .setTitle(`👋 Bienvenido(a) a ${serverName}!`)
        .setDescription(`Oye ${username}, estamos encantados de que te unas a nosotros.!`)
        .setColor('#00e5ff')
        .setThumbnail(avatar)
        .addFields(
            { name: '📅 Joined', value: new Date().toDateString(), inline: true },
            { name: '📝 Info', value: 'Explora los canales, sigue las reglas, y escribe hola!' }
        )
        .setFooter({ text: `${serverName} Community` })
        .setTimestamp();
};
