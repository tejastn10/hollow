import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { networkInterfaces } from "os";

import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { NetworkInterface } from "@renderer/types/network";

import { INTERFACE_MAPPING } from "./constants";

const getIconPath = (): string => {
	const path = join(__dirname, "../../resources/icon.png");
	return path;
};

const getInterfaceDescription = (name: string) => {
	const platform = process.platform;
	const mappings = INTERFACE_MAPPING[platform] || [];

	// ? Find the first mapping that matches the interface name
	const mapping = mappings.find((m) => name.startsWith(m.prefix));

	// * Return formatted description or default to the name
	return mapping ? `${mapping.description} (${name})` : name;
};

const getRealNetworkInterfaces = () => {
	const interfaces = networkInterfaces();

	const result: NetworkInterface[] = [];

	for (const [name, addresses] of Object.entries(interfaces)) {
		if (addresses) {
			const filteredAddresses = addresses
				.filter((addr) => !addr.internal)
				.map((addr) => ({ addr: addr.address, netmask: addr.netmask, family: addr.family }));

			if (filteredAddresses.length > 0) {
				result.push({
					name,
					description: getInterfaceDescription(name),
					addresses: filteredAddresses,
				});
			}
		}
	}

	// ? Add loopback interface if it doesn't exist
	const loopbackInterface = interfaces["lo0"] || interfaces["lo"] || interfaces["Loopback"];
	if (
		loopbackInterface &&
		!result.some(
			(iface) => iface.name === "lo0" || iface.name === "lo" || iface.name === "Loopback"
		)
	) {
		result.push({
			name: process.platform === "win32" ? "lo" : "lo0",
			description: "Loopback",
			addresses: loopbackInterface
				.filter((addr) => !addr.internal && addr.family === "IPv4")
				.map((addr) => ({ addr: addr.address, netmask: addr.netmask, family: addr.family })),
		});
	}

	return result;
};

const createWindow = (): BrowserWindow => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1400,
		height: 900,
		show: false,
		icon: getIconPath(),
		autoHideMenuBar: true,
		frame: false,
		titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}

	return mainWindow;
};

// ? Handlers

// * Window handlers
ipcMain.handle("minimize-window", () => {
	const mainWindow = BrowserWindow.getAllWindows()[0];

	if (mainWindow) {
		mainWindow.minimize();
	}
});

ipcMain.handle("maximize-window", () => {
	const mainWindow = BrowserWindow.getAllWindows()[0];
	if (mainWindow) {
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
		} else {
			mainWindow.maximize();
		}
	}
});

ipcMain.handle("close-window", () => {
	const mainWindow = BrowserWindow.getAllWindows()[0];

	if (mainWindow) {
		mainWindow.close();
	}
});

// * App handlers
ipcMain.handle("get-network-interfaces", async (): Promise<NetworkInterface[]> => {
	try {
		const interfaces = getRealNetworkInterfaces();
		return interfaces;
	} catch (error) {
		console.error(`Error getting network interfaces: ${JSON.stringify(error, null, 2)}`);
		return [];
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Set Dock icon for macOS
	if (process.platform === "darwin") {
		app.dock?.setIcon(getIconPath());
	}

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	app.on("before-quit", () => {});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
