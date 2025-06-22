const { logsCollection } = require('../mongodb');
const LeaveSettings = require('../models/leave/LeaveSettings');
const { EmbedBuilder } = require('discord.js');
const createLeaveDMEmbed = require('../data/leave/leavedmembed');
const logHandlersIcons = require('../UI/icons/loghandlers');

module.exports = async function memberLeaveHandler(client) {
    client.on('guildMemberRemove', async (member) => {
        const guildId = member.guild.id;

        // === REGISTRO DE SALIDA ===
        const config = await logsCollection.findOne({ guildId, eventType: 'memberLeave' });
        if (config?.channelId) {
            const logChannel = client.channels.cache.get(config.channelId);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('🚶 Miembro salió')
                    .setColor('#FF9900')
                    .addFields(
                        { name: 'Usuario', value: `${member.user.tag} (${member.id})`, inline: true },
                        { name: 'Salió el', value: new Date().toLocaleString(), inline: true },
                    )
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: 'Sistema de registros', iconURL: logHandlersIcons.footerIcon })
                    .setTimestamp();

                logChannel.send({ embeds: [embed] });
            }
        }

        // === CONFIGURACIÓN DE SALIDA ===
        const leaveSettings = await LeaveSettings.findOne({ serverId: guildId });

        // Enviar al canal
        if (leaveSettings?.channelStatus && leaveSettings.leaveChannelId) {
            const channel = member.guild.channels.cache.get(leaveSettings.leaveChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('👋 Miembro salió')
                    .setColor('#FF9900')
                    .setDescription(`${member.user.tag} ha salido del servidor.`)
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            }
        }

        // Enviar mensaje privado
        if (leaveSettings?.dmStatus) {
            try {
                const dmEmbed = createLeaveDMEmbed(member);
                await member.user.send({ embeds: [dmEmbed] });
            } catch (err) {
                console.warn(`❌ Error al enviar DM de salida a ${member.user.tag}:`, err.message);
            }
        }
    });
};
