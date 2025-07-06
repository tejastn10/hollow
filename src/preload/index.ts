import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
	closeWindow: () => ipcRenderer.invoke("close-window"),
	maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),

	getNetworkInterfaces: () => ipcRenderer.invoke("get-network-interfaces"),

	startCapture: (interfaceName: string, filter: string) =>
		ipcRenderer.invoke("start-capture", interfaceName, filter),
	stopCapture: () => ipcRenderer.invoke("stop-capture"),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	window.electron = electronAPI;
	window.api = api;
}
