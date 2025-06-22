/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { updateXp, getUserData, getLeaderboard } = require('../../models/users');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Manage and view XP & levels.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('givexp')
                .setDescription('Give XP to a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to give XP to.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to give.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removexp')
                .setDescription('Remove XP from a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove XP from.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of XP to remove.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Muestra la tabla de clasificación de XP.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rank')
                .setDescription('Muestra tu rango o el de otro usuario.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('El usuario para consultar el rango.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('weeklyxp')
                .setDescription('Muestra cuánta XP has ganado esta semana.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('xpforlevel')
                .setDescription('Muestra cuánta XP se necesita para el siguiente nivel.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {

        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user') || interaction.user;
        const amount = interaction.options.getInteger('amount');

        if (subcommand === 'givexp') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({ content: '❌ No tienes permiso para usar este comando.', flags: 64 });
            }
            if (amount <= 0) return interaction.editReply({ content: '❌ La cantidad de XP debe ser mayor que 0.', flags: 64 });

            await updateXp(user.id, amount);
            return interaction.editReply(`✅ Da **${amount} XP** a **${user.username}**.`);

        } else if (subcommand === 'removexp') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.editReply({ content: '❌ No tienes permiso para usar este comando.', flags: 64 });
            }
            if (amount <= 0) return interaction.editReply({ content: '❌ La cantidad de XP debe ser mayor que 0.', flags: 64 });

            const userData = await getUserData(user.id);
            if (!userData) return interaction.editReply({ content: '❌ El usuario no fue encontrado en la base de datos.', flags: 64 });

            await updateXp(user.id, -amount);
            return interaction.editReply(`✅ Se removio **${amount} XP** de **${user.username}**.`);

        }else if (subcommand === 'leaderboard') {
            // Fetch the top 10 leaderboard data
            let leaderboardData = await getLeaderboard(1, 10);
        
            // Filter out the bot's own ID and users not in the current guild
            leaderboardData = leaderboardData.filter(user => {
                const member = interaction.guild.members.cache.get(user.userId);
                return user.userId !== interaction.client.user.id && member;
            });
        
            // If no data remains after filtering, inform the user
            if (!leaderboardData.length) {
                const noDataEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ No hay datos para la tabla de clasificación')
                    .setDescription('No hay datos de tabla de clasificación disponibles para el servidor.')
                    .setTimestamp();
        
                const reply = await interaction.editReply({ embeds: [noDataEmbed] });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return;
            }
        
            // Map the leaderboard entries for display
            const leaderboardEntries = leaderboardData.map((user, index) => {
                const member = interaction.guild.members.cache.get(user.userId);
                return `**${index + 1}.** ${member} - Level **${user.level}**, XP: **${user.xp}**`;
            });
        
            // Create and send the leaderboard embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🏆 Tabla de XP')
                .setDescription(leaderboardEntries.join('\n'))
                .setTimestamp();
        
            await interaction.editReply({ embeds: [embed] });
        } else if (subcommand === 'rank') {
            const userData = await getUserData(user.id);
            if (!userData) return interaction.editReply(`❌ **${user.username}** No tiene datos de rango.`);

            const requiredXp = Math.ceil((userData.level + 1) ** 2 * 100);
            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setAuthor({ name: `${user.username}'s Rank`, iconURL: user.displayAvatarURL() })
                .setDescription('🏆 **Detalles de rango y XP**')
                .addFields(
                    { name: '📊 Level', value: `**${userData.level}**`, inline: true },
                    { name: '💫 XP', value: `**${userData.xp} / ${requiredXp}**`, inline: true },
                    { name: '✨ XP Necesaria', value: `**${requiredXp - userData.xp} XP**`, inline: false }
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'weeklyxp') {
            const userData = await getUserData(interaction.user.id);
            if (!userData) return interaction.editReply('❌ No se pudo obtener la información de XP.');

            return interaction.editReply(`📅 **${interaction.user.username}** ganó **${userData.weeklyXp} XP** esta semana.`);

        } else if (subcommand === 'xpforlevel') {
            const userData = await getUserData(interaction.user.id);
            if (!userData) return interaction.editReply('❌ No se pudo obtener los datos de XP.');

            const xpForNextLevel = (userData.level + 1) ** 2 * 100;
            const xpNeeded = xpForNextLevel - userData.xp;

            return interaction.editReply(`✨ **${interaction.user.username}** necesita **${xpNeeded} XP** para conseguir el siguiente nivel.`);
        }
        
    } else {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Alerta!", 
                iconURL: cmdIcons.dotIcon,
                url: "https://www.youtube.com/watch?v=mCh6VpxLubc"
            })
            .setDescription('- ¡Este comando solo se puede usar con comandos slash!\n- Por favor usa `/level`')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
    }
};

/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Command Verified : ✓  
Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/
