const getByteInfo = (index: number) => {
	if (index < 14) {
		// Ethernet Header (0-13)
		if (index < 6)
			return { color: "#FF6B6B", section: "Ethernet", desc: "Destination MAC Address" };
		if (index < 12) return { color: "#4ECDC4", section: "Ethernet", desc: "Source MAC Address" };
		return { color: "#45B7D1", section: "Ethernet", desc: "Frame Type" };
	} else if (index < 34) {
		// IP Header (14-33)
		if (index < 16)
			return { color: "#96CEB4", section: "IP Header", desc: "Version & Header Length" };
		if (index < 18) return { color: "#FECA57", section: "IP Header", desc: "Type of Service" };
		if (index < 20) return { color: "#FF9FF3", section: "IP Header", desc: "Total Length" };
		if (index < 22) return { color: "#54A0FF", section: "IP Header", desc: "Identification" };
		if (index < 24) return { color: "#5F27CD", section: "IP Header", desc: "Flags & Fragment" };
		if (index === 24) return { color: "#00D2D3", section: "IP Header", desc: "Time to Live (TTL)" };
		if (index === 25) return { color: "#FF6348", section: "IP Header", desc: "Protocol" };
		if (index < 28) return { color: "#2ED573", section: "IP Header", desc: "Header Checksum" };
		if (index < 32) return { color: "#FFA502", section: "IP Header", desc: "Source IP Address" };
		return { color: "#3742FA", section: "IP Header", desc: "Destination IP Address" };
	} else if (index < 54) {
		// TCP/UDP Header (34-53)
		if (index < 36) return { color: "#F8B500", section: "Transport", desc: "Source Port" };
		if (index < 38) return { color: "#EB2F06", section: "Transport", desc: "Destination Port" };
		if (index < 42) return { color: "#6C5CE7", section: "Transport", desc: "Sequence Number" };
		if (index < 46)
			return { color: "#A29BFE", section: "Transport", desc: "Acknowledgment Number" };
		if (index < 48)
			return { color: "#FD79A8", section: "Transport", desc: "Header Length & Flags" };
		if (index < 50) return { color: "#FDCB6E", section: "Transport", desc: "Window Size" };
		if (index < 52) return { color: "#6C5CE7", section: "Transport", desc: "Checksum" };
		return { color: "#A29BFE", section: "Transport", desc: "Urgent Pointer" };
	} else {
		// Data/Payload
		return { color: "#DDD", section: "Data", desc: "Application Data/Payload" };
	}
};

export { getByteInfo };
