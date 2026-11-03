import 'i18next';

// NOTA (nov/2026): os tipos do i18next com a mesma configuração do i18n.ts:
// namespace padrão "messages", chave separada por espaço e sem separador de
// namespace. Sem isto, o tipo do useTranslation() apontava para o namespace
// "translation", que o projeto não usa.
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'messages';
        keySeparator: ' ';
        nsSeparator: false;
    }
}
