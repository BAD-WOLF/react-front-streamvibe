// NOTA (nov/2026): os erros de validação da troca de senha, um por campo
// (o mesmo formato do AuthErrors do login e do cadastro).
export type RepasswordField = 'email' | 'password' | 'confirmPassword';

export type RepasswordErrors = Partial<Record<RepasswordField, string>>;
