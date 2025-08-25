import { WifiOutlined } from "@ant-design/icons";

import { Badge, Typography } from "antd";
import type { FC } from "react";

import styled from "styled-components";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { getNetworkStatusColor, getNetworkStatusText } from "./utils";

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
				<Badge dot color={getNetworkStatusColor(networkStatus)} offset={[2, 2]}>
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
	height: 2.25rem;

	border-top: ${(props) => (props.theme !== "dark" ? "1px solid #333333" : "1px solid #e0e0e0e")};
	padding: 0 1rem;
`;

const LeftSection = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 1rem;

	padding: 0 1rem;
`;

const RightSection = styled.div`
	&& {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;

		padding: 0 1rem;

		text-transform: capitalize;
	}
`;
