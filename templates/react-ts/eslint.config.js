import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
    quotes: 'single',
    indent: 2,
  },
  rules: {
    'style/quotes': ['error', 'single'],
    'test/prefer-lowercase-title': 'off',
    'style/jsx-one-expression-per-line': ['off', { allow: 'single-line' }],
    'style/jsx-curly-brace-presence': ['error', { props: 'always' }],
    'style/jsx-curly-spacing': [
      'warn',
      {
        when: 'never',
        children: {
          when: 'always',
        },
      },
    ],
    'antfu/top-level-function': 'off',
  },
});
