import "vscode/localExtensionHost";
import "@codingame/monaco-vscode-swift-default-extension";
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import getExtensionServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getFileServiceOverride from "@codingame/monaco-vscode-files-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getModelServiceOverride from "@codingame/monaco-vscode-model-service-override";
import getRemoteAgentServiceOverride from "@codingame/monaco-vscode-remote-agent-service-override";
import getSearchServiceOverride from "@codingame/monaco-vscode-search-service-override";

import getTaskServiceOverride from "@codingame/monaco-vscode-task-service-override"
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getViewsServiceOverride, { attachPart, Parts } from "@codingame/monaco-vscode-views-service-override";
import * as monaco from "monaco-editor";
import * as vscode from "vscode";
import { initialize as initializeMonacoService } from "vscode/services";
import getConfigurationServiceOverride, { initUserConfiguration } from "@codingame/monaco-vscode-configuration-service-override";

import getExtensionsGalleryServiceOverride from "@codingame/monaco-vscode-extension-gallery-service-override"
import getExplorerServiceOverride from "@codingame/monaco-vscode-explorer-service-override"
import getDebugServiceOverride from "@codingame/monaco-vscode-debug-service-override"
import getStorageServiceOverride from "@codingame/monaco-vscode-storage-service-override"
import getTerminalServiceOverride from "@codingame/monaco-vscode-terminal-service-override"
import getChatServiceOverride from "@codingame/monaco-vscode-chat-service-override"
import getScmServiceOverride from "@codingame/monaco-vscode-scm-service-override"
import getLanguageDetectionWorkerServiceOverride from "@codingame/monaco-vscode-language-detection-worker-service-override";

export type WorkerLoader = () => Worker;

@Component({
    selector: "app-root",
    standalone: true,
    imports: [],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss"
})
export class AppComponent implements AfterViewInit {
    @ViewChild("editor")
    protected editorRef?: ElementRef<HTMLDivElement>;

    @ViewChild("activityBar")
    protected activityBarRef?: ElementRef<HTMLDivElement>;

    @ViewChild("sidebar")
    protected sidebarRef?: ElementRef<HTMLDivElement>;

    private readonly projectPath = "/Users/turingmachine/Projects/monaco-test/swift-project";

    public async ngAfterViewInit(): Promise<void> {
        if (!this.editorRef?.nativeElement || !this.sidebarRef?.nativeElement || !this.activityBarRef?.nativeElement) {
            return;
        }

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

        await initUserConfiguration(JSON.stringify({
            swift: {
                backgroundCompilation: true
            },
            breadcrumbs: {
                enabled: false
            }
        }));

        const workspaceFile = vscode.Uri.parse(`vscode-remote://localhost:8080${this.projectPath}/HelloWorld.code-workspace`);

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

        // const modelRef = await monaco.editor.createModelReference(monaco.Uri.parse("vscode-remote://localhost:8080${this.projectPath}/Sources/main.swift"));
        //
        // monaco.editor.create(this.editorRef.nativeElement!, {
        //     model: modelRef.object.textEditorModel
        // });

        attachPart(Parts.EDITOR_PART, this.editorRef.nativeElement);
        attachPart(Parts.ACTIVITYBAR_PART, this.activityBarRef.nativeElement);
        attachPart(Parts.SIDEBAR_PART, this.sidebarRef.nativeElement);


        vscode.workspace.openTextDocument(monaco.Uri.parse(`vscode-remote://localhost:8080${this.projectPath}/Sources/main.swift`)).then((doc) => {
            vscode.window.showTextDocument(doc);
        });
    }
}
