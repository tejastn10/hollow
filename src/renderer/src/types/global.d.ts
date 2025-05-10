declare global {
	interface Window {
		electron: {
			ipcRenderer: {
				send: (channel: string, ...args: unknown[]) => void;
			};
		};
		api: unknown;
	}
}

export {};
