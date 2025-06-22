const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const musicIcons = require('../../UI/icons/musicicons');
const cmdIcons = require('../../UI/icons/commandicons');
const { autoplayCollection } = require('../../mongodb');
const { playlistCollection } = require('../../mongodb');
const SpotifyWebApi = require('spotify-web-api-node');
const { getData } = require('spotify-url-info')(fetch);
const config = require('../../config.js');

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
});
module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Comandos del reproductor de música.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Reproduce una canción o playlist en el canal de voz.')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Introduce el nombre de la canción o URL.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('Obtén información sobre la canción que se está reproduciendo.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('loop')
                .setDescription('Alternar modo de repetición para la pista actual o la cola.')
                .addStringOption(option =>
                    option.setName('mode')
                        .setDescription('Selecciona modo de repetición: none, track o queue.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Desactivar repetición', value: 'none' },
                            { name: 'Repetir pista', value: 'track' },
                            { name: 'Repetir cola', value: 'queue' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pausar la canción que se está reproduciendo.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Reanudar la canción pausada.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Mezclar la cola.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Saltar la canción actual.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Detener la música y limpiar la cola.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Ver la cola de música actual.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Eliminar una canción específica de la cola.')
                .addIntegerOption(option =>
                    option.setName('track')
                        .setDescription('Número de pista a eliminar.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('createplaylist')
                .setDescription('Crear una nueva playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('visibility')
                        .setDescription('Elige si la playlist es pública o privada.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Pública', value: 'public' },
                            { name: 'Privada', value: 'private' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('playplaylist')
                .setDescription('Reproducir una playlist guardada.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('viewmyplaylists')
                .setDescription('Ver tus playlists guardadas.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('viewmyplaylistsongs')
                .setDescription('Ver canciones en tu playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('allplaylists')
                .setDescription('Ver todas las playlists públicas.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deletesong')
                .setDescription('Eliminar una canción de tu playlist.')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('Índice de la canción a eliminar.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deleteplaylist')
                .setDescription('Eliminar tu playlist.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('autoplay')
                .setDescription('Activar o desactivar autoplay.')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Activar o desactivar autoplay.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addsong')
                .setDescription('Agregar una canción a una playlist.')
                .addStringOption(option =>
                    option.setName('playlist')
                        .setDescription('Nombre de la playlist.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('song')
                        .setDescription('Introduce el nombre de la canción o URL.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('Configurar volumen de la música (0-100).')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Nivel de volumen (0-100).')
                        .setRequired(true))),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;
            const member = interaction.member;
            const { channel } = member.voice;
            const client = interaction.client;

            // Función para verificar canal de voz
            const checkVoiceChannel = async () => {
                if (!channel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ Debes estar en un canal de voz para usar este comando.');
                    
                    const reply = await interaction.editReply({ embeds: [errorEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return false;
                }
        
                const botVoiceChannel = interaction.guild.members.me?.voice.channel;
                
                if (botVoiceChannel && botVoiceChannel.id !== channel.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ Ya estoy reproduciendo música en otro canal de voz.');
                    
                    const reply = await interaction.editReply({ embeds: [errorEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return false;
                }
                
                // Verificar permisos
                const permissions = channel.permissionsFor(client.user);
                if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ Necesito permisos para conectar y hablar en el canal de voz.');
                    
                    const reply = await interaction.editReply({ embeds: [errorEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return false;
                }

                return true;
            };

            // Función para obtener o crear el reproductor
            const getOrCreatePlayer = async () => {
                let player = client.riffy.players.get(guildId);
                
                if (!player) {
                    try {
                        player = await client.riffy.createConnection({
                            guildId,
                            voiceChannel: channel.id,
                            textChannel: interaction.channel.id,
                            deaf: true
                        });
                    } catch (error) {
                        console.error('Error al crear reproductor:', error);
                        await interaction.editReply({ content: '❌ Falló la conexión al canal de voz.' });
                        return null;
                    }
                }
                
                return player;
            };

            // Función para verificar si el reproductor existe
            const checkPlayerExists = async () => {
                const player = client.riffy.players.get(guildId);
                
                if (!player) {
                    const noPlayerEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ No hay reproductor activo')
                        .setDescription('No hay un reproductor activo en este servidor.\nUsa `/music play` para empezar a reproducir música.')
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                
                    const reply = await interaction.editReply({ embeds: [noPlayerEmbed] });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    return false;
                }
                
                
                return player;
            };

            // Manejo de subcomandos
            switch (subcommand) {
                case 'play': {
                    try {
                        if (!await checkVoiceChannel()) return;
                    
                        const query = interaction.options.getString('query');
                        const user = interaction.user;
                        let player = await getOrCreatePlayer();
                        if (!player) return;
                
                        // Manejar enlaces de Spotify
                        if (query.includes('spotify.com')) {
                            try {
                                const spotifyData = await getData(query);
                                const token = await spotifyApi.clientCredentialsGrant();
                                spotifyApi.setAccessToken(token.body.access_token);
                        
                                let trackList = [];
                        
                                if (spotifyData.type === 'track') {
                                    const searchQuery = `${spotifyData.name} - ${spotifyData.artists.map(a => a.name).join(', ')}`;
                                    trackList.push(searchQuery);
                                } else if (spotifyData.type === 'playlist') {
                                    const playlistId = query.split('/playlist/')[1].split('?')[0];
                                    let offset = 0;
                                    const limit = 100;
                                    let fetched = [];
                        
                                    do {
                                        const data = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
                                        fetched = data.body.items.filter(item => item.track).map(item =>
                                            `${item.track.name} - ${item.track.artists.map(a => a.name).join(', ')}`
                                        );
                                        trackList.push(...fetched);
                                        offset += limit;
                                    } while (fetched.length === limit);
                                }
                
                                if (trackList.length === 0) {
                                    await interaction.editReply({ 
                                        content: "❌ No se encontraron pistas en este enlace de Spotify." 
                                    });
                                    return;
                                }
                        
                                let added = 0;
                                for (const trackQuery of trackList) {
                                    const result = await client.riffy.resolve({ query: trackQuery, requester: user });
                                    if (result && result.tracks && result.tracks.length > 0) {
                                        const resolvedTrack = result.tracks[0];
                                        resolvedTrack.requester = {
                                            id: user.id,
                                            username: user.username,
                                            avatarURL: user.displayAvatarURL()
                                        };
                                        player.queue.add(resolvedTrack);
                                        added++;
                                    }
                                }
                        
                                const embed = new EmbedBuilder()
                                    .setColor('#1DB954')
                                    .setTitle(`🎵 Pista o Playlist de Spotify en Cola`)
                                    .setDescription(`✅ Añadidas ${added} pista(s) desde Spotify a la cola.`)
                                    .setFooter({ text: `Solicitado por: ${user.username}`, iconURL: user.displayAvatarURL() });
                        
                                const reply = await interaction.editReply({ embeds: [embed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                        
                                if (!player.playing && !player.paused) player.play();
                            } catch (spotifyError) {
                                console.error('Error de Spotify:', spotifyError);
                                const errorEmbed = new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle('❌ Error de Spotify')
                                    .setDescription('No se pudo procesar el enlace de Spotify. Por favor, verifica tus credenciales de Spotify o prueba otro enlace.')
                                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                                
                                const reply = await interaction.editReply({ embeds: [errorEmbed] });
                                setTimeout(() => reply.delete().catch(() => {}), 5000);
                                return;
                            }
                        }  
                        // Manejar enlaces de YouTube
                        else if (query.includes('youtube.com') || query.includes('youtu.be')) {
                            let isPlaylist = query.includes('list=');
                            let isMix = query.includes('list=RD');
                    
                            if (isMix) {
                                const mixEmbed = new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle('❌ Contenido no compatible')
                                    .setDescription('Actualmente no se admiten los mixes de YouTube.\nPor favor usa otra pista o playlist.')
                                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                            
                                const reply = await interaction.editReply({ embeds: [mixEmbed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                                return;
                            }
                            
                            const resolve = await client.riffy.resolve({ query, requester: user });
                            if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                                const noResultsEmbed = new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle('❌ No se encontraron resultados')
                                    .setDescription('No pudimos encontrar ninguna pista que coincida con tu búsqueda.\nPrueba modificando tu búsqueda.')
                                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                            
                                const reply = await interaction.editReply({ embeds: [noResultsEmbed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                                return;
                            }
                            
                            if (isPlaylist) {
                                for (const track of resolve.tracks) {
                                    track.requester = {
                                        id: user.id,
                                        username: user.username,
                                        avatarURL: user.displayAvatarURL()
                                    };
                                    player.queue.add(track);
                                }
                    
                                const embed = new EmbedBuilder()
                                    .setColor('#DC92FF')
                                    .setAuthor({ name: 'Playlist Añadida', iconURL: musicIcons.correctIcon })
                                    .setFooter({ text: `Solicitado por: ${user.username}`, iconURL: user.displayAvatarURL() })
                                    .setDescription(`✅ Añadida **Playlist** a la cola.`);
                    
                                const reply = await interaction.editReply({ embeds: [embed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                            } else {
                                const track = resolve.tracks[0];
                                track.requester = {
                                    id: user.id,
                                    username: user.username,
                                    avatarURL: user.displayAvatarURL()
                                };
                                player.queue.add(track);
                    
                                const embed = new EmbedBuilder()
                                    .setColor('#DC92FF')
                                    .setAuthor({ name: 'Pista Añadida', iconURL: musicIcons.correctIcon })
                                    .setFooter({ text: `Solicitado por: ${user.username}`, iconURL: user.displayAvatarURL() })
                                    .setDescription(`🎵 Añadida **${track.info.title}** a la cola.`);
                    
                                const reply = await interaction.editReply({ embeds: [embed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                            }
                    
                            if (!player.playing && !player.paused) player.play();
                        }
                        // Manejar búsquedas regulares
                        else {
                            const resolve = await client.riffy.resolve({ query, requester: user });
                            
                            if (!resolve || !resolve.tracks || resolve.tracks.length === 0) {
                                const noResultsEmbed = new EmbedBuilder()
                                    .setColor('#FF0000')
                                    .setTitle('❌ No se encontraron resultados')
                                    .setDescription('No pudimos encontrar ninguna pista que coincida con tu búsqueda.\nPrueba modificando tu búsqueda.')
                                    .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon });
                            
                                const reply = await interaction.editReply({ embeds: [noResultsEmbed] });
                                setTimeout(() => reply.delete().catch(() => {}), 3000);
                                return;
                            }
                
                            const track = resolve.tracks[0];
                            track.requester = {
                                id: user.id,
                                username: user.username,
                                avatarURL: user.displayAvatarURL()
                            };
                            player.queue.add(track);
                
                            const embed = new EmbedBuilder()
                                .setColor('#DC92FF')
                                .setAuthor({ name: 'Pista Añadida', iconURL: musicIcons.correctIcon })
                                .setFooter({ text: `Solicitado por: ${user.username}`, iconURL: user.displayAvatarURL() })
                                .setDescription(`🎵 Añadida **${track.info.title}** a la cola.`);
                
                            const reply = await interaction.editReply({ embeds: [embed] });
                            setTimeout(() => reply.delete().catch(() => {}), 3000);
                
                            if (!player.playing && !player.paused) player.play();
                        }
                    } catch (error) {
                        console.error('Error al resolver consulta:', error);
                    
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('❌ Ocurrió un error')
                            .setDescription('Algo salió mal al procesar tu solicitud.\n\n**Consejos:**\n- Prueba cambiar el Lavalink en la configuración.\n- Verifica la URL de la pista/playlist.')
                            .setFooter({ text: 'All In One Music', iconURL: musicIcons.alertIcon })
                            .setTimestamp();
                    
                        const reply = await interaction.editReply({ embeds: [errorEmbed] });
                    
                        setTimeout(() => {
                            reply.delete().catch(() => {});
                        }, 6000);
                    }
                    
                    break;
                }
                
                case 'nowplaying': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const currentTrack = player.current;
                    if (!currentTrack) {
                        await interaction.editReply({ content: '❌ No hay ninguna canción reproduciéndose ahora mismo.' });
                        return;
                    }
                    
                    const progress = player.createProgressBar();
                    const embed = new EmbedBuilder()
                        .setColor('#1DB954')
                        .setAuthor({ name: 'Reproduciendo Ahora', iconURL: musicIcons.musicNote })
                        .setDescription(`🎵 **${currentTrack.info.title}**\n\n${progress}\n\nSolicitado por: <@${currentTrack.requester.id}>`)
                        .setThumbnail(currentTrack.info.image)
                        .setFooter({ text: 'All In One Music', iconURL: musicIcons.correctIcon });
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
                
                case 'loop': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const mode = interaction.options.getString('mode');
                    if (!['none', 'track', 'queue'].includes(mode)) {
                        await interaction.editReply({ content: '❌ El modo debe ser uno de: none, track, queue.' });
                        return;
                    }
                    
                    if (mode === 'none') {
                        player.setRepeatMode(0);
                        await interaction.editReply({ content: '⏹️ Repetición desactivada.' });
                    } else if (mode === 'track') {
                        player.setRepeatMode(1);
                        await interaction.editReply({ content: '🔂 Repetición de pista activada.' });
                    } else if (mode === 'queue') {
                        player.setRepeatMode(2);
                        await interaction.editReply({ content: '🔁 Repetición de cola activada.' });
                    }
                    break;
                }
                
                case 'pause': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    if (player.paused) {
                        await interaction.editReply({ content: '❌ La música ya está pausada.' });
                        return;
                    }
                    
                    player.pause(true);
                    await interaction.editReply({ content: '⏸️ Música pausada.' });
                    break;
                }
                
                case 'resume': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    if (!player.paused) {
                        await interaction.editReply({ content: '❌ La música ya está reproduciéndose.' });
                        return;
                    }
                    
                    player.pause(false);
                    await interaction.editReply({ content: '▶️ Música reanudada.' });
                    break;
                }
                
                case 'shuffle': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    player.queue.shuffle();
                    await interaction.editReply({ content: '🔀 Cola mezclada.' });
                    break;
                }
                
                case 'skip': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    if (!player.queue.current) {
                        await interaction.editReply({ content: '❌ No hay canción para saltar.' });
                        return;
                    }
                    
                    player.queue.skip();
                    await interaction.editReply({ content: '⏭️ Canción saltada.' });
                    break;
                }
                
                case 'stop': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    player.queue.clear();
                    player.stop();
                    await interaction.editReply({ content: '⏹️ Reproductor detenido y cola limpiada.' });
                    break;
                }
                
                case 'queue': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const queue = player.queue;
                    if (queue.size === 0) {
                        await interaction.editReply({ content: '❌ La cola está vacía.' });
                        return;
                    }
                    
                    const trackList = queue.map((track, i) => `**${i + 1}.** ${track.info.title} - solicitado por <@${track.requester.id}>`).slice(0, 10).join('\n');
                    
                    const embed = new EmbedBuilder()
                        .setColor('#1DB954')
                        .setTitle('🎶 Cola de Reproducción')
                        .setDescription(trackList)
                        .setFooter({ text: queue.size > 10 ? `+ ${queue.size - 10} más pistas...` : 'Fin de la cola' });
                    
                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
                
                case 'remove': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const trackNumber = interaction.options.getInteger('track') - 1;
                    
                    if (trackNumber < 0 || trackNumber >= player.queue.size) {
                        await interaction.editReply({ content: '❌ Número de pista inválido.' });
                        return;
                    }
                    
                    const removedTrack = player.queue.remove(trackNumber);
                    await interaction.editReply({ content: `🗑️ Eliminada **${removedTrack.info.title}** de la cola.` });
                    break;
                }

                case 'volume': {
                    const player = await checkPlayerExists();
                    if (!player) return;
                    
                    const volume = interaction.options.getInteger('level');
                    if (volume < 0 || volume > 100) {
                        await interaction.editReply({ content: '❌ El volumen debe estar entre 0 y 100.' });
                        return;
                    }
                    
                    player.setVolume(volume);
                    const reply = await interaction.editReply({ content: `🔊 Volumen ajustado a **${volume}%**.` });
                    setTimeout(() => reply.delete().catch(() => {}), 3000);
                    break;
                }

                case 'createplaylist': {
                    try {
                        const name = interaction.options.getString('name');
                        const visibility = interaction.options.getString('visibility');

                        const existingPlaylist = await playlistCollection.findOne({ name, owner: userId });
                        if (existingPlaylist) {
                            await interaction.editReply({ content: `❌ Ya existe una playlist con ese nombre.` });
                            return;
                        }

                        await playlistCollection.insertOne({
                            name,
                            owner: userId,
                            visibility,
                            songs: []
                        });

                        const reply = await interaction.editReply({ content: `✅ Playlist **${name}** creada como **${visibility}**.` });
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                    } catch (error) {
                        console.error('Error al crear playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudo crear la playlist. Intenta más tarde.' });
                    }
                    break;
                }

                case 'playplaylist': {
                    if (!await checkVoiceChannel()) return;
                    
                    try {
                        const name = interaction.options.getString('name');
                        const playlist = await playlistCollection.findOne({ name });
                    
                        if (!playlist) {
                            await interaction.editReply({ content: `❌ Playlist **${name}** no encontrada.` });
                            return;
                        }
                    
                        if (playlist.visibility === 'private' && playlist.owner !== userId) {
                            await interaction.editReply({ content: `❌ No tienes permiso para reproducir esta playlist privada.` });
                            return;
                        }
                    
                        if (playlist.songs.length === 0) {
                            await interaction.editReply({ content: `❌ Esta playlist está vacía.` });
                            return;
                        }
                    
                        let player = await getOrCreatePlayer();
                        if (!player) return;
                    
                        // Resolver y agregar todas las canciones de la playlist
                        let addedTracks = 0;
                        for (const song of playlist.songs) {
                            try {
                                const resolve = await client.riffy.resolve({ query: song, requester: interaction.user });
                    
                                if (resolve.tracks.length > 0) {
                                    const track = resolve.tracks[0];
                                    track.requester = interaction.user;
                                    player.queue.add(track);
                                    addedTracks++;
                                }
                            } catch (error) {
                                console.warn(`No se pudo resolver la pista: ${song}`, error);
                            }
                        }
                    
                        if (addedTracks === 0) {
                            await interaction.editReply({ content: `❌ No se pudieron resolver pistas válidas de la playlist **${name}**.` });
                            return;
                        }
                    
                        const reply = await interaction.editReply({ content: `🎵 Reproduciendo playlist **${name}** con **${addedTracks}** canciones!` });
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                        
                        if (!player.playing && !player.paused) {
                            player.play();
                        }
                    } catch (error) {
                        console.error('Error al reproducir playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudo reproducir la playlist. Intenta más tarde.' });
                    }
                    break;
                }

                case 'viewmyplaylists': {
                    try {
                        const playlists = await playlistCollection.find({ owner: userId }).toArray();
                        if (playlists.length === 0) {
                            await interaction.editReply({ content: `❌ No tienes playlists guardadas.` });
                            return;
                        }

                        const embed = new EmbedBuilder()
                            .setColor('#3498db')
                            .setTitle('🎶 Tus Playlists')
                            .setDescription(playlists.map(p => `- **${p.name}** (${p.visibility})`).join('\n'));

                        await interaction.editReply({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error al ver playlists:', error);
                        await interaction.editReply({ content: '❌ No se pudieron obtener las playlists. Intenta más tarde.' });
                    }
                    break;
                }

                case 'viewmyplaylistsongs': {
                    try {
                        const playlistName = interaction.options.getString('name');
                        const playlist = await playlistCollection.findOne({ name: playlistName });
            
                        if (!playlist) {
                            await interaction.editReply({ content: `❌ Playlist **${playlistName}** no encontrada.` });
                            return;
                        }
            
                        if (playlist.visibility === 'private' && playlist.owner !== userId) {
                            await interaction.editReply({ content: `❌ No tienes permiso para ver esta playlist privada.` });
                            return;
                        }
            
                        if (playlist.songs.length === 0) {
                            await interaction.editReply({ content: `❌ Esta playlist está vacía.` });
                            return;
                        }
            
                        const songList = playlist.songs.slice(0, 10).map((song, index) => `**${index + 1}.** ${song}`).join('\n');
            
                        const embed = new EmbedBuilder()
                            .setColor('#3498db')
                            .setTitle(`🎵 Canciones en ${playlistName}`)
                            .setDescription(songList)
                            .setFooter({ text: playlist.songs.length > 10 ? `+ ${playlist.songs.length - 10} canciones más...` : "Fin de la playlist" });
            
                        await interaction.editReply({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error al ver canciones de playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudieron obtener las canciones. Intenta más tarde.' });
                    }
                    break;
                }

                case 'allplaylists': {
                    try {
                        const playlists = await playlistCollection.find({ visibility: 'public' }).toArray();
                        if (playlists.length === 0) {
                            await interaction.editReply({ content: `❌ No hay playlists públicas disponibles.` });
                            return;
                        }

                        const embed = new EmbedBuilder()
                            .setColor('#2ECC71')
                            .setTitle('🌍 Playlists Públicas')
                            .setDescription(playlists.map(p => `- **${p.name}** (Dueño: <@${p.owner}>)`).join('\n'));

                        await interaction.editReply({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error al obtener playlists públicas:', error);
                        await interaction.editReply({ content: '❌ No se pudieron obtener las playlists públicas. Intenta más tarde.' });
                    }
                    break;
                }

                case 'deletesong': {
                    try {
                        const playlistName = interaction.options.getString('playlist');
                        const songIndex = interaction.options.getInteger('index') - 1;
                        
                        const playlist = await playlistCollection.findOne({ name: playlistName });
                        
                        if (!playlist) {
                            await interaction.editReply({ content: `❌ Playlist **${playlistName}** no encontrada.` });
                            return;
                        }
                        
                        if (playlist.owner !== userId) {
                            await interaction.editReply({ content: '❌ Solo puedes eliminar canciones de tus propias playlists.' });
                            return;
                        }
                        
                        if (songIndex < 0 || songIndex >= playlist.songs.length) {
                            await interaction.editReply({ content: '❌ Índice de canción inválido.' });
                            return;
                        }
                        
                        const removedSong = playlist.songs[songIndex];
                        
                        playlist.songs.splice(songIndex, 1);
                        
                        await playlistCollection.updateOne(
                            { name: playlistName, owner: userId },
                            { $set: { songs: playlist.songs } }
                        );
                        
                        const reply = await interaction.editReply({ content: `✅ Eliminada **${removedSong}** de la playlist **${playlistName}**.` });
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                    } catch (error) {
                        console.error('Error al eliminar canción de playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudo eliminar la canción. Intenta más tarde.' });
                    }
                    break;
                }

                case 'deleteplaylist': {
                    try {
                        const playlistName = interaction.options.getString('name');
                        
                        const playlist = await playlistCollection.findOne({ name: playlistName });
                        
                        if (!playlist) {
                            await interaction.editReply({ content: `❌ Playlist **${playlistName}** no encontrada.` });
                            return;
                        }
                        
                        if (playlist.owner !== userId) {
                            await interaction.editReply({ content: '❌ Solo puedes eliminar tus propias playlists.' });
                            return;
                        }
                        
                        await playlistCollection.deleteOne({ name: playlistName, owner: userId });
                        
                        const reply = await interaction.editReply({ content: `✅ Playlist **${playlistName}** eliminada.` });
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                    } catch (error) {
                        console.error('Error al eliminar playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudo eliminar la playlist. Intenta más tarde.' });
                    }
                    break;
                }

                case 'autoplay': {
                    if (!await checkVoiceChannel()) return;
                    
                    try {
                        const enable = interaction.options.getBoolean('enabled');
                        await autoplayCollection.updateOne(
                            { guildId },
                            { $set: { autoplay: enable } },
                            { upsert: true }
                        );
                    
                        const reply = await interaction.editReply({
                            content: `✅ Autoplay ahora está **${enable ? 'activado' : 'desactivado'}**.`
                        });
                    
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                        
                        const player = client.riffy.players.get(guildId);
                        if (player) {
                            player.autoplay = enable;
                        }
                    } catch (error) {
                        console.error('Error al configurar autoplay:', error);
                        await interaction.editReply({ content: '❌ No se pudo configurar el autoplay. Intenta más tarde.' });
                    }
                    break;
                }

                case 'addsong': {
                    try {
                        const playlistName = interaction.options.getString('playlist');
                        const songInput = interaction.options.getString('song'); 
            
                        const playlist = await playlistCollection.findOne({ name: playlistName });
            
                        if (!playlist) {
                            await interaction.editReply({ content: `❌ Playlist **${playlistName}** no encontrada.` });
                            return;
                        }
            
                        if (playlist.owner !== userId && playlist.visibility === 'private') {
                            await interaction.editReply({ content: `❌ No tienes permiso para agregar canciones a esta playlist privada.` });
                            return;
                        }
            
                        await playlistCollection.updateOne(
                            { name: playlistName },
                            { $push: { songs: songInput } }
                        );
            
                        const reply = await interaction.editReply({ content: `✅ Añadida **"${songInput}"** a la playlist **${playlistName}**.` });
                        setTimeout(() => reply.delete().catch(() => {}), 3000);
                    } catch (error) {
                        console.error('Error al agregar canción a playlist:', error);
                        await interaction.editReply({ content: '❌ No se pudo agregar la canción. Intenta más tarde.' });
                    }
                    break;
                }

                default:
                    await interaction.editReply({ content: `❌ Subcomando desconocido: ${subcommand}` });
                    break;
            }
        } catch (error) {
            const msg = '❌ Ocurrió un error al ejecutar el comando. Intenta más tarde.';
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: msg }).catch(() => {});
            } else {
                await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
            }
        }
    }
};
