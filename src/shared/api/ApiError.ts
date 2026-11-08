import type {ApiErrorBody, LexikErrorBody} from '@shared/types/api/envelope.ts';

// `type` dos erros da API (veja "Tratamento de Erros" na wiki do backend),
// mais dois do próprio front: network_error e unauthorized.
//
// NOTA (nov/2026): viraram enum, como o AuthMode, para o `type` do ApiError
// ser tipado. Um `type` que o front ainda não conhece chega como http_error.
export enum ApiErrorType {
    Validation = 'user_validation_error',
    UserAlreadyExists = 'user_already_exists_error',
    UserNotFound = 'user_not_found_error',
    UserNotVerified = 'user_not_verified_error',
    EmailDelivery = 'email_delivery_error',
    RateLimit = 'rate_limit_exceeded_error',
    PermissionDenied = 'permission_denied_error',
    ResetTokenNotFound = 'reset_token_not_found_error',
    InvalidResetToken = 'invalid_reset_token_error',
    ExpiredResetToken = 'expired_reset_token_error',
    InvalidVerificationLink = 'invalid_verification_link_error',
    BusinessLogic = 'business_logic_error',
    ExternalService = 'external_service_error',
    Http = 'http_error',
    Internal = 'internal_error',
    Network = 'network_error',
    Unauthorized = 'unauthorized',
}

// `action_required`: o próximo passo que a API sugere.
export enum ApiAction {
    EmailVerification = 'email_verification',
    RequestNewToken = 'request_new_token',
}

const ERROR_TYPES: readonly string[] = Object.values(ApiErrorType);
const ACTIONS: readonly string[] = Object.values(ApiAction);

function isApiErrorType(value: string): value is ApiErrorType {
    return ERROR_TYPES.includes(value);
}

function isApiAction(value: string): value is ApiAction {
    return ACTIONS.includes(value);
}

/** O `type` que veio da API; um desconhecido vira http_error. */
export function toApiErrorType(value: string): ApiErrorType {
    return isApiErrorType(value) ? value : ApiErrorType.Http;
}

/** O `action_required` que veio da API; um desconhecido é ignorado. */
export function toApiAction(value: string | undefined): ApiAction | null {
    return value !== undefined && isApiAction(value) ? value : null;
}

export class ApiError extends Error {
    public readonly status: number;
    public readonly type: ApiErrorType;
    public readonly errors: string[];
    public readonly actionRequired: ApiAction | null;
    /**
     * NOTA (nov/2026): quantos segundos esperar antes de tentar de novo (o
     * header Retry-After de um 429, agora exposto no CORS da API), ou null.
     */
    public readonly retryAfterSeconds: number | null;

    public constructor(
        status: number,
        type: ApiErrorType,
        message: string,
        errors: string[] = [],
        actionRequired: ApiAction | null = null,
        retryAfterSeconds: number | null = null,
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.type = type;
        this.errors = errors;
        this.actionRequired = actionRequired;
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function isEnvelopeError(body: unknown): body is ApiErrorBody {
    if (typeof body !== 'object' || body === null) return false;
    const candidate: Partial<ApiErrorBody> = body as Partial<ApiErrorBody>;
    return candidate.success === false && typeof candidate.error?.message === 'string';
}

export function isLexikError(body: unknown): body is LexikErrorBody {
    if (typeof body !== 'object' || body === null) return false;
    const candidate: Partial<LexikErrorBody> = body as Partial<LexikErrorBody>;
    return typeof candidate.code === 'number' && typeof candidate.message === 'string';
}

/** A mensagem para a tela: a da API quando há, senão a de reserva. */
export function errorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message !== '') return error.message;
    return fallback;
}
