import { StoryblokServerComponent, storyblokEditable } from '@storyblok/react/rsc'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

interface PageBlokProps {
  blok: Blok
}

export function PageBlok({ blok }: PageBlokProps) {
  const body = Array.isArray(blok.body) ? (blok.body as Blok[]) : []
  return (
    <main {...storyblokEditable(blok as Editable)}>
      {body.map((item, index) => (
        <StoryblokServerComponent
          key={(item._uid as string | undefined) ?? `${item.component}-${index}`}
          blok={item}
        />
      ))}
    </main>
  )
}
