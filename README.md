# babel-plugin-module-paths-resolver
A plugin to resolve tsconfig paths for babel!

## Install
``` shell
$ yarn add babel-plugin-module-paths-resolver
```

## Usage
Specify the plugin in your `.babelrc` with the custom alias and calls witch will be transform.
``` json
{
  "plugins": [
    ["module-paths-resolver", {
      "calls": [
          "jest.genMockFromModule",
          "jest.mock",
          "jest.unmock",
          "jest.doMock",
          "jest.dontMock",
          "jest.setMock",
          "jest.requireActual",
          "jest.requireMock",
      ],
      "alias": {
        "vue": "vue/dist/vue.production.js",
        "react$": "react/dist",
        "react": "react/dev"
      }
    }]
  ]
}
```

Also the plugin will autoload the config in you `tsconfig.json` or `jsconfig.json`.
``` json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": ["./utils/*"], // the '*' key will be ignored.
      "@/*": ["./src/*"],
      "@components": ["./components/*", "./src/components/*"] // the `./src/components/*` will be ignored.
    }
  }
}
```
