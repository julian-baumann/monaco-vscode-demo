import { useEffect, useRef } from "react";
import "./App.css";
import "vscode/localExtensionHost";
import "@codingame/monaco-vscode-swift-default-extension";
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import getExtensionServiceOverride, { WorkerConfig } from "@codingame/monaco-vscode-extensions-service-override";
import getFileServiceOverride from "@codingame/monaco-vscode-files-service-override";
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
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";

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
            const workspaceFile = vscode.Uri.parse("vscode-remote://localhost:8080/Users/turingmachine/Projects/HelloWorld/HelloWorld.code-workspace");

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
                        return true;
                    },
                    workspace: { workspaceUri: workspaceFile }
                }
            });

            attachPart(Parts.EDITOR_PART, editorRef.current!);

            vscode.workspace.openTextDocument(monaco.Uri.parse("vscode-remote://localhost:8080/Users/turingmachine/Projects/HelloWorld/Sources/main.swift")).then((doc) => {
                vscode.window.showTextDocument(doc);
            })

            // const modelRef = await monaco.editor.createModelReference(monaco.Uri.parse("vscode-remote://localhost:8080/Users/turingmachine/Projects/HelloWorld/Sources/main.swift"));
            //
            // monaco.editor.create(editorRef.current!, {
            //     "semanticHighlighting.enabled": true,
            //     model: modelRef.object.textEditorModel
            // });

        })();
    });

    return (
        <>
            <div ref={editorRef} className="editor"></div>
        </>
    )
}

export default App
