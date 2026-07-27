import { blok, findStoryByFullSlug, updateStoryContent } from './seed-utils'

const FOOTER_SLUG = 'globals/footer'
const WHATSAPP_LINK =
  'https://wa.me/33617222098?text=Bonjour%2C%20je%20souhaite%20contacter%20Alto%20au%20sujet%20d%27un%20s%C3%A9jour.'

async function main() {
  const story = await findStoryByFullSlug(FOOTER_SLUG)
  if (!story) throw new Error(`Story ${FOOTER_SLUG} introuvable`)

  const currentButton = Array.isArray(story.content.cta_button) ? story.content.cta_button[0] : null
  const ctaButton = isRecord(currentButton)
    ? {
        ...currentButton,
        label: 'Chat on WhatsApp',
        link: { url: WHATSAPP_LINK, linktype: 'url' },
        opens_in_new_tab: true,
      }
    : blok('cta_button', {
        label: 'Chat on WhatsApp',
        link: { url: WHATSAPP_LINK, linktype: 'url' },
        opens_in_new_tab: true,
      })

  await updateStoryContent(story.id, {
    ...story.content,
    cta_body: 'Disponible tous les jours de 8 h à 20 h.',
    cta_button: [ctaButton],
  })

  console.log('✓ Footer Storyblok mis à jour')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
