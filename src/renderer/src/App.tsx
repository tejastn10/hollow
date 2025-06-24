import { FC, useEffect, useState } from "react";

import { App as AntdApp, Button } from "antd";

import { ThemeProvider } from "./theme/ThemeProvider";

import styled from "styled-components";

import { StatusBar } from "./container/StatusBar/StatusBar";
import { TitleBar } from "./container/TitleBar/TitleBar";

import { NetworkInterfaceSelector } from "./container/NetworkInterface/NetworkInterfaceSelector";

import { PermissionModal } from "./container/PermissionModal/PermissionModal";

import { PacketData } from "./types/network";
import { MAX_PACKETS } from "./constants/network";

const App: FC = () => {
	const { message: AntMessage } = AntdApp.useApp();

	const [, setPackets] = useState<PacketData[]>([]);
	const [isCapturing, setIsCapturing] = useState(false);
	const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | undefined>();

	const handlePasswordModalVisibility = () => {
		setIsPasswordModalVisible(!isPasswordModalVisible);
	};

	const handlePasswordSubmit = (password: string) => {
		if (window.electron?.ipcRenderer) {
			window.electron.ipcRenderer.send("password-response", password);
		}
	};

	const handlePasswordCancel = () => {
		if (window.electron?.ipcRenderer) {
			window.electron.ipcRenderer.send("password-response", null);
		}

		setIsPasswordModalVisible(false);
		setPasswordErrorMessage(undefined);
	};

	const handleStopCapture = async (): Promise<void> => {
		try {
			await window.api.stopCapture();
			setIsCapturing(false);

			AntMessage.info("Capture stopped successfully");
		} catch (error) {
			console.error(`Error stopping capture: ${JSON.stringify(error, null, 2)}`);
			AntMessage.error("Failed to stop capture");
		}
	};

	const handleStartCapture = async (interfaceName: string, filter?: string): Promise<void> => {
		try {
			if (isCapturing) {
				AntMessage.warning("Capture is already in progress");
				return;
			}

			const result = await window.api.startCapture(interfaceName, filter || "");

			if (!result.success) {
				if (result.error) {
					AntMessage.error(`Capture failed: ${result.error}`);
				} else {
					AntMessage.error("Capture failed for an unknown reason");
				}

				setIsCapturing(false);
				return;
			}

			setIsCapturing(true);

			AntMessage.success(`Capture started on ${interfaceName}`);
		} catch (error) {
			console.error(`Error starting capture: ${JSON.stringify(error, null, 2)}`);
			AntMessage.error("Failed to start capture");

			setIsCapturing(false);
		}
	};

	useEffect(() => {
		// ? Listen for captured packets
		window.api.onPacketCaptured((packet: PacketData) => {
			try {
				setPackets((prevPackets) => {
					const newPackets = [...prevPackets, packet];

					// Limit the number of packets to 1000
					if (newPackets.length > MAX_PACKETS) {
						return newPackets.slice(-MAX_PACKETS);
					}
					return newPackets;
				});
			} catch (error) {
				console.error(`Error processing captured packet: ${JSON.stringify(error, null, 2)}`);
			}
		});

		// ? Listen for capture status updates if the API supports it
		if (window.api?.onCaptureStatus) {
			window.api.onCaptureStatus(({ status, message }: { status: string; message: string }) => {
				console.log(`Capture status: ${status}`);

				switch (status) {
					case "requesting-password":
						setIsPasswordModalVisible(true);
						setPasswordErrorMessage(undefined);
						break;

					case "started":
						setIsPasswordModalVisible(false);
						setPasswordErrorMessage(undefined);

						AntMessage.success("Capture started successfully");
						break;
					case "password-error":
						setPasswordErrorMessage(
							message || "An error occurred while processing the password. Please try again."
						);
						break;

					default:
						break;
				}
			});
		}

		const handlePasswordRequest = () => {
			if (isPasswordModalVisible) {
				return;
			}

			setIsPasswordModalVisible(true);
			setPasswordErrorMessage(undefined);
		};

		if (window.electron?.ipcRenderer) {
			window.electron.ipcRenderer.on("request-password", handlePasswordRequest);
		}

		return () => {
			if (window.electron?.ipcRenderer) {
				window.electron.ipcRenderer.removeListener("request-password", handlePasswordRequest);
			}
		};
	}, [isPasswordModalVisible, AntMessage]);

	return (
		<>
			<ThemeProvider>
				<AntdApp>
					<AppContainer>
						<TitleBar />

						<MainContent>
							<ControlPanel>
								<NetworkInterfaceSelector
									isCapturing={isCapturing}
									onStopCapture={handleStopCapture}
									onStartCapture={handleStartCapture}
								/>
							</ControlPanel>
						</MainContent>

						<Button type="primary" onClick={handlePasswordModalVisibility}>
							Ping
						</Button>
						<PermissionModal
							visible={isPasswordModalVisible}
							onSubmit={handlePasswordSubmit}
							onCancel={handlePasswordCancel}
							errorMessage={passwordErrorMessage}
						/>
						<StatusBar />
					</AppContainer>
				</AntdApp>
			</ThemeProvider>
		</>
	);
};

export { App };

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;

	background-color: ${(props) => (props.theme === "dark" ? "#000000" : "#ffffff")};
	color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#000000")};

	height: 100vh;
	width: 100vw;

	overflow: hidden;
`;

const MainContent = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	flex: 1;
	overflow: hidden;
`;

const ControlPanel = styled.div`
	padding: 1rem;

	display: flex;
	flex-direction: column;

	gap: 1rem;

	border-bottom: 1px solid ${(props) => (props.theme === "dark" ? "#333333" : "#e0e0e0")};
`;
