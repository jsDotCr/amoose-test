module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "mocha": true,
        "phantomjs": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 6,
        "impliedStrict": true
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "space-unary-ops": "error",
        "keyword-spacing": "error",
        "no-spaced-func": "error",
        "arrow-spacing": "error",
        "brace-style": "error",
        "array-bracket-spacing": [ "error", "always" ],
        "func-call-spacing": [ "error", "never" ],
        "computed-property-spacing": [ "error", "always" ],
        "space-in-parens": [ "error", "always" ],
        "comma-spacing": [ "error", { "before": false, "after": true } ]
    }
};