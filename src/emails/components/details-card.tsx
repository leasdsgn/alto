import { Row, Column, Section, Text } from '@react-email/components'
import { colors } from './email-layout'

interface DetailItem {
  label: string
  value: string
}

interface DetailsCardProps {
  title: string
  items: DetailItem[]
}

export function DetailsCard({ title, items }: DetailsCardProps) {
  return (
    <Section style={cardStyle}>
      <Text style={titleStyle}>{title}</Text>
      {items.map((item) => (
        <Row key={item.label} style={rowStyle}>
          <Column style={labelColumnStyle}>
            <Text style={labelStyle}>{item.label}</Text>
          </Column>
          <Column style={valueColumnStyle}>
            <Text style={valueStyle}>{item.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  )
}

const cardStyle = {
  backgroundColor: '#ffffff',
  borderTop: `1px solid ${colors.border}`,
  borderBottom: `1px solid ${colors.border}`,
  padding: '20px 24px',
  margin: '24px 0',
}

const titleStyle = {
  color: colors.primary,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
}

const rowStyle = {
  marginBottom: '10px',
}

const labelColumnStyle = {
  width: '40%',
  verticalAlign: 'top' as const,
}

const valueColumnStyle = {
  width: '60%',
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
}

const labelStyle = {
  color: colors.secondary,
  fontSize: '14px',
  lineHeight: '1.5',
  margin: 0,
}

const valueStyle = {
  color: colors.primary,
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: 0,
}
