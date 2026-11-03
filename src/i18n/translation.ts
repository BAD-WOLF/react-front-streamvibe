import type {UseTranslationResponse} from 'react-i18next';

/** O retorno do useTranslation() no namespace padrão do projeto ("messages"). */
export type Translation = UseTranslationResponse<'messages', undefined>;
