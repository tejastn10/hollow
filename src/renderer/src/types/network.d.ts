type NetworkStatus = "connected" | "weak" | "disconnected";

interface NetworkAddress {
	addr: string;
	netmask?: string;
	boradaddr?: string;
}

interface NetworkInterface {
	name: string;
	description: string;

	addresses: Array<NetworkAddress>;
}

export type { NetworkStatus, NetworkInterface, NetworkAddress };
