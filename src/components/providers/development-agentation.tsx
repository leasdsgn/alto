'use client'

import dynamic from 'next/dynamic'

const Agentation =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('agentation').then((mod) => mod.Agentation), { ssr: false })
    : function AgentationDisabled() {
        return null
      }

export function DevelopmentAgentation() {
  return <Agentation />
}
