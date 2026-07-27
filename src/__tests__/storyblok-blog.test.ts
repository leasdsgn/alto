import { describe, expect, it } from 'vitest'
import type { BlogArticle } from '@/lib/blog-data'
import { mapStoryblokArticle, resolveRelatedArticles } from '@/lib/storyblok-blog'

describe('blog Storyblok', () => {
  it('conserve le rich text et les références d’articles', () => {
    const richText = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Un paragraphe avec un lien interne.' }],
        },
      ],
    }
    const article = mapStoryblokArticle(
      {
        uuid: 'article-1',
        name: 'Guide du Marais',
        slug: 'guide-du-marais',
        full_slug: 'blog/guide-du-marais',
        content: {
          component: 'blog_article',
          title: 'Guide du Marais',
          excerpt: 'Une promenade dans le quartier.',
          category: 'Quartiers',
          section: 'paris',
          body: [
            {
              component: 'article_rich_text',
              heading: 'Commencer la visite',
              body: richText,
            },
          ],
          related_articles: ['article-2'],
        },
      },
      'fr',
    )

    expect(article?.uuid).toBe('article-1')
    expect(article?.sections[0]?.body).toEqual(richText)
    expect(article?.relatedArticleUuids).toEqual(['article-2'])
  })

  it('priorise les relations éditoriales puis complète avec la même section', () => {
    const current = makeArticle('current', 'uuid-current', 'paris', ['uuid-voyage'])
    const paris = makeArticle('paris', 'uuid-paris', 'paris')
    const voyage = makeArticle('voyage', 'uuid-voyage', 'voyage')

    expect(resolveRelatedArticles(current, [current, paris, voyage])).toEqual([voyage, paris])
  })
})

function makeArticle(
  slug: string,
  uuid: string,
  section: BlogArticle['section'],
  relatedArticleUuids: string[] = [],
): BlogArticle {
  return {
    uuid,
    slug,
    title: slug,
    subtitle: '',
    date: '',
    category: '',
    image: '/image.jpg',
    section,
    relatedArticleUuids,
    sections: [],
  }
}
