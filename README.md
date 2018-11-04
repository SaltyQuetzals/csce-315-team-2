# Untitled Zombie Game 3

## Authors (Alphabetical Order)

- Gabriel Britain
- Jonathan Innis
- Nick Nelson
- Benjamin Wong

## Requirements

- [Node.js v8.12.0](https://nodejs.org/download/release/v8.12.0/)
- Node Package Manager (NPM) v6.4.1 (bundled in the Node.js download)
- [TypeScript v3.1.1](https://www.typescriptlang.org/index.html#download-links).
- All external libraries are referenced in `package.json`, under the [`dependencies` field](https://github.com/SaltyQuetzals/multiplayer-game/blob/f5e6b2398b34829cbc1316302e41d4e81146e3dd/package.json#L35) and the [`dev-dependencies` field](https://github.com/SaltyQuetzals/multiplayer-game/blob/f5e6b2398b34829cbc1316302e41d4e81146e3dd/package.json#L49).

To install all external libraries, `cd` into the root directory of the project, and run 

```
npm install
```

## Compiling and Running

### Running the Server
`cd` into the root directory, and run

```
npm start
```

This will:

1. Compile the Typescript found in the `src/` directory, and output the results of the compilation into the `build/` directory.
2. Execute the compiled Javascript to start the server.

### Tests
Tests are written using the [Mocha](https://mochajs.org/) test framework, using [Chai](https://www.chaijs.com/) for BDD/TDD assertions. To execute the current test suite, run

```
npm test
```

## Repository Structure

Source code for the application can be located in the `src/` directory. For unit tests, see the `test/` directory.

Front-end source code can be found in the `src/public/js/` directory.


## Functional Specification
Check it out [here](https://github.com/SaltyQuetzals/multiplayer-game/wiki/Functional-Specification)!
