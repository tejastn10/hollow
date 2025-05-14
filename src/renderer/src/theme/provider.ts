import { ThemeConfig } from "antd";

const LightThemeProvider: ThemeConfig = {
	token: {
		colorPrimary: "#000000",
		fontFamily:
			"Outfit, Onest, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
	},
	components: {
		Button: {
			algorithm: true,
			// Shadows
			primaryShadow: "none",
			boxShadowSecondary: "none",
			boxShadowTertiary: "none",
			dangerShadow: "none",
			defaultShadow: "none",
		},
		Card: {
			colorBorderSecondary: "#00000022",
			headerBg: "#e9e8e8",
		},
		Input: {
			activeShadow: "none",
		},
		InputNumber: {
			activeShadow: "none",
		},
		Typography: {
			linkDecoration: "overline",
			colorLink: "#000000",
			colorLinkActive: "#000000",
			colorLinkHover: "#000000",
		},
		Divider: {
			colorSplit: "#000000aa",
		},
		Tabs: {
			itemColor: "#00000055",
			itemHoverColor: "#000000aa",
		},
		Menu: {
			itemSelectedBg: "#000000",
			itemSelectedColor: "#ffffff",
			itemColor: "#00000055",
			itemHoverColor: "#000000aa",
		},
		Select: {
			optionSelectedBg: "#000000",
			optionSelectedColor: "#ffffff",
			optionSelectedFontWeight: 300,
			colorTextQuaternary: "#000000",
		},
		Segmented: {
			itemSelectedBg: "#000000",
			itemSelectedColor: "#ffffff",
		},
	},
};

const DarkThemeProvider: ThemeConfig = {
	token: {
		colorPrimary: "#ffffff", // Use white as the primary color in dark mode
		fontFamily:
			"Outfit, Onest, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
		colorBgBase: "#121212", // Dark background
		colorTextBase: "#ffffff", // White text
	},
	components: {
		Button: {
			algorithm: true,
			primaryShadow: "none",
			boxShadowSecondary: "none",
			boxShadowTertiary: "none",
			dangerShadow: "none",
			defaultShadow: "none",
		},
		Card: {
			colorBorderSecondary: "#ffffff33", // Subtle border color for dark mode
			headerBg: "#1e1e1e", // Darker header background
		},
		Input: {
			activeShadow: "none",
		},
		InputNumber: {
			activeShadow: "none",
		},
		Typography: {
			linkDecoration: "overline",
			colorLink: "#ffffff", // White links for dark mode
			colorLinkActive: "#ffffffcc", // Slightly dimmed white
			colorLinkHover: "#ffffff", // Bright white hover effect
		},
		Divider: {
			colorSplit: "#ffffff44", // Subtle divider color
		},
		Tabs: {
			itemColor: "#ffffff88", // Dimmed white for inactive tabs
			itemHoverColor: "#ffffffcc", // Brighter white on hover
		},
		Menu: {
			itemSelectedBg: "#ffffff", // Bright selection background
			itemSelectedColor: "#000000", // Contrast with selection background
			itemColor: "#ffffff88", // Dimmed white for unselected items
			itemHoverColor: "#ffffffcc", // Brighter white on hover
		},
		Select: {
			optionSelectedBg: "#ffffff", // Bright background for selected options
			optionSelectedColor: "#000000", // Black text for contrast
			optionSelectedFontWeight: 300,
			colorTextQuaternary: "#ffffff88", // Dimmed white for inactive text
		},
		Segmented: {
			itemSelectedBg: "#ffffff", // Bright background for selected items
			itemSelectedColor: "#000000", // Contrast with selection background
		},
	},
};

export { LightThemeProvider, DarkThemeProvider };
