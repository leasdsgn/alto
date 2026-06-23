import { t, type BookingKey } from '@/lib/i18n/booking-dictionary'
import type { InquiryLocale } from '@/types/inquiry'

export type GuestyErrorCode =
  | 'LISTING_IS_NOT_AVAILABLE'
  | 'INVALID_CC_TOKEN'
  | 'PAYMENT_FAILED'
  | 'THREE_DS_REQUIRED'
  | 'RATE_PLAN_NOT_APPLICABLE'
  | 'GUESTS_EXCEED_CAPACITY'
  | 'MIN_NIGHTS_NOT_MET'
  | 'MAX_NIGHTS_EXCEEDED'
  | 'RATE_LIMITED'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN'

export interface ParsedGuestyError {
  code: GuestyErrorCode
  httpStatus: number
  titleKey: BookingKey
  descriptionKey: BookingKey
  rawMessage: string
}

const ERROR_MAP: Record<
  GuestyErrorCode,
  { httpStatus: number; titleKey: BookingKey; descriptionKey: BookingKey }
> = {
  LISTING_IS_NOT_AVAILABLE: {
    httpStatus: 409,
    titleKey: 'errorDatesUnavailableTitle',
    descriptionKey: 'errorDatesUnavailableDesc',
  },
  RATE_PLAN_NOT_APPLICABLE: {
    httpStatus: 409,
    titleKey: 'errorDatesUnavailableTitle',
    descriptionKey: 'errorDatesUnavailableDesc',
  },
  GUESTS_EXCEED_CAPACITY: {
    httpStatus: 400,
    titleKey: 'errorValidationTitle',
    descriptionKey: 'errorValidationDesc',
  },
  MIN_NIGHTS_NOT_MET: {
    httpStatus: 400,
    titleKey: 'errorValidationTitle',
    descriptionKey: 'errorValidationDesc',
  },
  MAX_NIGHTS_EXCEEDED: {
    httpStatus: 400,
    titleKey: 'errorValidationTitle',
    descriptionKey: 'errorValidationDesc',
  },
  INVALID_CC_TOKEN: {
    httpStatus: 402,
    titleKey: 'errorInvalidCardTitle',
    descriptionKey: 'errorInvalidCardDesc',
  },
  PAYMENT_FAILED: {
    httpStatus: 402,
    titleKey: 'errorPaymentFailedTitle',
    descriptionKey: 'errorPaymentFailedDesc',
  },
  THREE_DS_REQUIRED: {
    httpStatus: 402,
    titleKey: 'errorThreeDSRequiredTitle',
    descriptionKey: 'errorThreeDSRequiredDesc',
  },
  RATE_LIMITED: {
    httpStatus: 503,
    titleKey: 'errorRateLimitedTitle',
    descriptionKey: 'errorRateLimitedDesc',
  },
  VALIDATION_FAILED: {
    httpStatus: 400,
    titleKey: 'errorValidationTitle',
    descriptionKey: 'errorValidationDesc',
  },
  UNKNOWN: {
    httpStatus: 500,
    titleKey: 'errorGenericTitle',
    descriptionKey: 'errorGenericDesc',
  },
}

export function parseGuestyError(error: unknown): ParsedGuestyError {
  const rawMessage = error instanceof Error ? error.message : String(error)
  const code = detectErrorCode(rawMessage)
  return { code, ...ERROR_MAP[code], rawMessage }
}

function detectErrorCode(message: string): GuestyErrorCode {
  const lower = message.toLowerCase()
  if (lower.includes('rate limited')) return 'RATE_LIMITED'

  const jsonMatch = message.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        error?: { code?: string; message?: string }
      }
      const code = parsed.error?.code
      const innerMessage = parsed.error?.message?.toLowerCase() ?? ''

      if (code === 'VALIDATION_ERROR' || code === 'WRONG_REQUEST_PARAMETERS') {
        if (innerMessage.includes('availability') || innerMessage.includes('dates')) {
          return 'LISTING_IS_NOT_AVAILABLE'
        }
        return 'VALIDATION_FAILED'
      }

      if (code && isKnownCode(code)) return code
    } catch {
      // fall through
    }
  }

  if (lower.includes('availability') || lower.includes('not applicable')) {
    return 'LISTING_IS_NOT_AVAILABLE'
  }

  return 'UNKNOWN'
}

function isKnownCode(code: string): code is GuestyErrorCode {
  return code in ERROR_MAP
}

export interface GuestyErrorBody {
  error: {
    code: GuestyErrorCode
    title: string
    description: string
  }
}

export function toErrorResponse(
  error: unknown,
  locale: InquiryLocale,
): { body: GuestyErrorBody; status: number } {
  const parsed = parseGuestyError(error)
  return {
    body: {
      error: {
        code: parsed.code,
        title: t(locale, parsed.titleKey),
        description: t(locale, parsed.descriptionKey),
      },
    },
    status: parsed.httpStatus,
  }
}
