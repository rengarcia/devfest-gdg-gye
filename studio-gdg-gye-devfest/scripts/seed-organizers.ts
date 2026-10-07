/**
 * Replaces the placeholder organizers of the first seed with the GDG Guayaquil team
 * (./lib/organizers.ts). Run it from this folder, logged in with the CLI:
 *
 *   npm run seed:organizers
 *
 * It only deletes the placeholder names and rewrites the listed people, so it can be re-run.
 */
import {getCliClient} from 'sanity/cli'
import {syncOrganizers} from './lib/organizers'

const client = getCliClient({apiVersion: '2026-09-05'})

async function main() {
  const {projectId, dataset} = client.config()
  console.log(`Actualizando organizadores en ${projectId}/${dataset}…`)
  await syncOrganizers(client)
  console.log('Listo.')
}

main()
