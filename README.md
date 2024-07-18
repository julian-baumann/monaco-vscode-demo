# MonacoTest

Demo for [#465](https://github.com/CodinGame/monaco-vscode-api/issues/465)

All relevant parts are location in [./src/app/app.component.ts](./src/app/app.component.ts)

## Getting started

### Downloading the server

1. Download the `code-server` from `https://update.code.visualstudio.com/commit:f1e16e1e6214d7c44d078b1f0607b2388f29d729/server-<platform>-<arch>/stable` for your platform.
2. Change the `webEndpointUrlTemplate` in the `product.json` to `http://localhost:4200`;

> You can also copy the `product.json` from [./vscode-server/product.json](./vscode-server/product.json)

### Starting the server

1. You will have to install the swift extension which is found in the root of this repository ([./sswg.swift-lang-1.10.4.vsix](./sswg.swift-lang-1.10.4.vsix))
```bash
./bin/code-server --install-extension <path to sswg.swift-lang-1.10.4.vsix>
```

2. Now start the server with the following arguments:
```bash
./bin/code-server --port 8080 --without-connection-token --accept-server-license-terms --host 0.0.0.0
```

### Starting the Angular application

https://github.com/julian-baumann/monaco-vscode-demo/blob/d971c0f71a0783d53cf613397a0bd620277516aa/src/app/app.component.ts#L50

Adjust the `projectPath` to your swift project in [./src/app/app.component.ts](./src/app/app.component.ts)

```bash
npm install
npm run start
```
This will start the development server of angular with hot reloading enabled.
Either view this project in a browser or start electron with this command:
```
npm run electron:serve
```
