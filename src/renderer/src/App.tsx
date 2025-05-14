import { FC } from "react";

import { App as AntdApp, Button } from "antd";

import { ThemeProvider } from "./theme/ThemeProvider";
import { StatusBar } from "./container/StatusBar";

const App: FC = () => {
	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	return (
		<>
			<ThemeProvider>
				<AntdApp>
					<div className="App">
						<Button type="primary" onClick={ipcHandle}>
							Ping
						</Button>
					</div>
					<StatusBar />
				</AntdApp>
			</ThemeProvider>
		</>
	);
};

export { App };
