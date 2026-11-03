import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// NOTA (nov/2026): tipagem forte. O ESLint roda com as informações de tipo do
// TypeScript (projectService) e com o conjunto mais estrito do
// typescript-eslint (strictTypeChecked: nada de any, nada de valor "unsafe",
// nada de "!"). Por cima, as regras que cobram o tipo escrito em todo lugar:
// - typedef: variável, desestruturação, parâmetro e propriedade com tipo;
// - explicit-function-return-type: toda função com tipo de retorno, até o
//   callback de um onClick;
// - explicit-module-boundary-types: todo export tipado;
// - strict-boolean-expressions: a condição é sempre um boolean (nada de
//   "if (texto)" ou "{lista.length && ...}"; veja src/shared/utils/guards.ts);
// - switch-exhaustiveness-check: o switch de um enum/união cobre todos os casos.
// O typedef está marcado como obsoleto no typescript-eslint 8.33+, mas continua
// funcionando, e é a única regra que cobra o tipo em variável e
// desestruturação: o estilo do projeto (const handleX: () => void = ...).
// A IDE (PhpStorm/WebStorm com o ESLint ligado, VS Code com a extensão do
// ESLint) mostra cada uma enquanto o código é escrito; `yarn lint` falha com
// qualquer aviso (--max-warnings=0).
export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },

    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-hooks/exhaustive-deps': 'error',
            'react-refresh/only-export-components': [
                'error',
                { allowConstantExport: true },
            ],
            'no-nested-ternary': 'off',

            'semi': 'off',
            '@/semi': ['error', 'always'],

            // --- tipo escrito em todo lugar ---
            '@typescript-eslint/typedef': ['error', {
                arrayDestructuring: true,
                arrowParameter: true,
                memberVariableDeclaration: true,
                objectDestructuring: true,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                variableDeclarationIgnoreFunction: false,
            }],
            '@typescript-eslint/explicit-function-return-type': ['error', {
                allowExpressions: false,
                allowTypedFunctionExpressions: false,
                allowHigherOrderFunctions: false,
                allowDirectConstAssertionInArrowFunctions: false,
                allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                allowFunctionsWithoutTypeParameters: false,
                allowIIFEs: false,
            }],
            '@typescript-eslint/explicit-module-boundary-types': ['error', {
                allowArgumentsExplicitlyTypedAsAny: false,
                allowDirectConstAssertionInArrowFunctions: false,
                allowHigherOrderFunctions: false,
                allowTypedFunctionExpressions: false,
            }],
            '@typescript-eslint/explicit-member-accessibility': 'error',
            // o typedef pede o tipo até onde ele seria "inferível"
            '@typescript-eslint/no-inferrable-types': 'off',

            // --- nada de conversão implícita nem caso esquecido ---
            '@typescript-eslint/strict-boolean-expressions': ['error', {
                allowString: false,
                allowNumber: false,
                allowNullableObject: false,
                allowNullableBoolean: false,
                allowNullableString: false,
                allowNullableNumber: false,
                allowAny: false,
            }],
            '@typescript-eslint/switch-exhaustiveness-check': ['error', {
                considerDefaultExhaustiveForUnions: false,
            }],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/consistent-type-assertions': ['error', {
                assertionStyle: 'as',
                objectLiteralTypeAssertions: 'never',
            }],

            // números em template string são comuns (`/movies/${id}`) e seguros
            '@typescript-eslint/restrict-template-expressions': ['error', {
                allowNumber: true,
            }],
            // `onClick={(): void => setOpen(false)}` é o jeito do projeto
            '@typescript-eslint/no-confusing-void-expression': ['error', {
                ignoreArrowShorthand: true,
            }],
        },
    },

    {
        // Os objetos de classes do Tailwind (só strings literais) seguem a
        // exceção que o projeto já tinha na IDE (noinspection
        // TypeScriptExplicitMemberType): o tipo deles é o próprio literal, e o
        // isolatedDeclarations do tsconfig confere que ele é exportável.
        files: ['src/shared/styles/ts/**/*.ts'],
        rules: {
            '@typescript-eslint/typedef': ['error', {
                arrayDestructuring: true,
                arrowParameter: true,
                memberVariableDeclaration: true,
                objectDestructuring: true,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: false,
            }],
        },
    },

    {
        files: ['**/*.{js,cjs,mjs}'],
        ...tseslint.configs.disableTypeChecked,
    },

    {
        files: ['scripts/**/*.js', '**/*.cjs'],
        languageOptions: {
            globals: globals.node,
        },
    },

    {
        // CommonJS (i18next-parser.config.cjs) importa com require()
        files: ['**/*.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
);
