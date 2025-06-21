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

Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { EmbedBuilder } = require("discord.js");

const ruleEmbeds = {
    spam: new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚫 Spam Rules")
        .setDescription(
            "**1️⃣ No espamear mensajes:** Evite enviar demasiados mensajes en poco tiempo.\n" +
            "**2️⃣ No espamear emojis:** No inundes el chat con emojis o stickers.\n" +
            "**3️⃣ No spamear reacciones:**  No agregar/quitar reacciones repetidamente.\n"
        ),

    nsfw: new EmbedBuilder()
        .setColor("DarkPurple")
        .setTitle("🔞 NSFW Rules")
        .setDescription(
            "**1️⃣ No se permite contenido NSFW:** Esto incluye imágenes, texto o enlaces.\n" +
            "**2️⃣ No bromas ni conversaciones inapropiadas:** Mantén el chat limpio.\n" +
            "**3️⃣ No acoso sexual:** Está prohibido hacer comentarios explícitos o sugerentes.\n" +
            "**4️⃣ No juegos de rol para adultos:** Este no es un servidor +18."
        ),

    discord_terms: new EmbedBuilder()
        .setColor("Blue")
        .setTitle("📜 Discord Terms & Conditions")
        .setDescription(
            "**1️⃣ Sigue los [Términos de Servicio de Discord](https://discord.com/terms)**.\n" +
            "**2️⃣ Sigue las [Normas de la Comunidad de Discord](https://discord.com/guidelines)**.\n" +
            "**3️⃣ No uses bots, hacks o exploits no autorizados.**\n" +
            "**4️⃣ No participes en fraudes, estafas o phishing.**"
        ),

    harassment: new EmbedBuilder()
        .setColor("Orange")
        .setTitle("🚷 Harassment Rules")
        .setDescription(
            "**1️⃣ No ataques personales: no insultes ni ataques a otros.\n" +
            "**2️⃣ No discrimines:** Está prohibido el racismo, sexismo, homofobia o discriminación.\n" +
            "**3️⃣ No amenazas ni doxing:** No amenaces ni compartas datos privados.\n" +
            "**4️⃣ No trolling excesivo:** Bromas ligeras están bien, ser molesto no."
        ),

    links: new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("🔗 Link Rules")
        .setDescription(
            "**1️⃣ No publicar enlaces dañinos:** Malware, estafas o enlaces NSFW no están permitidos.\n" +
            "**2️⃣ No autopromoción fuera de los canales dedicados:** La publicidad solo donde esté permitido.\n" +
            "**3️⃣ No sacar la IP, rastreadores o enlaces acortados:** Comparte solo URLs seguras y verificables."
        ),

    images: new EmbedBuilder()
        .setColor("#FF00FF")
        .setTitle("🖼️ Image Rules")
        .setDescription(
            "**1️⃣ No imágenes NSFW o explícitas:** Este es un espacio seguro.\n" +
            "**2️⃣ No violencia gráfica o gore:** Mantén el contenido apropiado.\n" +
            "**3️⃣ No spam de memes:** Mantén los memes razonables.\n" +
            "**4️⃣ No imágenes ofensivas o discriminatorias.**"
        ),

    hacking: new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛑 Hacking Rules")
        .setDescription(
            "**1️⃣ No hackear, hacer trampas o explotar:** No intentes hackear bots, servidores o usuarios.\n" +
            "**2️⃣ No compartir exploits o scripts:** El software no autorizado está prohibido.\n" +
            "**3️⃣ No ingeniería social o phishing:** No engañes a usuarios para obtener información sensible.\n" +
            "**4️⃣ No usar cuentas alternativas para evadir baneos o restricciones.**"
        ),

    mic_spam: new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("🎤 Mic Spam Rules")
        .setDescription(
            "**1️⃣ No sonidos fuertes, distorsionados o molestos:** No interrumpas intencionalmente los chats de voz.\n" +
            "**2️⃣ No modificadores de voz o soundboards:** A menos que esté permitido en canales específicos.\n" +
            "**3️⃣ No poner música por el micrófono:** Usa los bots de música designados.\n" +
            "**4️⃣ No gritar en exceso.**"
        ),

    bot_usage: new EmbedBuilder()
        .setColor("#008000")
        .setTitle("🤖 Bot Usage Rules")
        .setDescription(
            "**1️⃣ No abusar de los comandos de bots:** Úsalos con responsabilidad.\n" +
            "**2️⃣ No spamear comandos de bots en los canales principales:** Úsalos en los canales de bots.\n" +
            "**3️⃣ No intentes hackear o explotar los bots.**"
        ),

    trading_selling: new EmbedBuilder()
        .setColor("#8B4513")
        .setTitle("💰 Trading & Selling Rules")
        .setDescription(
            "**1️⃣ No vender cuentas, artículos o servicios:** Este no es un mercado.\n" +
            "**2️⃣ No intercambios o actividades de apuestas:** Usa plataformas confiables.\n" +
            "**3️⃣ No publicitar negocios personales sin permiso.**"
        ),

    language: new EmbedBuilder()
        .setColor("#4682B4")
        .setTitle("🗣️ Language Rules")
        .setDescription(
            "**1️⃣ Solo Español en los canales generales:** Usa otros canales para otros idiomas.\n" +
            "**2️⃣ No lenguaje excesivamente vulgar:** Mantén el chat amigable.\n" +
            "**3️⃣ No insultos, ofensas o lenguaje discriminatorio.**"
        ),

    spoilers: new EmbedBuilder()
        .setColor("#A52A2A")
        .setTitle("🎥 Spoiler Rules")
        .setDescription(
            "**1️⃣ Usa etiquetas de spoiler para spoilers importantes:** Ejemplo: `||spoiler aquí||`.\n" +
            "**2️⃣ No publiques spoilers fuera de los canales designados.**"
        ),

    self_promotion: new EmbedBuilder()
        .setColor("#9370DB")
        .setTitle("📢 Self-Promotion Rules")
        .setDescription(
            "**1️⃣ No autopromoción fuera de los canales dedicados.**\n" +
            "**2️⃣ No publicidad por mensajes privados:** No envíes enlaces no solicitados a miembros.\n" +
            "**3️⃣ No pedir seguidores, suscriptores o donaciones.**"
        ),

    moderation: new EmbedBuilder()
        .setColor("#228B22")
        .setTitle("⚖️ Moderation Rules")
        .setDescription(
            "**1️⃣ Respeta a los moderadores y sus decisiones.**\n" +
            "**2️⃣ No moderes por tu cuenta:** Deja que el staff se encargue.\n" +
            "**3️⃣ Si tienes preocupaciones, contacta al staff por privado.**"
        )
};

module.exports = ruleEmbeds;
