import {
	BlockOutlined,
	ControlOutlined,
	FilterOutlined,
	PlayCircleOutlined,
	SettingOutlined,
	StopOutlined,
} from "@ant-design/icons";
import type { NetworkInterface } from "@renderer/types/network";
import { App, Button, Card, Input, Select, Typography } from "antd";
import { type FC, useCallback, useEffect, useState } from "react";
import styled from "styled-components";

const { Title, Text } = Typography;

interface Props {
	isCapturing: boolean;

	onStopCapture: () => void;
	onStartCapture: (interfaceName: string, filter?: string) => void;
}

const NetworkInterfaceSelector: FC<Props> = ({ isCapturing, onStopCapture, onStartCapture }) => {
	const { message } = App.useApp();

	const [isLoading, setIsLoading] = useState(false);
	const [captureFilter, setCaptureFilter] = useState<string>("");
	const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
	const [selectedInterface, setSelectedInterface] = useState<string | null>(null);

	const formatInterfaceDescription = (iface: NetworkInterface) => {
		const primaryAddr = iface.addresses.find(
			// ? Exclude link-local
			(address) => address.addr && !address.addr.startsWith("169.254")
		);

		const description = `${iface.description} ${primaryAddr ? `(${primaryAddr.addr})` : ""}`;

		return description;
	};

	const handleStopCapture = () => {
		onStopCapture();
	};

	const handleStartCapture = () => {
		if (!selectedInterface) {
			message.warning("Please select a network interface");
			return;
		}

		onStartCapture(selectedInterface, captureFilter);
	};

	const loadNetworkInterfaces = useCallback(async () => {
		try {
			setIsLoading(true);

			const interfaceList = await window.api.getNetworkInterfaces();
			setInterfaces(interfaceList);

			// ? Selecting first interface if available
			if (interfaceList.length > 0) {
				setSelectedInterface(interfaceList[0].name);
			}
		} catch (error) {
			console.error(`Error loading interfaces ${JSON.stringify(error, null, 2)}`);
			message.error("Failed to load network interfaces");
		} finally {
			setIsLoading(false);
		}
	}, [message]);

	useEffect(() => {
		loadNetworkInterfaces();
	}, [loadNetworkInterfaces]);

	return (
		<Card>
			<Title level={4}>
				<ControlOutlined style={{ marginRight: "0.5rem" }} />
				Network Capture configuration
			</Title>
			<ControlsContainer>
				<InputGroup>
					<Text strong>Network Interface:</Text>
					<Select
						loading={isLoading}
						disabled={isCapturing}
						value={selectedInterface}
						prefix={<BlockOutlined />}
						onChange={(value) => setSelectedInterface(value)}
						placeholder="Select a network interface"
						style={{ width: "100%" }}
						options={interfaces?.map((iface) => ({
							value: iface.name,
							label: formatInterfaceDescription(iface),
						}))}
					/>
				</InputGroup>

				<InputGroup>
					<Text strong>Capture Filter:</Text>
					<Input
						disabled={isCapturing}
						value={captureFilter}
						prefix={<FilterOutlined />}
						onChange={(e) => setCaptureFilter(e.target.value)}
						placeholder="Enter capture filter (e.g., 'tcp port 80')"
					/>
					<Text type="secondary" italic>
						Use BPF syntax (Berkeley Packet Filter)
					</Text>
				</InputGroup>

				<ButtonGroup>
					{isCapturing ? (
						<Button type="primary" danger icon={<StopOutlined />} onClick={handleStopCapture}>
							Stop Capture
						</Button>
					) : (
						<Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartCapture}>
							Start Capture
						</Button>
					)}

					<Button icon={<SettingOutlined />} onClick={loadNetworkInterfaces} disabled={isCapturing}>
						Refresh
					</Button>
				</ButtonGroup>
			</ControlsContainer>
		</Card>
	);
};

export { NetworkInterfaceSelector };

const ControlsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const InputGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
`;

const ButtonGroup = styled.div`
	width: 100%;

	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 0.5rem;
`;
