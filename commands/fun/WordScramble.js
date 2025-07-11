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
Prueba Superada   : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const revolverPalabra = palabra => {
    const letras = palabra.split('');
    for (let i = letras.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letras[i], letras[j]] = [letras[j], letras[i]];
    }
    return letras.join('');
};

const palabras = [
    'manzana', 'banana', 'cereza', 'dátil', 'saúco', 'higo', 'uva', 'melón dulce', 'kiwi', 'limón',
    'mango', 'nectarina', 'naranja', 'papaya', 'membrillo', 'frambuesa', 'fresa', 'mandarina', 'ugli', 'vid',
    'sandía', 'xigua', 'ñame', 'calabacín', 'aguacate', 'arándano', 'melón cantalupo', 'fruta del dragón', 'pomelo', 'arándano rojo',
    'jaca', 'kiwano', 'lima', 'melón', 'néctar', 'aceituna', 'pera', 'ciruela', 'granada', 'ruibarbo',
    'carambola', 'tomate', 'albaricoque', 'mora', 'coco', 'pepino', 'grosella', 'pera', 'caqui', 'piña',
    'granada', 'membrillo', 'frambuesa', 'fresa', 'tamarindo', 'banana', 'kiwi', 'higo', 'dátiles', 'pomelo',
    'uvas', 'limón', 'lima', 'melón', 'mango', 'nectarina', 'durazno', 'ciruela', 'papaya', 'maracuyá',
    'durazno', 'pera', 'piña', 'ciruela', 'granada', 'mandarina', 'sandía', 'calabacín', 'berenjena', 'cebolla',
    'tomate', 'pepino', 'pimiento', 'brócoli', 'zanahoria', 'coliflor', 'apio', 'maíz', 'espinaca', 'ajo',
    'jengibre', 'col rizada', 'lechuga', 'champiñón', 'calabaza', 'rábano', 'calabacín', 'batata', 'nabo', 'remolacha',
    'alcachofa', 'espárrago', 'frijol', 'col de Bruselas', 'repollo', 'acelga', 'chile', 'diente de león', 'edamame', 'jalapeño',
    'puerro', 'aceitunas', 'perejil', 'guisante', 'papa', 'ruibarbo', 'chalote', 'arveja de nieve', 'brote', 'acelga suiza',
    'taro', 'tomatillo', 'berro', 'milenrama', 'calabacín', 'ñame', 'jícama', 'daikon', 'chayote', 'yogur',
    'cheddar', 'mozzarella', 'parmesano', 'brie', 'camembert', 'feta', 'gouda', 'ricota', 'azul', 'cabra',
    'requesón', 'crema', 'gruyere', 'provolone', 'suizo', 'havarti', 'americano', 'colby', 'jack', 'queso'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordscramble')
        .setDescription('Inicia un juego de palabras revueltas con una palabra desordenada.'),
    async execute(interaction) {
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        const palabraRevuelta = revolverPalabra(palabra);
        const scrambleEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('¡Palabra Revuelta!')
            .setDescription(`Reordena la palabra: **${palabraRevuelta}**`)
            .setFooter({ text: 'Escribe tu respuesta abajo.' });

        await interaction.reply({ embeds: [scrambleEmbed] });

        const filtro = respuesta => {
            return respuesta.author.id === interaction.user.id;
        };
        try {
            const recogido = await interaction.channel.awaitMessages({ filter: filtro, max: 1, time: 30000, errors: ['time'] });
            const respuestaUsuario = recogido.first().content;

            if (respuestaUsuario.toLowerCase() === palabra.toLowerCase()) {
                await interaction.followUp('¡Correcto! 🎉');
            } else {
                await interaction.followUp(`¡Incorrecto! La palabra correcta era: ${palabra}`);
            }
        } catch (error) {
            await interaction.followUp('¡Tardaste mucho en responder!');
        }
    },
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
Prueba Superada   : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/
