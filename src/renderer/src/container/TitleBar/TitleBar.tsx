import { FC } from "react";

import logo from "../../assets/electron.svg";

import { Typography, Image } from "antd";
import { MinusOutlined, CloseOutlined, BorderOutlined } from "@ant-design/icons";

import styled from "styled-components";

const { Text } = Typography;

const TitleBar: FC = () => {
	const isMac = navigator.userAgent.includes("Macintosh");

	const handleMinimize = () => {
		window.api?.minimizeWindow();
	};

	const handleMaximize = () => {
		window.api?.maximizeWindow();
	};

	const handleClose = () => {
		window.api?.closeWindow();
	};

	return (
		<TitleBarContainer $isMac={isMac}>
			<LeftSection>
				<LogoImage src={logo} alt="Logo" height={20} />
				<Text>Hollow</Text>
			</LeftSection>
			<CenterSection>
				<Text>Center Section</Text>
			</CenterSection>
			<RightSection>
				{!isMac && (
					<WindowControls>
						<WindowButton onClick={handleMinimize}>
							<MinusOutlined />
						</WindowButton>
						<WindowButton onClick={handleMaximize}>
							<BorderOutlined />
						</WindowButton>
						<WindowButton $isClose onClick={handleClose}>
							<CloseOutlined />
						</WindowButton>
					</WindowControls>
				)}
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

	border-bottom: ${(props) =>
		props.theme !== "dark" ? "1px solid #333333" : "1px solid #e0e0e0e"};
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
			margin-left: -8rem;
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
	gap: 0.5rem;

	padding: 0 1rem;
`;

const LogoImage = styled(Image)`
	display: flex;
	align-items: center;
	justify-content: center;
`;

const CenterSection = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;

	flex-grow: 1;
`;

const RightSection = styled.div`
	&& {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.5rem;

		padding: 0 1rem;

		text-transform: capitalize;
	}
`;

const WindowControls = styled.div`
	display: flex;
	gap: 0.5rem;

	-webkit-app-region: no-drag;
`;

const WindowButton = styled.button<{ $isClose?: boolean }>`
	border: none;
	border-radius: 0.25rem;
	background: transparent;
	padding: 0.25rem;

	display: flex;
	align-items: center;
	justify-content: center;

	cursor: pointer;
	font-size: 0.75rem;

	&:hover {
		background-color: ${(props) => (props.$isClose ? "#ff4d4f" : "#ffffff19")};
	}
`;
