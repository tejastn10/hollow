import { FC } from "react";

import { Button } from "antd";

const App: FC = () => {
	const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				height: "100%",
			}}
		>
			<Button type="primary" onClick={ipcHandle}>
				Ping
			</Button>
		</div>
	);
};

export { App };
