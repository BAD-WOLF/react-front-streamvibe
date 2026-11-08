// NOTA (nov/2026): voltou a ser CommonJS puro. O `globalThis.global.require`
// não existe (require é do módulo, não global) e quebrava o `yarn i18n:extract`.
const locales = require("./locales.json");

/** @type {import('i18next-parser').UserConfig} */
module.exports = {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'translations/$NAMESPACE.$LOCALE.json',

    defaultNamespace: 'messages',
    namespace: ['messages'],
    ...locales,
    keySeparator: ' ',
    namespaceSeparator: false, // o nome da opção no i18next-parser (nsSeparator é do i18next)

    // NOTA (nov/2026): sem os catálogos *_old.json, que o extrator criava a
    // cada execução com as chaves removidas e que acabavam no git por engano.
    createOldCatalogs: false,

    useKeysAsDefaultValue: false, // don't copy the raw key
    // NOTA (nov/2026): o valor padrão é a própria chave. Antes ele trocava "." por
    // espaço (resto de quando a chave era separada por ponto) e cortava o ponto final das frases.
    defaultValue: (lng, ns, key) => key,

    lexers: {
        ts: ['JavascriptLexer'],
        tsx: ['JsxLexer'],
        js: ['JavascriptLexer'],
        jsx: ['JsxLexer']
    },

    reactNamespace: true,
    trans: {component: 'Trans', i18nKey: 'i18nKey', defaultsKey: 'defaults'}
};
