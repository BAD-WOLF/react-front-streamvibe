// NOTA (nov/2026): os passos da troca de senha, um para cada resposta da API.
// Saiu o "validate" (a rota /reset-password/validate não existe mais; agora é
// GET /reset-password/status/{token}). Virou enum, como o AuthMode: o mesmo
// nome serve de valor (RepasswordMode.Reset) e de tipo (mode: RepasswordMode).
export enum RepasswordMode {
    Request = "request",       // pedir o link (POST /reset-password)
    Requested = "requested",   // resposta do pedido (email_sent, expires_at)
    Checking = "checking",     // conferindo o token do link (GET /reset-password/status/{token})
    Reset = "reset",           // definir a senha nova (POST /reset-password/confirm)
    Done = "done",             // senha trocada
    Cancelled = "cancelled",   // pedido cancelado (POST /reset-password/cancel)
    Invalid = "invalid",       // token inválido, usado ou cancelado (400)
    Expired = "expired",       // token vencido (410)
}
