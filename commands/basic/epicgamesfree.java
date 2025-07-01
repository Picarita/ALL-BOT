import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.events.interaction.command.SlashCommandInteractionEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import okhttp3.*;
import com.google.gson.*;

import javax.security.auth.login.LoginException;
import java.io.IOException;

public class EpicGamesBot extends ListenerAdapter {

    public static void main(String[] args) throws LoginException {
        String token = "TU_TOKEN_DE_DISCORD"; // Reemplaza con tu token real
        JDABuilder jdaBuilder = JDABuilder.createDefault(token);

        jdaBuilder.setActivity(Activity.playing("Epic Games Gratis"));
        jdaBuilder.addEventListeners(new EpicGamesBot());

        // Registrar el comando /epicgratis
        jdaBuilder.build()
            .updateCommands()
            .addCommands(Commands.slash("epicgratis", "Muestra los juegos gratuitos en Epic Games"))
            .queue();
    }

    @Override
    public void onSlashCommandInteraction(SlashCommandInteractionEvent event) {
        if (!event.getName().equals("epicgratis")) return;

        event.deferReply().queue();

        try {
            Game[] games = fetchFreeGames();
            if (games.length == 0) {
                event.getHook().sendMessage("No se encontraron juegos gratuitos.").queue();
                return;
            }

            StringBuilder response = new StringBuilder("🎁 **Juegos gratuitos en Epic Games:**\n\n");
            for (Game g : games) {
                response.append("🔗 **")
                        .append(g.title)
                        .append("**: https://www.epicgames.com/store/p/")
                        .append(g.productSlug)
                        .append("\n");
            }
            event.getHook().sendMessage(response.toString()).queue();

        } catch (Exception e) {
            event.getHook().sendMessage("❌ Error al obtener los juegos: " + e.getMessage()).queue();
        }
    }

    // === Clases y lógica para obtener los juegos gratuitos de Epic ===

    static class Game {
        String title;
        String productSlug;
    }

    static Game[] fetchFreeGames() throws IOException {
        String graphqlUrl = "https://graphql.epicgames.com/graphql";
        String queryJson = """
        {
          "query":"query freeGames { Catalog { searchStore(category: \\"freegames\\", count: 20) { elements { title productSlug price { totalPrice { discountPrice } } } } } }"
        }
        """;

        OkHttpClient client = new OkHttpClient();
        Request req = new Request.Builder()
            .url(graphqlUrl)
            .post(RequestBody.create(queryJson, MediaType.parse("application/json")))
            .build();

        try (Response res = client.newCall(req).execute()) {
            if (!res.isSuccessful()) throw new IOException("HTTP " + res.code());

            JsonObject json = JsonParser.parseReader(res.body().charStream()).getAsJsonObject();
            JsonArray elements = json.getAsJsonObject("data")
                .getAsJsonObject("Catalog")
                .getAsJsonObject("searchStore")
                .getAsJsonArray("elements");

            return new Gson().fromJson(elements, Game[].class);
        }
    }
}
