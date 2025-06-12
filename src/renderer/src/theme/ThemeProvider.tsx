import { FC, PropsWithChildren, useState, createContext } from "react";
import { ConfigProvider, ThemeConfig } from "antd";

import { LightThemeProvider, DarkThemeProvider } from "./provider";

// Context to Share Theme State
const ThemeContext = createContext({
	theme: "light", // Default theme
	toggleTheme: () => {}, // Placeholder for the toggle function
});

const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
	const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

	const toggleTheme = (): void => {
		setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	const selectedTheme: ThemeConfig =
		currentTheme === "light" ? LightThemeProvider : DarkThemeProvider;

	return (
		<ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
			<ConfigProvider theme={selectedTheme}>{children}</ConfigProvider>
		</ThemeContext.Provider>
	);
};

export { ThemeContext, ThemeProvider };
