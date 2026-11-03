// NOTA (nov/2026): o formato de toda resposta da API (veja a wiki do backend,
// "Referência da API"). Sucesso: {success, data, message}; erro:
// {success: false, error: {type, message, errors?, action_required?}}.

export type ApiSuccessBody<T> = {
    success: true;
    data: T;
    message: string | null;
};

export type ApiErrorDetails = {
    type: string;
    message: string;
    /** Só em erros de validação: uma linha por campo ("Email: ..."). */
    errors?: string[];
    /** Só quando há um próximo passo: "email_verification" ou "request_new_token". */
    action_required?: string;
};

export type ApiErrorBody = {
    success: false;
    error: ApiErrorDetails;
};

/** Formato dos 401 do LexikJWTAuthenticationBundle (login, JWT e refresh). */
export type LexikErrorBody = {
    code: number;
    message: string;
};

/** O que os services devolvem: o `data` do envelope e a mensagem da API. */
export type ApiResult<T> = {
    data: T;
    message: string | null;
};

/** Paginação achatada das listas de filmes. */
export type Pagination = {
    current_page: number;
    total_pages: number;
    total_results: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
};
