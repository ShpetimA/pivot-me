const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.app.json");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ["<rootDir>"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: "<rootDir>/",
  }),
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          baseUrl: ".",
          paths: {
            "~/*": ["src/*"],
          },
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      },
    ],
    ".+\\.(css|less|sass|scss|png|jpg|gif|ttf|woff|woff2|svg)$":
      "jest-transform-stub",
  },
};
