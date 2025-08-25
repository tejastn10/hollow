import type { InterfaceMapping } from "./types";

const INTERFACE_MAPPING: Record<string, InterfaceMapping[]> = {
	darwin: [
		{ prefix: "en", description: "Wi-Fi/Ethernet" },
		{ prefix: "awdl", description: "AirDrop" },
		{ prefix: "utun", description: "VPN" },
		{ prefix: "bridge", description: "Bridge" },
	],
	linux: [
		{ prefix: "eth", description: "Ethernet" },
		{ prefix: "wlan", description: "Wi-Fi" },
		{ prefix: "lo", description: "Loopback" },
		{ prefix: "tun", description: "VPN" },
	],
	win32: [
		{ prefix: "Ethernet", description: "Ethernet" },
		{ prefix: "Wi-Fi", description: "Wireless" },
		{ prefix: "Loopback", description: "Loopback" },
		{ prefix: "Local Area Connection", description: "Local Area Connection" },
		{ prefix: "VirtualBox", description: "VirtualBox" },
		{ prefix: "VMware", description: "VMware" },
		{ prefix: "Hyper-V", description: "Hyper-V" },
	],
};

export { INTERFACE_MAPPING };
