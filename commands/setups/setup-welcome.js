const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const WelcomeSettings = require('../../models/welcome/WelcomeSettings');
const checkPermissions = require('../../utils/checkPermissions');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-welcome')
        .setDescription('Configura o visualiza el mensaje de bienvenida y los ajustes de DM para este servidor')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)

        .addSubcommand(sub =>
            sub.setName('canal')
                .setDescription('Activar/Desactivar mensajes de bienvenida en un canal')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Selecciona el canal de bienvenida')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('estado')
                        .setDescription('Activar o desactivar los mensajes de bienvenida en el canal')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('dm')
                .setDescription('Activar/Desactivar los mensajes de bienvenida por DM')
                .addBooleanOption(option =>
                    option.setName('estado')
                        .setDescription('Activar o desactivar los mensajes de bienvenida por DM')
                        .setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('Ver la configuración actual de bienvenida')
        ),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const guild = interaction.guild;
            const serverID = guild.id;
            if (!await checkPermissions(interaction)) return;

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'canal') {
                const channel = interaction.options.getChannel('canal');
                const status = interaction.options.getBoolean('estado');

                await WelcomeSettings.updateOne(
                    { serverId: serverID },
                    {
                        $set: {
                            serverId: serverID,
                            welcomeChannelId: channel.id,
                            channelStatus: status,
                            ownerId: guild.ownerId
                        }
                    },
                    { upsert: true }
                );

                return interaction.reply({
                    content: `📢 Los mensajes de bienvenida en el canal han sido **${status ? 'activados' : 'desactivados'}** para <#${channel.id}>.`,
                    ephemeral: true
                });

            } else if (subcommand === 'dm') {
                const status = interaction.options.getBoolean('estado');

                await WelcomeSettings.updateOne(
                    { serverId: serverID },
                    {
                        $set: {
                            serverId: serverID,
                            dmStatus: status,
                            ownerId: guild.ownerId
                        }
                    },
                    { upsert: true }
                );

                return interaction.reply({
                    content: `📩 El mensaje de bienvenida por DM ha sido **${status ? 'activado' : 'desactivado'}**.`,
                    ephemeral: true
                });

            } else if (subcommand === 'view') {
                const config = await WelcomeSettings.findOne({ serverId: serverID });

                if (!config) {
                    return interaction.reply({
                        content: '⚠ No se encontró configuración de bienvenida para este servidor.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('📋 Configuración de Bienvenida')
                    .addFields(
                        { name: 'ID del Servidor', value: config.serverId, inline: true },
                        { name: 'Canal', value: config.welcomeChannelId ? `<#${config.welcomeChannelId}>` : 'No configurado', inline: true },
                        { name: 'Estado del Canal', value: config.channelStatus ? '✅ Activado' : '❌ Desactivado', inline: true },
                        { name: 'Bienvenida por DM', value: config.dmStatus ? '✅ Activado' : '❌ Desactivado', inline: true }
                    )
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "¡Alerta!", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://www.youtube.com/watch?v=mCh6VpxLubc"
                })
                .setDescription('- Este comando solo puede usarse mediante comandos de barra (`/`).\n- Por favor, utiliza `/configurar-bienvenida`')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
