import { FC } from "react";

import { App as AntdApp, Button } from "antd";

import { ThemeProvider } from "./theme/ThemeProvider";

import styled from "styled-components";

import { StatusBar } from "./container/StatusBar/StatusBar";
import { TitleBar } from "./container/TitleBar/TitleBar";

const App: FC = () => {
	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	return (
		<>
			<ThemeProvider>
				<AntdApp>
					<AppContainer>
						<TitleBar />
						<Button type="primary" onClick={ipcHandle}>
							Ping
						</Button>
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
