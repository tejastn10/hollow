import { useEffect, useState } from "react";

import { NetworkStatus } from "../types/network";

import { NETWORK_STATUS } from "../constants/network";

const useNetworkStatus = (): NetworkStatus => {
	const [status, setStatus] = useState<NetworkStatus>(NETWORK_STATUS.CONNECTED);
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		const checkNetworkQuality = () => {
			// ? Checking connectivity
			if (!navigator.onLine) {
				console.error("Network is disconnected");
				setStatus(NETWORK_STATUS.DISCONNECTED);
				return;
			}

			if (navigator.onLine) {
				console.debug("Network is connected");
				setStatus(NETWORK_STATUS.CONNECTED);
			} else {
				console.debug("Network is weak");
				setStatus(NETWORK_STATUS.WEAK);
			}
		};

		const handleOnline = () => {
			setIsOnline(true);
			checkNetworkQuality();
		};

		const handleOffline = () => {
			setIsOnline(false);
			checkNetworkQuality();
		};

		checkNetworkQuality();

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, [isOnline]);

	return status;
};

export { useNetworkStatus };
