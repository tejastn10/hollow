import { electronAPI } from "@electron-toolkit/preload";
import type { PacketData } from "@renderer/types/network";
import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {
	closeWindow: () => ipcRenderer.invoke("close-window"),
	maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),

	getNetworkInterfaces: () => ipcRenderer.invoke("get-network-interfaces"),

	startCapture: (interfaceName: string, filter: string) =>
		ipcRenderer.invoke("start-capture", interfaceName, filter),
	stopCapture: () => ipcRenderer.invoke("stop-capture"),

	onPacketCaptured: (callback: (packet: PacketData) => void) => {
		const handler = (_event: Electron.IpcRendererEvent, packet: PacketData) => {
			callback(packet);
		};
		ipcRenderer.on("packet-captured", handler);
		return () => ipcRenderer.removeListener("packet-captured", handler);
	},
	onCaptureStatus: (callback: (data: { status: string; message: string }) => void) => {
		ipcRenderer.on("capture-status", (_event, data) => callback(data));
	},

	// ? Remove listeners
	removeCaptureStatusListener: () => ipcRenderer.removeAllListeners("capture-status"),
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
