import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (resendClient) return resendClient

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY requis')
  }

  resendClient = new Resend(apiKey)
  return resendClient
}

export function getFromAddress(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL
  const fromName = process.env.RESEND_FROM_NAME ?? 'Alto'

  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL requis')
  }

  return `${fromName} <${fromEmail}>`
}

interface SendEmailArgs {
  to: string
  subject: string
  react: React.ReactElement
  replyTo?: string
}

export async function sendEmail(args: SendEmailArgs) {
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: args.to,
    subject: args.subject,
    react: args.react,
    ...(args.replyTo && { replyTo: args.replyTo }),
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`)
  }

  return data
}
