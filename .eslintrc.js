module.exports = {
  extends: 'airbnb',
  env: {
    browser: true,
  },
  rules: {
    'linebreak-style': [0, 'error', 'windows'],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'arrow-body-style': ['error', 'as-needed'],
    'brace-style': ['error', 'stroustrup'],
    'max-len': ['error', { ignoreComments: true }],
    'operator-linebreak': [2, 'before', { overrides: { '=': 'after' } }],
    'no-multi-str': 'error',
    'func-names': ['error', 'never'],
  },
};
