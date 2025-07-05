import { FC, useState } from "react";

import { App as AntdApp, Button } from "antd";

import { ThemeProvider } from "./theme/ThemeProvider";

import styled from "styled-components";

import { StatusBar } from "./container/StatusBar/StatusBar";
import { TitleBar } from "./container/TitleBar/TitleBar";

import { NetworkInterfaceSelector } from "./container/NetworkInterface/NetworkInterfaceSelector";

import { PermissionModal } from "./container/PermissionModal/PermissionModal";

const App: FC = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | undefined>();

	const handleModalVisibility = () => {
		setIsModalVisible(!isModalVisible);
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

		setIsModalVisible(false);
		setPasswordErrorMessage(undefined);
	};

	return (
		<>
			<ThemeProvider>
				<AntdApp>
					<AppContainer>
						<TitleBar />

						<MainContent>
							<ControlPanel>
								<NetworkInterfaceSelector
									isCapturing={false}
									onStopCapture={() => {}}
									onStartCapture={() => {}}
								/>
							</ControlPanel>
						</MainContent>

						<Button type="primary" onClick={handleModalVisibility}>
							Ping
						</Button>
						<PermissionModal
							visible={isModalVisible}
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
