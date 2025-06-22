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

Comando Verificado : ✓  
Sitio Web         : ssrr.tech  
Prueba Aprobada   : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Hazle una pregunta a la bola mágica 8')
        .addStringOption(option => 
            option.setName('question')
                .setDescription('La pregunta que quieres hacer')
                .setRequired(true)),
    
    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            const responses = [
                "🎱 Es seguro.",
                "🎱 Definitivamente sí.",
                "🎱 Sin duda.",
                "🎱 Sí – definitivamente.",
                "🎱 Puedes confiar en ello.",
                "🎱 Según lo veo, sí.",
                "🎱 Lo más probable.",
                "🎱 Las perspectivas son buenas.",
                "🎱 Sí.",
                "🎱 Las señales apuntan a que sí.",
                "🎱 Absolutamente.",
                "🎱 Ciertamente.",
                "🎱 Seguro.",
                "🎱 Por supuesto.",
                "🎱 Definitivamente.",
                "🎱 Seguro que sí.",
                "🎱 Sí, en efecto.",
                "🎱 Lo tienes.",
                "🎱 Afirmativo.",
                "🎱 Positivamente.",
                "🎱 Indudablemente.",
                "🎱 Indiscutiblemente.",
                "🎱 Claro.",
                "🎱 Sí, seguro.",
                "🎱 Se ve bien.",
                "🎱 Con toda seguridad.",
                "🎱 En efecto.",
                "🎱 Sí.",
                "🎱 Naturalmente.",
                "🎱 Sin vacilar.",
                "🎱 Definitivamente sí.",
                "🎱 Todas las señales dicen que sí.",
                "🎱 Ciertamente sí.",
                "🎱 Absolutamente sí.",
                "🎱 Seguro que sí.",
                "🎱 Muy positivamente.",
                "🎱 Indudablemente sí.",
                "🎱 Más allá de toda duda.",
                "🎱 Sí, claramente.",
                "🎱 Sí, sin duda.",
                "🎱 Sí, sin cuestionamientos.",
                "🎱 Sí, sin duda alguna.",
                "🎱 Sí, con toda seguridad.",
                "🎱 Sí, absolutamente.",
                "🎱 Sí, seguro.",
                "🎱 Sí, ciertamente.",
                "🎱 Sí, en efecto.",
                "🎱 Sí, naturalmente.",
                "🎱 Sí, indudablemente.",
                "🎱 Respuesta confusa, intenta de nuevo.",
                "🎱 Pregunta de nuevo más tarde.",
                "🎱 Mejor no decirlo ahora.",
                "🎱 No puedo predecirlo ahora.",
                "🎱 Concéntrate y pregunta de nuevo.",
                "🎱 No cuentes con ello.",
                "🎱 Mi respuesta es no.",
                "🎱 Mis fuentes dicen que no.",
                "🎱 Las perspectivas no son buenas.",
                "🎱 Muy dudoso.",
                "🎱 De ninguna manera.",
                "🎱 No lo creo.",
                "🎱 Definitivamente no.",
                "🎱 No hay chance.",
                "🎱 No.",
                "🎱 Absolutamente no.",
                "🎱 Ciertamente no.",
                "🎱 No, en efecto.",
                "🎱 No, seguro.",
                "🎱 No, absolutamente.",
                "🎱 No, indudablemente.",
                "🎱 No, con toda seguridad.",
                "🎱 No, definitivamente.",
                "🎱 No, ciertamente.",
                "🎱 No, indudablemente.",
                "🎱 No, sin cuestionamientos.",
                "🎱 No, sin duda alguna.",
                "🎱 No, indudablemente.",
                "🎱 No, absolutamente no.",
                "🎱 No, con seguridad.",
                "🎱 No, definitivamente no.",
                "🎱 No, más allá de toda duda.",
                "🎱 No, claramente no.",
                "🎱 No, con toda seguridad no.",
                "🎱 No, sin vacilar.",
                "🎱 No, ciertamente no.",
                "🎱 No, positivamente no.",
                "🎱 No, indudablemente no.",
                "🎱 No, sin cuestionamientos.",
                "🎱 No, en efecto no.",
                "🎱 No, seguro que no.",
                "🎱 No, con toda seguridad no.",
                "🎱 No, indudablemente no.",
                "🎱 No, definitivamente no.",
                "🎱 No, absolutamente no."
            ];

            const question = interaction.options.getString('question');
            const response = responses[Math.floor(Math.random() * responses.length)];

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎱 La Bola Mágica 8')
                .setDescription(`**Pregunta:** ${question}\n**Respuesta:** ${response}`)
                .setTimestamp()
                .setFooter({ text: 'Bola Mágica 8' });

            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "¡Alerta!", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://www.youtube.com/watch?v=mCh6VpxLubc"
                })
                .setDescription('- ¡Este comando solo se puede usar con comandos slash!\n- Por favor usa `/8ball`')
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

Comando Verificado : ✓  
Sitio Web         : ssrr.tech  
Prueba Aprobada   : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/
