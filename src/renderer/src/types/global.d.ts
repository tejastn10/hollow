interface HollowApi {
	closeWindow: () => Promise<void>;
	maximizeWindow: () => Promise<void>;
	minimizeWindow: () => Promise<void>;
}

declare global {
	interface Window {
		electron: {
			ipcRenderer: {
				send: (channel: string, ...args: unknown[]) => void;
				on: (channel: string, listener: (...args: unknown[]) => void) => void;
				removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
			};
		};
		api: HollowApi;
	}
}

export {};
