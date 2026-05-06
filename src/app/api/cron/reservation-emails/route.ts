import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authorization !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    disabled: true,
    reason: 'reservation emails temporarily disabled',
  })
}
