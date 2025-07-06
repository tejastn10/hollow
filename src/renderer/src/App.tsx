import { FC, useEffect, useState } from "react";

import { App as AntdApp, Button } from "antd";

import { ThemeProvider } from "./theme/ThemeProvider";

import styled from "styled-components";

import { StatusBar } from "./container/StatusBar/StatusBar";
import { TitleBar } from "./container/TitleBar/TitleBar";

import { NetworkInterfaceSelector } from "./container/NetworkInterface/NetworkInterfaceSelector";

import { PermissionModal } from "./container/PermissionModal/PermissionModal";

const App: FC = () => {
	const { message } = AntdApp.useApp();

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

			message.info("Capture stopped successfully");
		} catch (error) {
			console.error(`Error stopping capture: ${JSON.stringify(error, null, 2)}`);
			message.error("Failed to stop capture");
		}
	};

	const handleStartCapture = async (interfaceName: string, filter?: string): Promise<void> => {
		try {
			if (isCapturing) {
				message.warning("Capture is already in progress");
				return;
			}

			const result = await window.api.startCapture(interfaceName, filter || "");

			if (!result.success) {
				if (result.error) {
					message.error(`Capture failed: ${result.error}`);
				} else {
					message.error("Capture failed for an unknown reason");
				}

				setIsCapturing(false);
				return;
			}

			setIsCapturing(true);

			message.success(`Capture started on ${interfaceName}`);
		} catch (error) {
			console.error(`Error starting capture: ${JSON.stringify(error, null, 2)}`);
			message.error("Failed to start capture");

			setIsCapturing(false);
		}
	};

	useEffect(() => {}, [isPasswordModalVisible]);

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
