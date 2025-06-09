import { FC } from "react";

import { Badge, Typography } from "antd";
import { WifiOutlined } from "@ant-design/icons";

import styled from "styled-components";

import { getNetworkStatusColor, getNetworkStatusText } from "../utils";

import { useNetworkStatus } from "../../hooks/useNetworkStatus";

const { Text } = Typography;

const StatusBar: FC = () => {
	const networkStatus = useNetworkStatus();

	return (
		<StatusBarContainer>
			<LeftSection>
				<span>Left Section</span>
			</LeftSection>
			<RightSection>
				<Text>{getNetworkStatusText(networkStatus)}</Text>
				<Badge dot color={getNetworkStatusColor(networkStatus)} offset={[-2, 0]}>
					<WifiOutlined />
				</Badge>
			</RightSection>
		</StatusBarContainer>
	);
};

export { StatusBar };

const StatusBarContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	width: 100%;
	height: 1.25rem;

	background-color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#000000")};
	color: ${(props) => (props.theme === "dark" ? "#000000" : "#ffffff")};

	border-top: ${(props) => (props.theme === "dark" ? "1px solid #333333" : "1px solid #e0e0e0e")};
	padding: 0 1rem;
`;

const LeftSection = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 1rem;

	padding: 0 1rem;

	span {
		color: ${(props) => (props.theme === "dark" ? "#000000" : "#ffffff")} !important;
	}
`;

const RightSection = styled.div`
	&& {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;

		padding: 0 1rem;

		text-transform: capitalize;

		span {
			color: ${(props) => (props.theme === "dark" ? "#000000" : "#ffffff")} !important;
		}
	}
`;
