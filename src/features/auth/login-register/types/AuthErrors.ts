// NOTA (nov/2026): os erros de validação do formulário, um por campo. Antes
// era Record<string, string> (qualquer chave); agora só os campos que existem.
export type AuthField = 'email' | 'password' | 'confirmPassword' | 'agreeTerms';

export type AuthErrors = Partial<Record<AuthField, string>>;
