import { NETWORK_STATUS } from "../../constants/network";
import type { NetworkStatus } from "../../types/network";

const getNetworkStatusText = (status: NetworkStatus): string => {
	switch (status) {
		case NETWORK_STATUS.CONNECTED:
			return NETWORK_STATUS.CONNECTED;
		case NETWORK_STATUS.WEAK:
			return NETWORK_STATUS.WEAK;
		case NETWORK_STATUS.DISCONNECTED:
			return NETWORK_STATUS.DISCONNECTED;
		default:
			return "Unknown";
	}
};

const getNetworkStatusColor = (status: NetworkStatus): string => {
	switch (status) {
		case NETWORK_STATUS.CONNECTED:
			return "green";
		case NETWORK_STATUS.WEAK:
			return "orange";
		case NETWORK_STATUS.DISCONNECTED:
			return "red";
		default:
			return "gray";
	}
};

export { getNetworkStatusText, getNetworkStatusColor };
