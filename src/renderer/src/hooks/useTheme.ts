import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";

const useTheme = (): {
	theme: string;
	toggleTheme: () => void;
} => useContext(ThemeContext);

export { useTheme };
