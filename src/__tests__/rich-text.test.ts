import { describe, expect, it } from 'vitest'
import { richTextToPlainText } from '@/components/storyblok/rich-text'

describe('richTextToPlainText', () => {
  it('extrait les titres, paragraphes et listes pour le temps de lecture', () => {
    expect(
      richTextToPlainText({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Le quartier' }],
          },
          {
            type: 'bullet_list',
            content: [
              {
                type: 'list_item',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Une première adresse' }],
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toBe('Le quartier Une première adresse')
  })
})
