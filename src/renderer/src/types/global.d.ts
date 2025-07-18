import { NetworkInterface, PacketData } from "./network";

interface CaptureResult {
	success: boolean;
	error?: string;
	linkType?: SVGAnimatedNumber;
}

interface HollowApi {
	closeWindow: () => Promise<void>;
	maximizeWindow: () => Promise<void>;
	minimizeWindow: () => Promise<void>;

	getNetworkInterfaces: () => Promise<NetworkInterface[]>;

	startCapture: (interfaceName: string, filter: string) => Promise<CaptureResult>;
	stopCapture: () => Promise<void>;

	onPacketCaptured: (callback: (packet: PacketData) => void) => void;
	onCaptureStatus: (
		callback: ({ status, message }: { status: string; message: string }) => void
	) => void;
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
