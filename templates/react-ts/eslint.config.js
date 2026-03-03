import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  typescript: {
    parserOptions: {
      projectService: true,
    },
    overrides: {
      'ts/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: true,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],

      // I want to be able to use e.g. onClick(() => setCount(count + 1))
      // without a requirement to use braces
      'ts/no-confusing-void-expression': 'off',
    },
  },
  stylistic: {
    semi: true,
    quotes: 'single',
    indent: 2,
    jsx: true,

    overrides: {
      // 1tbs brace style (opening brace on same line)
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],

      // Require parentheses around arrow function arguments
      'style/arrow-parens': ['error', 'always'],

      // Always use semicolons in types/interfaces
      'style/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        multilineDetection: 'brackets',
        overrides: {
          interface: {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
          },
        },
        singleline: {
          delimiter: 'semi',
        },
      }],

      // Max number of empty lines between declarations
      'style/no-multiple-empty-lines': ['error', {
        max: 2,
        maxBOF: 0,
        maxEOF: 0,
      }],

      // Enforce spacing inside objects
      'style/object-curly-spacing': ['error', 'always', {
        arraysInObjects: true,
        objectsInObjects: false,
      }],

      // Enforce spacing inside objects
      'style/quote-props': ['error', 'as-needed'],

      // Don't break JSX expressions into multiple lines
      // e.g. Lorem {'ipsum'} dolor... instead of
      // Lorem
      // {'ipsum'}
      // dolor...
      'style/jsx-one-expression-per-line': 'off',

      // Always use braces for prop and prop element values
      'style/jsx-curly-brace-presence': ['warn', {
        props: 'always',
        propElementValues: 'always',
        children: 'ignore',
      }],
    },
  },
  rules: {
    'test/prefer-lowercase-title': 'off',
    'antfu/top-level-function': 'off',
    'no-console': 'warn',
  },
});
