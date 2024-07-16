import { useEffect, useRef } from "react";
import "./App.css";
import "vscode/localExtensionHost";
import "@codingame/monaco-vscode-swift-default-extension";
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import getExtensionServiceOverride, { WorkerConfig } from "@codingame/monaco-vscode-extensions-service-override";
import getFileServiceOverride, { RegisteredFileSystemProvider, RegisteredMemoryFile, registerFileSystemOverlay } from "@codingame/monaco-vscode-files-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getRemoteAgentServiceOverride from "@codingame/monaco-vscode-remote-agent-service-override";
import getSearchServiceOverride from "@codingame/monaco-vscode-search-service-override";

import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getViewsServiceOverride, { attachPart, Parts } from "@codingame/monaco-vscode-views-service-override";
import getTaskServiceOverride from "@codingame/monaco-vscode-task-service-override"

import * as monaco from "monaco-editor";
import * as vscode from "vscode";
import { initialize as initializeMonacoService } from "vscode/services";
import getConfigurationServiceOverride, { IStoredWorkspace } from "@codingame/monaco-vscode-configuration-service-override";

import getExtensionsGalleryServiceOverride from "@codingame/monaco-vscode-extension-gallery-service-override"
import getExplorerServiceOverride from "@codingame/monaco-vscode-explorer-service-override"
import getDebugServiceOverride from "@codingame/monaco-vscode-debug-service-override"
import getStorageServiceOverride from "@codingame/monaco-vscode-storage-service-override"
import getTerminalServiceOverride from "@codingame/monaco-vscode-terminal-service-override"
import getChatServiceOverride from "@codingame/monaco-vscode-chat-service-override"
import getScmServiceOverride from "@codingame/monaco-vscode-scm-service-override"
import getLanguageDetectionWorkerServiceOverride from "@codingame/monaco-vscode-language-detection-worker-service-override";

export type WorkerLoader = () => Worker;

export const workerConfig: WorkerConfig = {
    url: new URL("vscode/workers/extensionHost.worker", import.meta.url).toString(),
    options: { type: "module" }
};


function App() {
    const editorRef = useRef(null);
    useEffect(() => {
        (async () => {
            const fsProvider = new RegisteredFileSystemProvider(false);
            fsProvider.registerFile(new RegisteredMemoryFile(monaco.Uri.file("Package.swift"), `// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "HelloWorld",
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .executableTarget(
            name: "HelloWorld"),
    ]
)
`));

            fsProvider.registerFile(new RegisteredMemoryFile(monaco.Uri.file("Sources/main.swift"), `// The Swift Programming Language
// https://docs.swift.org/swift-book

print("Hello, world!")`));

            const workspaceFile = vscode.Uri.file("workspace.code-workspace");

            fsProvider.registerFile(
                new RegisteredMemoryFile(
                    workspaceFile,
                    JSON.stringify(
                        ({
                            folders: [
                                {
                                    path: "."
                                }
                            ]
                        } as IStoredWorkspace),
                        null,
                        2
                    )
                )
            );

            const workerLoaders: Partial<Record<string, WorkerLoader>> = {
                editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
                textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
                languageDetectionWorkerService: () => new Worker(new URL('@codingame/monaco-vscode-language-detection-worker-service-override/worker', import.meta.url), { type: 'module' }),
                localFileSearchWorker: () => new Worker(new URL('@codingame/monaco-vscode-search-service-override/worker', import.meta.url), { type: 'module' })
            }
            window.MonacoEnvironment = {
                getWorker: function (moduleId, label) {
                    const workerFactory = workerLoaders[label]
                    if (workerFactory != null) {
                        return workerFactory()
                    }
                    throw new Error(`Unimplemented worker ${label} (${moduleId})`)
                }
            }

            registerFileSystemOverlay(1, fsProvider);
            await initializeMonacoService({
                ...getRemoteAgentServiceOverride({
                    scanRemoteExtensions: true
                }),
                ...getModelServiceOverride(),
                ...getExtensionServiceOverride(),
                ...getThemeServiceOverride(),
                ...getLanguagesServiceOverride(),
                ...getTextmateServiceOverride(),
                ...getViewsServiceOverride(),
                ...getFileServiceOverride(),
                ...getSearchServiceOverride(),
                ...getConfigurationServiceOverride(),
                ...getExtensionsGalleryServiceOverride({
                    webOnly: false
                }),
                ...getExplorerServiceOverride(),
                ...getDebugServiceOverride(),
                ...getStorageServiceOverride(),
                ...getTerminalServiceOverride(),
                ...getChatServiceOverride(),
                ...getScmServiceOverride(),
                ...getLanguageDetectionWorkerServiceOverride(),
                ...getTaskServiceOverride()
            }, undefined, {
                remoteAuthority: "localhost:8080",
                workspaceProvider: {
                    trusted: true,
                    async open() {
                        return false;
                    },
                    workspace: { workspaceUri: workspaceFile }
                }
            });

            attachPart(Parts.EDITOR_PART, editorRef.current!);

            // const modelRef = await monaco.editor.createModelReference(monaco.Uri.file("/Sources/main.swift"));
            //
            // monaco.editor.create(this.editorRef.nativeElement!, {
            //     "semanticHighlighting.enabled": true,
            //     model: modelRef.object.textEditorModel
            // });

            vscode.workspace.openTextDocument("Sources/main.swift").then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        })();
    });

    return (
        <>
            <div ref={editorRef}  className="editor"></div>
        </>
    )
}

export default App
