import { FC } from "react";

import { Card, Typography, Tabs } from "antd";
import styled from "styled-components";

import { ParsedPacket } from "@renderer/types/network";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface Props {
	packet: ParsedPacket | null;
}

const PacketDetails: FC<Props> = ({ packet }) => {
	if (!packet) {
		return (
			<DetailsContainer>
				<EmptyState>
					<Text style={{ color: "#666" }}>Select a packet to view details</Text>
				</EmptyState>
			</DetailsContainer>
		);
	}

	const renderHexDump = () => {
		const bytes = packet.data;
		const lines: React.JSX.Element[] = [];

		for (let i = 0; i < bytes.length; i += 16) {
			const offset = i.toString(16).padStart(8, "0").toUpperCase();
			const hexBytes = bytes.slice(i, i + 16);
			const hex = hexBytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
			const ascii = hexBytes
				.map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
				.join("");

			lines.push(
				<HexLine key={i}>
					<HexOffset>{offset}</HexOffset>
					<HexBytes>{hex.padEnd(47, " ")}</HexBytes>
					<AsciiBytes>{ascii}</AsciiBytes>
				</HexLine>
			);
		}

		return <HexDumpContainer>{lines}</HexDumpContainer>;
	};

	const renderProtocolTree = () => {
		const buffer = new Uint8Array(packet.data);
		const layers: React.JSX.Element[] = [];

		if (buffer.length >= 14) {
			// Ethernet Layer
			const ethSrc = Array.from(buffer.slice(6, 12))
				.map((b) => b.toString(16).padStart(2, "0"))
				.join(":");
			const ethDst = Array.from(buffer.slice(0, 6))
				.map((b) => b.toString(16).padStart(2, "0"))
				.join(":");
			const etherType = (buffer[12] << 8) | buffer[13];

			layers.push(
				<ProtocolLayer key="ethernet">
					<LayerTitle>Ethernet II</LayerTitle>
					<LayerField>
						<FieldName>Destination:</FieldName>
						<FieldValue>{ethDst}</FieldValue>
					</LayerField>
					<LayerField>
						<FieldName>Source:</FieldName>
						<FieldValue>{ethSrc}</FieldValue>
					</LayerField>
					<LayerField>
						<FieldName>Type:</FieldName>
						<FieldValue>0x{etherType.toString(16).padStart(4, "0")}</FieldValue>
					</LayerField>
				</ProtocolLayer>
			);

			// IP Layer
			if (etherType === 0x0800 && buffer.length >= 34) {
				const ipHeader = buffer.slice(14);
				const version = (ipHeader[0] >> 4) & 0xf;
				const headerLength = (ipHeader[0] & 0xf) * 4;
				const totalLength = (ipHeader[2] << 8) | ipHeader[3];
				const ttl = ipHeader[8];
				const protocol = ipHeader[9];

				layers.push(
					<ProtocolLayer key="ip">
						<LayerTitle>Internet Protocol Version {version}</LayerTitle>
						<LayerField>
							<FieldName>Version:</FieldName>
							<FieldValue>{version}</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>Header Length:</FieldName>
							<FieldValue>{headerLength} bytes</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>Total Length:</FieldName>
							<FieldValue>{totalLength}</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>TTL:</FieldName>
							<FieldValue>{ttl}</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>Protocol:</FieldName>
							<FieldValue>{protocol}</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>Source:</FieldName>
							<FieldValue>{packet.source}</FieldValue>
						</LayerField>
						<LayerField>
							<FieldName>Destination:</FieldName>
							<FieldValue>{packet.destination}</FieldValue>
						</LayerField>
					</ProtocolLayer>
				);

				// Transport Layer
				if (protocol === 6 && buffer.length >= 54) {
					// TCP
					const tcpHeader = buffer.slice(34);
					const srcPort = (tcpHeader[0] << 8) | tcpHeader[1];
					const dstPort = (tcpHeader[2] << 8) | tcpHeader[3];
					const seqNum =
						(tcpHeader[4] << 24) | (tcpHeader[5] << 16) | (tcpHeader[6] << 8) | tcpHeader[7];
					const ackNum =
						(tcpHeader[8] << 24) | (tcpHeader[9] << 16) | (tcpHeader[10] << 8) | tcpHeader[11];
					const flags = tcpHeader[13];

					layers.push(
						<ProtocolLayer key="tcp">
							<LayerTitle>Transmission Control Protocol</LayerTitle>
							<LayerField>
								<FieldName>Source Port:</FieldName>
								<FieldValue>{srcPort}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Destination Port:</FieldName>
								<FieldValue>{dstPort}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Sequence Number:</FieldName>
								<FieldValue>{seqNum}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Acknowledgment Number:</FieldName>
								<FieldValue>{ackNum}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Flags:</FieldName>
								<FieldValue>0x{flags.toString(16).padStart(2, "0")}</FieldValue>
							</LayerField>
						</ProtocolLayer>
					);
				} else if (protocol === 17 && buffer.length >= 42) {
					// UDP
					const udpHeader = buffer.slice(34);
					const srcPort = (udpHeader[0] << 8) | udpHeader[1];
					const dstPort = (udpHeader[2] << 8) | udpHeader[3];
					const length = (udpHeader[4] << 8) | udpHeader[5];

					layers.push(
						<ProtocolLayer key="udp">
							<LayerTitle>User Datagram Protocol</LayerTitle>
							<LayerField>
								<FieldName>Source Port:</FieldName>
								<FieldValue>{srcPort}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Destination Port:</FieldName>
								<FieldValue>{dstPort}</FieldValue>
							</LayerField>
							<LayerField>
								<FieldName>Length:</FieldName>
								<FieldValue>{length}</FieldValue>
							</LayerField>
						</ProtocolLayer>
					);
				}
			}
		}

		return <ProtocolTreeContainer>{layers}</ProtocolTreeContainer>;
	};

	return (
		<DetailsContainer>
			<PacketHeader>
				<Title level={4} style={{ color: "#CCCCCC", margin: 0 }}>
					Packet #{packet.id} Details
				</Title>
				<PacketInfo>
					<InfoItem>
						<Text strong style={{ color: "#000000" }}>
							Time:
						</Text>
						<Text style={{ color: "#CCCCCC" }}>{packet.time}</Text>
					</InfoItem>
					<InfoItem>
						<Text strong style={{ color: "#000000" }}>
							Protocol:
						</Text>
						<Text style={{ color: "#CCCCCC" }}>{packet.protocol}</Text>
					</InfoItem>
					<InfoItem>
						<Text strong style={{ color: "#000000" }}>
							Size:
						</Text>
						<Text style={{ color: "#CCCCCC" }}>{packet.size} bytes</Text>
					</InfoItem>
				</PacketInfo>
			</PacketHeader>

			<StyledTabs defaultActiveKey="1">
				<TabPane tab="Protocol Tree" key="1">
					{renderProtocolTree()}
				</TabPane>
				<TabPane tab="Hex Dump" key="2">
					{renderHexDump()}
				</TabPane>
			</StyledTabs>
		</DetailsContainer>
	);
};

export { PacketDetails };

const DetailsContainer = styled(Card)`
	height: 100%;

	overflow: auto;

	.ant-card-body {
		padding: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
`;

const EmptyState = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
`;

const PacketHeader = styled.div`
	padding: 16px;
	border-bottom: 1px solid #3e3e3e;
`;

const PacketInfo = styled.div`
	display: flex;
	gap: 24px;
	margin-top: 12px;
`;

const InfoItem = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
`;

const StyledTabs = styled(Tabs)`
	flex: 1;
	display: flex;
	flex-direction: column;

	.ant-tabs-nav {
		margin: 0;
		padding: 0 16px;
	}
`;

const ProtocolTreeContainer = styled.div`
	padding: 16px;
`;

const ProtocolLayer = styled.div`
	margin-bottom: 16px;
	border: 1px solid #3e3e3e;
	border-radius: 4px;
`;

const LayerTitle = styled.div`
	background: #383838;
	padding: 8px 12px;
	color: #cccccc;
	font-weight: 600;
	border-bottom: 1px solid #3e3e3e;
`;

const LayerField = styled.div`
	display: flex;
	padding: 4px 12px;
	border-bottom: 1px solid #2d2d2d;

	&:last-child {
		border-bottom: none;
	}
`;

const FieldName = styled(Text)`
	color: #000000 !important;
	min-width: 150px;
	font-weight: 500;
`;

const FieldValue = styled(Text)`
	color: #cccccc !important;
	font-family: monospace;
`;

const HexDumpContainer = styled.div`
	padding: 16px;
	font-family: "Courier New", monospace;
	height: 100%;
	overflow-y: auto;
`;

const HexLine = styled.div`
	display: flex;
	margin-bottom: 2px;
	line-height: 1.4;
`;

const HexOffset = styled.span`
	color: #666;
	margin-right: 16px;
	min-width: 80px;
`;

const HexBytes = styled.span`
	color: #000000;
	margin-right: 16px;
	min-width: 400px;
`;

const AsciiBytes = styled.span`
	color: #cccccc;
`;
