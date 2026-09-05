import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'l2u3btbc',
    dataset: 'production',
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
    appId: 'erfrok8zvbrc2cgjyh98m60f',
  },
  /**
   * TypeGen for the Astro site next door. Run `npm run typegen` after changing the schema or a
   * query; it extracts the schema with required fields enforced and regenerates the types file.
   */
  typegen: {
    path: '../gdg-gye-devfest-fe/src/**/*.{ts,astro}',
    schema: 'schema.json',
    generates: '../gdg-gye-devfest-fe/sanity.types.ts',
    overloadClientMethods: true,
    // The site prettier-ignores the generated file; formatting here would need its Astro plugin.
    formatGeneratedCode: false,
  },
})
