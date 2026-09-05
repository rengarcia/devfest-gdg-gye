/**
 * Adds the page documents and the site chrome fields to a dataset that already has the
 * collections (tracks, speakers, ...). Run it once from this folder, logged in with the CLI:
 *
 *   npm run seed:pages
 *
 * It never overwrites: existing pages and settings fields are kept, so it can be re-run.
 */
import {getCliClient} from 'sanity/cli'
import {seedPages} from './lib/pages'

const client = getCliClient({apiVersion: '2026-09-05'})

async function main() {
  const {projectId, dataset} = client.config()
  console.log(`Sembrando páginas en ${projectId}/${dataset}…`)
  await seedPages(client)
  console.log('Listo.')
}

main()
