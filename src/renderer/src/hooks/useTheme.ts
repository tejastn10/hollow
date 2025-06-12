import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";

// Custom Hook to Use Theme Context
const useTheme = (): {
	theme: string;
	toggleTheme: () => void;
} => useContext(ThemeContext);

export { useTheme };
