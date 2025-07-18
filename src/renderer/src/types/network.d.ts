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

interface PacketData {
	timestamp: number;

	data: number[];
	length: number;

	linkType: string;
	id?: string;
}

interface ParsedPacket extends PacketData {
	id: number;

	time: string;
	source: string;
	destination: string;
	protocol: string;

	info: string;
	size: number;
}

export type { NetworkStatus, NetworkInterface, NetworkAddress, PacketData, ParsedPacket };
