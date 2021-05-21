module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "globals": {
        "wx": true,
        "qq": true,
        "tt": true,
        "swan": true,
        "my": true,
        "App": true,
        "Page": true,
        "getApp": true,
        "Component": true,
        "Behavior": true,
        "WeixinJSBridge": true,
        "getCurrentPages": true
    },
    "parser": "@babel/eslint-parser",
    "extends": ["eslint:recommended"],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        },
        "sourceType": "module"
    },
    "rules": {
        "no-unused-vars": [
          1
        ],
        "no-console": [
          1
        ],
        "indent": [
            2,
            2,
            { "SwitchCase": 1, "MemberExpression": 1 }
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "quotes": [
            1,
            "single"
        ],
        "semi": [
            2,
            "always"
        ]
    }
};
