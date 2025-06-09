import { FC } from "react";

import { Typography } from "antd";

import styled from "styled-components";

const { Text } = Typography;

const TitleBar: FC = () => {
	const isMac = navigator.userAgent.includes("Macintosh");

	return (
		<TitleBarContainer $isMac={isMac}>
			<LeftSection>
				<Text>Left Section</Text>
			</LeftSection>
			<CenterSection>
				<Text>Center Section</Text>
			</CenterSection>
			<RightSection>
				<Text>Right Section</Text>
			</RightSection>
		</TitleBarContainer>
	);
};

export { TitleBar };

const TitleBarContainer = styled.div<{ $isMac?: boolean }>`
	display: flex;
	justify-content: space-between;
	align-items: center;

	width: 100%;
	height: 2.25rem;

	background-color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#000000")};
	color: ${(props) => (props.theme === "dark" ? "#000000" : "#ffffff")};

	border-bottom: ${(props) =>
		props.theme === "dark" ? "1px solid #333333" : "1px solid #e0e0e0e"};
	padding: 0 1rem;

	user-select: none;
	position: relative;
	-webkit-app-region: drag;

	z-index: 1000;

	${(props) =>
		props.$isMac &&
		`
			padding-left: 5rem;
			justify-content: ${props.$isMac ? "flex-start" : "space-between"};

			& > div:nth-child(1) {
				margin-right: auto;
				margin-left: 2rem;
			}

			& > div:nth-child(2) {
			margin-left: -5rem;
			margin-right: auto;
			}

			& > div:nth-child(3) {
				margin-right: 2rem;
			}
		`}
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

const CenterSection = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	flex-grow: 1;

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
