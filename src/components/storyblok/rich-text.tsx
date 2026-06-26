import { Fragment, type ReactNode } from 'react'

interface RichTextDoc {
  type: 'doc'
  content?: RichTextNode[]
}

interface RichTextNode {
  type: string
  content?: RichTextNode[]
  text?: string
  attrs?: Record<string, unknown>
  marks?: { type: string; attrs?: Record<string, unknown> }[]
}

export function renderRichText(value: unknown): ReactNode {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return null
  const doc = value as RichTextDoc
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return null

  return doc.content.map((node, index) => (
    <Fragment key={index}>{renderNode(node, index)}</Fragment>
  ))
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="text-coffee text-body mt-4 first:mt-0 leading-relaxed">
          {renderChildren(node.content)}
        </p>
      )
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2
      const Tag = (`h${Math.min(Math.max(level, 2), 4)}`) as 'h2' | 'h3' | 'h4'
      const classByLevel: Record<number, string> = {
        2: 'text-coffee text-h3 mt-10 first:mt-0',
        3: 'text-coffee text-h4 mt-8 first:mt-0',
        4: 'text-coffee text-body-xl mt-6 font-semibold first:mt-0',
      }
      return (
        <Tag key={key} className={classByLevel[level] ?? classByLevel[3]}>
          {renderChildren(node.content)}
        </Tag>
      )
    }
    case 'bullet_list':
      return (
        <ul key={key} className="text-coffee text-body mt-4 list-disc space-y-1 pl-6">
          {renderChildren(node.content)}
        </ul>
      )
    case 'ordered_list':
      return (
        <ol key={key} className="text-coffee text-body mt-4 list-decimal space-y-1 pl-6">
          {renderChildren(node.content)}
        </ol>
      )
    case 'list_item':
      return <li key={key}>{renderChildren(node.content)}</li>
    case 'horizontal_rule':
      return <hr key={key} className="border-divider my-8" />
    case 'hard_break':
      return <br key={key} />
    case 'text':
      return renderText(node, key)
    default:
      return renderChildren(node.content)
  }
}

function renderChildren(children: RichTextNode[] | undefined): ReactNode {
  if (!Array.isArray(children)) return null
  return children.map((child, index) => (
    <Fragment key={index}>{renderNode(child, index)}</Fragment>
  ))
}

function renderText(node: RichTextNode, key: number): ReactNode {
  if (typeof node.text !== 'string') return null
  let element: ReactNode = node.text

  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        element = <strong>{element}</strong>
        break
      case 'italic':
        element = <em>{element}</em>
        break
      case 'underline':
        element = <span className="underline">{element}</span>
        break
      case 'link': {
        const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '#'
        const target = mark.attrs?.target === '_blank' ? '_blank' : undefined
        element = (
          <a
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-coffee underline"
          >
            {element}
          </a>
        )
        break
      }
      default:
        break
    }
  }

  return <Fragment key={key}>{element}</Fragment>
}
