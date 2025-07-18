import { FC, useState, useMemo } from "react";

import { Table, Typography, Tag, Tooltip } from "antd";
import styled from "styled-components";

import moment from "moment";

import { PacketData, ParsedPacket } from "@renderer/types/network";

const { Text } = Typography;

interface Props {
	packets: PacketData[];

	onPacketSelect?: (packet: ParsedPacket) => void;
}

const PacketList: FC<Props> = ({ packets, onPacketSelect }) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const parsePacket = (packet: PacketData, id: number): ParsedPacket => {
		const buffer = new Uint8Array(packet.data);

		// ? Basic Ethernet frame parsing
		let source = "Unknown";
		let destination = "Unknown";
		let protocol = "Unknown";
		let info = "Raw packet data";

		try {
			if (buffer.length >= 14) {
				// ? Ethernet header
				const etherType = (buffer[12] << 8) | buffer[13];

				if (etherType === 0x0800) {
					// IPv4
					protocol = "IPv4";
					if (buffer.length >= 34) {
						// IPv4 header starts at offset 14
						const ipHeader = buffer.slice(14);
						const srcIP = `${ipHeader[12]}.${ipHeader[13]}.${ipHeader[14]}.${ipHeader[15]}`;
						const dstIP = `${ipHeader[16]}.${ipHeader[17]}.${ipHeader[18]}.${ipHeader[19]}`;

						source = srcIP;
						destination = dstIP;

						const ipProtocol = ipHeader[9];
						switch (ipProtocol) {
							case 1:
								protocol = "ICMP";
								info = "ICMP packet";
								break;
							case 6:
								protocol = "TCP";
								if (buffer.length >= 54) {
									const tcpHeader = buffer.slice(34);
									const srcPort = (tcpHeader[0] << 8) | tcpHeader[1];
									const dstPort = (tcpHeader[2] << 8) | tcpHeader[3];
									info = `TCP ${srcPort} → ${dstPort}`;

									// Check for HTTP
									if (srcPort === 80 || dstPort === 80 || srcPort === 8080 || dstPort === 8080) {
										protocol = "HTTP";
										info = `HTTP ${srcPort} → ${dstPort}`;
									}
									// Check for HTTPS
									else if (srcPort === 443 || dstPort === 443) {
										protocol = "HTTPS";
										info = `HTTPS ${srcPort} → ${dstPort}`;
									}
								}
								break;
							case 17:
								protocol = "UDP";
								if (buffer.length >= 42) {
									const udpHeader = buffer.slice(34);
									const srcPort = (udpHeader[0] << 8) | udpHeader[1];
									const dstPort = (udpHeader[2] << 8) | udpHeader[3];
									info = `UDP ${srcPort} → ${dstPort}`;

									// Check for DNS
									if (srcPort === 53 || dstPort === 53) {
										protocol = "DNS";
										info = "DNS query/response";
									}
								}
								break;
							default:
								info = `IP Protocol ${ipProtocol}`;
						}
					}
				} else if (etherType === 0x86dd) {
					// IPv6
					protocol = "IPv6";
					info = "IPv6 packet";
				} else if (etherType === 0x0806) {
					// ARP
					protocol = "ARP";
					info = "ARP request/reply";
				}
			}
		} catch (error) {
			console.warn("Error parsing packet:", error);
		}

		return {
			...packet,
			id,
			time: moment(packet.timestamp).format("HH:mm:ss.SSS"),
			source,
			destination,
			protocol,
			info,
			size: packet.length,
		};
	};

	// ? Parse raw packet data
	const parsedPackets = useMemo(() => {
		return packets.map((packet, index) => {
			const parsed = parsePacket(packet, index + 1);
			return parsed;
		});
	}, [packets]);

	const getProtocolColor = (protocol: string): string => {
		const colors: Record<string, string> = {
			HTTP: "#4CAF50",
			HTTPS: "#2196F3",
			TCP: "#FF9800",
			UDP: "#9C27B0",
			DNS: "#00BCD4",
			ICMP: "#F44336",
			ARP: "#795548",
			IPv4: "#607D8B",
			IPv6: "#3F51B5",
		};
		return colors[protocol] || "#757575";
	};

	const handleRowClick = (record: ParsedPacket) => {
		setSelectedRowKeys([record.id]);
		onPacketSelect?.(record);
	};

	const columns = [
		{
			title: "No.",
			dataIndex: "id",
			key: "id",
			width: 60,
			render: (id: number) => (
				<Text style={{ color: "#000000", fontFamily: "monospace" }}>{id}</Text>
			),
		},
		{
			title: "Time",
			dataIndex: "time",
			key: "time",
			width: 120,
			render: (time: string) => (
				<Text style={{ color: "#CCCCCC", fontFamily: "monospace" }}>{time}</Text>
			),
		},
		{
			title: "Source",
			dataIndex: "source",
			key: "source",
			width: 150,
			render: (source: string) => (
				<Tooltip title={source}>
					<Text style={{ color: "#4FC3F7", fontFamily: "monospace" }}>
						{source.length > 15 ? `${source.substring(0, 12)}...` : source}
					</Text>
				</Tooltip>
			),
		},
		{
			title: "Destination",
			dataIndex: "destination",
			key: "destination",
			width: 150,
			render: (destination: string) => (
				<Tooltip title={destination}>
					<Text style={{ color: "#FF8A65", fontFamily: "monospace" }}>
						{destination.length > 15 ? `${destination.substring(0, 12)}...` : destination}
					</Text>
				</Tooltip>
			),
		},
		{
			title: "Protocol",
			dataIndex: "protocol",
			key: "protocol",
			width: 100,
			render: (protocol: string) => (
				<Tag color={getProtocolColor(protocol)} style={{ fontFamily: "monospace" }}>
					{protocol}
				</Tag>
			),
		},
		{
			title: "Length",
			dataIndex: "size",
			key: "size",
			width: 80,
			render: (size: number) => (
				<Text style={{ color: "#CCCCCC", fontFamily: "monospace" }}>{size}</Text>
			),
		},
		{
			title: "Info",
			dataIndex: "info",
			key: "info",
			render: (info: string) => (
				<Tooltip title={info}>
					<Text style={{ color: "#CCCCCC" }}>{info}</Text>
				</Tooltip>
			),
		},
	];

	return (
		<PacketListContainer>
			<Table
				columns={columns}
				dataSource={parsedPackets}
				rowKey="id"
				pagination={false}
				size="small"
				scroll={{ y: "calc(100% - 2.5rem)" }}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => setSelectedRowKeys(keys),
					type: "radio",
				}}
				onRow={(record) => ({
					onClick: () => handleRowClick(record as ParsedPacket),
				})}
			/>
		</PacketListContainer>
	);
};

export { PacketList };

const PacketListContainer = styled.div`
	border-radius: 0.25rem;

	height: 100%;

	display: flex;
	flex-direction: column;
	overflow: hidden;

	border: 1px solid ${(props) => (props.theme === "dark" ? "#333333" : "#e0e0e0")};

	.ant-table,
	.ant-table-body,
	.ant-table-wrapper,
	.ant-table-container,
	.ant-spin-container,
	.ant-spin-nested-loading {
		height: 100%;

		overflow-y: scroll;
	}

	.ant-table,
	.ant-table-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.ant-table-container {
		flex: 1;
	}

	& .ant-table-tbody > tr > td {
		border-bottom: none;
	}
`;
