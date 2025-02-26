import { defineEndpoint } from "@directus/extensions-sdk";

export default defineEndpoint({
  id: "favicon.ico",
  handler: (router, context) => {
    const { services, getSchema } = context;
    const { AssetsService, SettingsService } = services;

    router.get("/", async (req, res) => {
      try {
        const assetsService = new AssetsService({
          schema: await getSchema(),
        });

        const settingsService = new SettingsService({
          schema: await getSchema(),
        });

        const settings = await settingsService.readSingleton({
          fields: ["public_favicon"],
        });

        if (!settings.public_favicon) {
          return res.sendStatus(204);
        }

        const asset = await assetsService.getAsset(settings.public_favicon);

        const { stream, file } = asset;

        res.header("Content-Type", file.type);
        res.header(
          "Content-Disposition",
          `inline; filename="${file.filename_download}"`
        );

        stream.pipe(res).on("error", (e) => {
          throw e;
        });
      } catch (e) {
        console.error("Error fetching favicon:", e);
        res.sendStatus(500);
      }
    });
  },
});
