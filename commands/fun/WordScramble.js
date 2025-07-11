const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const mezclarPalabra = palabra => {
    const letras = palabra.split('');
    for (let i = letras.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letras[i], letras[j]] = [letras[j], letras[i]];
    }
    return letras.join('');
};

const palabras = [
    'manzana', 'banana', 'cereza', 'dátil', 'saúco', 'higo', 'uva', 'melón', 'kiwi', 'limón',
    'mango', 'nectarina', 'naranja', 'papaya', 'membrillo', 'frambuesa', 'fresa', 'mandarina', 'ugli', 'vid',
    'sandía', 'xigua', 'ñame', 'calabacín', 'aguacate', 'arándano', 'cantalupo', 'pitahaya', 'pomelo', 'arándano rojo',
    'jaca', 'kiwano', 'lima', 'melón', 'néctar', 'aceituna', 'pera', 'ciruela', 'granada', 'ruibarbo',
    'carambola', 'tomate', 'albaricoque', 'mora', 'coco', 'pepino', 'grosella', 'caqui', 'piña', 'tamarindo',
    'durazno', 'maracuyá', 'berenjena', 'cebolla', 'pimiento', 'brócoli', 'zanahoria', 'coliflor', 'apio', 'maíz',
    'espinaca', 'ajo', 'jengibre', 'col', 'lechuga', 'champiñón', 'calabaza', 'rábano', 'batata', 'nabo',
    'remolacha', 'alcachofa', 'espárrago', 'frijol', 'coles', 'repollo', 'acelga', 'chile', 'diente de león', 'jalapeño',
    'puerro', 'aceitunas', 'perejil', 'guisante', 'papa', 'chalote', 'arveja', 'brote', 'taro', 'berro',
    'jícama', 'daikon', 'chayote', 'yogur', 'cheddar', 'mozzarella', 'parmesano', 'brie', 'feta', 'gouda',
    'ricota', 'azul', 'cabra', 'requesón', 'crema', 'gruyere', 'provolone', 'suizo', 'havarti', 'colby'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('palabrarevuelta')
        .setDescription('Inicia un juego para adivinar una palabra revuelta.'),
    async execute(interaction) {
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        const palabraRevuelta = mezclarPalabra(palabra);

        const embedJuego = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('¡Adivina la Palabra!')
            .setDescription(`Ordena las letras: **${palabraRevuelta}**`)
            .setFooter({ text: 'Escribe tu respuesta abajo.' });

        await interaction.reply({ embeds: [embedJuego] });

        const filtro = respuesta => respuesta.author.id === interaction.user.id;

        try {
            const recolectado = await interaction.channel.awaitMessages({
                filter: filtro,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            const respuestaUsuario = recolectado.first().content;

            if (respuestaUsuario.toLowerCase() === palabra.toLowerCase()) {
                await interaction.followUp('¡Correcto! 🎉');
            } else {
                await interaction.followUp(`❌ Incorrecto. La palabra era: **${palabra}**`);
            }
        } catch (error) {
            await interaction.followUp('⏰ ¡Tardaste mucho en responder!');
        }
    },
};
