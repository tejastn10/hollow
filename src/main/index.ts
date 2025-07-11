import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { networkInterfaces } from "os";
import { spawn, type ChildProcess } from "child_process";

import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { NetworkInterface, PacketData } from "@renderer/types/network";

import { INTERFACE_MAPPING } from "./constants";

// ? Network Capture variables
let captureProcess: ChildProcess | undefined | null = null;
let isCapturing = false;

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

const createSimplePacket = ({
	srcIP,
	dstIP,
	srcPort,
	dstPort,
	protocol,
	length,
	id,
}: {
	srcIP: string;
	dstIP: string;
	protocol: string;
	length: number;
	id: number;
	srcPort?: number;
	dstPort?: number;
}): PacketData => {
	// Create a simplified packet structure
	const packet: number[] = [];

	// Ethernet header (14 bytes)
	packet.push(0x00, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e); // Dst MAC
	packet.push(0x00, 0x1b, 0x2c, 0x3d, 0x4e, 0x5f); // Src MAC
	packet.push(0x08, 0x00); // EtherType (IPv4)

	// IP header (20 bytes) - simplified for both IPv4 and IPv6
	let srcBytes: number[];
	let dstBytes: number[];

	// Check if it's IPv6 (contains colons) or IPv4
	if (srcIP.includes(":")) {
		// IPv6 - use simplified representation
		// Take last 4 segments and convert to bytes for display purposes
		const srcParts = srcIP.split(":").slice(-2);
		const dstParts = dstIP.split(":").slice(-2);

		// Convert hex segments to bytes (simplified)
		srcBytes = srcParts.flatMap((part) => {
			const num = parseInt(part || "0", 16);
			return [(num >> 8) & 0xff, num & 0xff];
		});

		dstBytes = dstParts.flatMap((part) => {
			const num = parseInt(part || "0", 16);
			return [(num >> 8) & 0xff, num & 0xff];
		});

		// Pad to 4 bytes
		while (srcBytes.length < 4) srcBytes.push(0);
		while (dstBytes.length < 4) dstBytes.push(0);
		srcBytes = srcBytes.slice(0, 4);
		dstBytes = dstBytes.slice(0, 4);
	} else {
		// IPv4
		srcBytes = srcIP.split(".").map((n) => parseInt(n) || 0);
		dstBytes = dstIP.split(".").map((n) => parseInt(n) || 0);

		// Ensure we have 4 bytes
		while (srcBytes.length < 4) srcBytes.push(0);
		while (dstBytes.length < 4) dstBytes.push(0);
		srcBytes = srcBytes.slice(0, 4);
		dstBytes = dstBytes.slice(0, 4);
	}

	packet.push(0x45, 0x00); // Version + IHL, ToS
	packet.push((length >> 8) & 0xff, length & 0xff); // Total length
	packet.push(0x00, 0x00, 0x40, 0x00); // ID, Flags + Fragment
	packet.push(64); // TTL

	// Protocol
	let ipProtocol = 6; // TCP
	if (protocol === "UDP" || protocol === "DNS") ipProtocol = 17;
	else if (protocol === "ICMP") ipProtocol = 1;
	else if (protocol === "QUIC" || protocol === "HTTP/3") ipProtocol = 17; // QUIC runs over UDP
	packet.push(ipProtocol);

	packet.push(0x00, 0x00); // Checksum
	packet.push(...srcBytes); // Source IP
	packet.push(...dstBytes); // Destination IP

	// Transport header
	if (
		(protocol === "TCP" ||
			protocol === "UDP" ||
			protocol === "QUIC" ||
			protocol === "HTTP/3" ||
			protocol === "HTTPS" ||
			protocol === "HTTP" ||
			protocol === "DNS") &&
		srcPort &&
		dstPort
	) {
		packet.push((srcPort >> 8) & 0xff, srcPort & 0xff);
		packet.push((dstPort >> 8) & 0xff, dstPort & 0xff);

		if (protocol === "TCP" || protocol === "HTTPS" || protocol === "HTTP") {
			// TCP header continuation
			packet.push(0x00, 0x00, 0x00, 0x01); // Seq
			packet.push(0x00, 0x00, 0x00, 0x01); // Ack
			packet.push(0x50, 0x18); // Header length + flags
			packet.push(0x20, 0x00); // Window
			packet.push(0x00, 0x00, 0x00, 0x00); // Checksum + urgent
		} else {
			// UDP header continuation (for UDP, QUIC, HTTP/3, DNS)
			packet.push(0x00, 0x08); // Length
			packet.push(0x00, 0x00); // Checksum
		}
	}

	// Pad to minimum length
	while (packet.length < Math.max(60, length)) {
		packet.push(0x00);
	}

	return {
		timestamp: Date.now(),
		data: packet,
		length: packet.length,
		linkType: String(1),
		id: String(id),
	};
};

const parseTextPacket = (line: string, id: number): PacketData | null => {
	try {
		if (!line.trim()) {
			return null;
		}

		// ? Skip tcp dump status messages
		if (
			line.includes("tcpdump:") ||
			line.includes("listening on") ||
			line.includes("packets captured") ||
			line.includes("packets received") ||
			line.includes("packets dropped") ||
			line.includes("verbose output suppressed") ||
			(!line.includes("IP") &&
				!line.includes("ARP") &&
				!line.includes("ICMP") &&
				!line.includes("IP6") &&
				!line.includes("IPv6"))
		) {
			return null;
		}

		// ? Handle both IPv4 and IPv6 packets
		let srcIP = "Unknown";
		let dstIP = "Unknown";
		let protocol = "Unknown";
		let srcPort = 0;
		let dstPort = 0;
		let length = 64;

		// ? Remove timestamp and extaract the main part
		const mainPart = line.replace(/^\d{2}:\d{2}:\d{2}\.\d{6} /, "").trim();

		// ? Check if it's IPv6
		if (mainPart.includes("IP6") || mainPart.includes("IPv6")) {
			// ? Handle IPv6 QUIC traffic
			const ipv6QuicMatch = mainPart.match(/^IP6 ([\w:]+)\.(\d+) > ([\w:]+)\.(\d+): (.+)$/);
			if (ipv6QuicMatch) {
				srcIP = ipv6QuicMatch[1];
				srcPort = parseInt(ipv6QuicMatch[2], 10);
				dstIP = ipv6QuicMatch[3];
				dstPort = parseInt(ipv6QuicMatch[4], 10);
				protocol = "QUIC";
				length = parseInt(ipv6QuicMatch[5], 10) || length;
			}

			// ? QUIC is typically HTTP/3
			if (srcPort === 443 || dstPort === 443) {
				protocol = "HTTP/3";
			}

			return createSimplePacket({ srcIP, dstIP, srcPort, dstPort, protocol, length, id });
		}

		// ? Handle IPv6 TCP traffic
		const ipv6TcpMatch = mainPart.match(
			/^IP6 ([\w:]+)\\.(\d+) > ([\w:]+)\.(\d+): Flags \[(.+)\], seq (\d+), ack (\d+), length (\d+)$/
		);
		if (ipv6TcpMatch) {
			srcIP = ipv6TcpMatch[1];
			srcPort = parseInt(ipv6TcpMatch[2], 10);
			dstIP = ipv6TcpMatch[3];
			dstPort = parseInt(ipv6TcpMatch[4], 10);
			length = parseInt(ipv6TcpMatch[8], 10) || length;

			const remainder = ipv6TcpMatch[5];

			// ? Determine protocol from remainder
			if (remainder.includes("Flags")) {
				protocol = "TCP";

				// ? Check if HTTP/HTTPS based on ports
				if (srcPort === 80 || dstPort === 80) {
					protocol = "HTTP";
				} else if (srcPort === 443 || dstPort === 443) {
					protocol = "HTTPS";
				}
			} else if (remainder.includes("ICMP")) {
				protocol = "ICMPv6";
			} else if (remainder.includes("UDP")) {
				protocol = "UDP";
				if (srcPort === 53 || dstPort === 53) {
					protocol = "DNS";
				}
			} else {
				protocol = "Unknown";
			}
			return createSimplePacket({ srcIP, dstIP, srcPort, dstPort, protocol, length, id });
		} else {
			// ? Handle IPv4 packets
			const ipv4Match = mainPart.match(/^IP ([\d.]+)\.(\d+) > ([\d.]+)\.(\d+): (.+)$/);
			if (ipv4Match) {
				srcIP = ipv4Match[1];
				srcPort = parseInt(ipv4Match[2], 10);
				dstIP = ipv4Match[3];
				dstPort = parseInt(ipv4Match[4], 10);
				length = parseInt(ipv4Match[6], 10) || length;
				const remainder = ipv4Match[5];

				// ? Determine protocol based on remainder
				if (remainder.includes("Flags")) {
					protocol = "TCP";

					// ? Check if HTTP/HTTPS based on ports
					if (srcPort === 80 || dstPort === 80) {
						protocol = "HTTP";
					} else if (srcPort === 443 || dstPort === 443) {
						protocol = "HTTPS";
					}
				} else if (remainder.includes("UDP")) {
					protocol = "UDP";
					if (srcPort === 53 || dstPort === 53) {
						protocol = "DNS";
					}
				} else if (remainder.includes("ICMP")) {
					protocol = "ICMP";
				} else {
					protocol = "Unknown";
				}

				return createSimplePacket({ srcIP, dstIP, srcPort, dstPort, protocol, length, id });
			} else {
				console.warn(`Unrecognized packet format: ${line}`);
				return null;
			}
		}
	} catch (error) {
		console.error(`Error parsing packet line: ${line}`);
		console.error(`Error details: ${error}`);
		return null;
	}
};

const requestPasswordFromRenderer = (mainWindow: BrowserWindow): Promise<string | null> => {
	return new Promise((resolve) => {
		// ? Send request for password
		mainWindow.webContents.send("request-password");

		// ? Listen for password response
		const handlePasswordResponse = (_event: Electron.IpcMainEvent, password: string | null) => {
			// ? User cancelled the password prompt
			ipcMain.removeListener("password-response", handlePasswordResponse);
			return resolve(password);
		};

		ipcMain.once("password-response", handlePasswordResponse);

		// ? Timeout for password request
		setTimeout(() => {
			ipcMain.removeListener("password-response", handlePasswordResponse);
			return resolve(null);
		}, 30000); // 30 seconds timeout
	});
};

const startRealCapture = async (
	captureCommand: string,
	captureArgs: string[],
	mainWindow: BrowserWindow
): Promise<{ success: boolean; process?: ChildProcess; error?: string }> => {
	return new Promise((resolve, reject) => {
		const executeCapture = async (): Promise<void> => {
			try {
				let command: string;
				let args: string[];

				if (process.platform === "darwin" || process.platform === "linux") {
					// ? Show password modal for sudo access
					const result = await dialog.showMessageBox(mainWindow, {
						type: "question",
						title: "Sudo Access Required",
						message: "This action requires elevated privileges. \n Please enter your password.",
						buttons: ["Cancel", "OK"],
						cancelId: 0,
						defaultId: 1,
						icon: getIconPath(),
					});

					if (result.response === 0) {
						mainWindow.webContents.send("capture-status", {
							status: "error",
							message: "Capture cancelled by user.",
						});
						// User cancelled
						return reject({
							success: false,
							error: "Capture cancelled by user.",
						});
					}

					// ? Request password through IPC
					mainWindow.webContents.send("capture-status", {
						status: "requesting-password",
						message: "Please enter your password to continue.",
					});

					const password = await requestPasswordFromRenderer(mainWindow);
					if (!password) {
						mainWindow.webContents.send("capture-status", {
							status: "error",
							message: "Capture cancelled due to missing password.",
						});
						return reject({
							success: false,
							error: "Capture cancelled due to missing password.",
						});
					}

					// ? Use echo to pipe password to sudo
					command = "bash";
					args = ["-c", `echo "${password}" | sudo -S ${captureCommand} ${captureArgs.join(" ")}`];
				} else {
					// ? Unsupported platform
					mainWindow.webContents.send("capture-status", {
						status: "error",
						message: "Unsupported platform for capture.",
					});
					return reject({
						success: false,
						error: "Unsupported platform for capture.",
					});
				}

				console.log(`Executing capture command: ${command} ${args.join(" ")}`);

				// ? Check if tcpdump is installed
				const spawnedProcess = spawn("which", ["tcpdump"]);
				spawnedProcess.on("close", (code) => {
					if (code !== 0) {
						mainWindow.webContents.send("capture-status", {
							status: "error",
							message: "tcpdump is not installed. Please install it to proceed.",
						});
						return reject({
							success: false,
							error: "tcpdump is not installed.",
						});
					}

					// ? Start the capture process
					captureProcess = spawn(command, args, {
						stdio: ["ignore", "pipe", "pipe"],
						detached: true,
					});

					if (!captureProcess.stdout || !captureProcess.stderr) {
						mainWindow.webContents.send("capture-status", {
							status: "error",
							message: "Failed to start capture process.",
						});
						return reject({
							success: false,
							error: "Failed to start capture process.",
						});
					}

					let packetId = 0;
					let privilegedGroup = false;

					// ? Parse TCPDump output (using -l -n for simpler format)
					captureProcess.stdout.on("data", (data: Buffer) => {
						if (!privilegedGroup) {
							privilegedGroup = true;
							console.log("Capture process started with privileged group.");
							mainWindow.webContents.send("capture-status", {
								status: "started",
								message: "Capture started successfully with privileged group.",
							});
						}

						const output = data.toString();
						const lines = output.split("\n").filter((line) => line.trim());

						let processedCount = 0;
						const maxPacketsPerBatch = 20;
						lines?.forEach((line) => {
							if (line.trim() && processedCount < maxPacketsPerBatch) {
								const packet = parseTextPacket(line, ++packetId);
								if (packet) {
									mainWindow.webContents.send("packet-captured", packet);
									processedCount++;
								}
							}
						});
						if (processedCount > 0) {
							console.log(`Captured ${processedCount} packets in this batch.`);
						} else {
							console.warn("No valid packets captured in this batch.");
						}
					});
					captureProcess.stderr.on("data", (data: Buffer) => {
						const errorMessage = data.toString().trim();

						// Only treat certain messages as errors
						if (
							errorMessage.includes("Permission denied") ||
							errorMessage.includes("cannot open BPF device")
						) {
							console.error("Capture process failed due to insufficient privileges.");
							mainWindow.webContents.send("capture-status", {
								status: "error",
								message: "Capture failed due to insufficient privileges. Please run with sudo.",
							});
							privilegedGroup = true;

							if (captureProcess) {
								captureProcess.kill("SIGTERM");
								captureProcess = null;
								isCapturing = false;
							}

							return reject({
								success: false,
								error: "Capture failed due to insufficient privileges. Please run with sudo.",
							});
						} else if (
							errorMessage.includes("Sorry, try again") ||
							errorMessage.includes("incorrect password") ||
							errorMessage.includes("authentication failure") ||
							errorMessage.includes("1 incorrect password attempt")
						) {
							console.warn("Capture process failed due to incorrect password.");
							mainWindow.webContents.send("capture-status", {
								status: "error",
								message: "Capture failed due to incorrect password. Please try again.",
							});

							if (captureProcess) {
								captureProcess.kill("SIGTERM");
								captureProcess = null;
								isCapturing = false;
							}

							return reject({
								success: false,
								error: "Capture failed due to incorrect password. Please try again.",
							});
						} else {
							// Log other stderr output, but don't treat as error
							console.log(`tcpdump stderr: ${errorMessage}`);
						}
						return undefined;
					});
					captureProcess.on("error", (error: Error) => {
						console.error(`Capture process error: ${error.message}`);

						isCapturing = false;
						captureProcess = null;

						mainWindow.webContents.send("capture-status", {
							status: "error",
							message: `Capture process error: ${error.message}`,
						});
						return reject({
							success: false,
							error: `Capture process error: ${error.message}`,
						});
					});
					captureProcess.on("close", (code: number) => {
						console.log(`Capture process closed with code: ${code}`);

						isCapturing = false;
						captureProcess = null;

						if (code === 0 || privilegedGroup) {
							mainWindow.webContents.send("capture-status", {
								status: "stopped",
								message: "Capture stopped successfully.",
							});
							return resolve({
								success: true,
							});
						} else if (code === 1 && !privilegedGroup) {
							// ? Checking if authorization failed
							if (code === 1) {
								console.error("Capture process failed due to insufficient privileges.");
								mainWindow.webContents.send("capture-status", {
									status: "error",
									message: "Capture failed due to insufficient privileges. Please run with sudo.",
								});
								return reject({
									success: false,
									error: "Capture failed due to insufficient privileges. Please run with sudo.",
								});
							} else {
								console.error(`Capture process failed with code: ${code}`);
								mainWindow.webContents.send("capture-status", {
									status: "error",
									message: `Capture process failed with code: ${code}`,
								});
								return reject({
									success: false,
									error: `Capture process failed with code: ${code}`,
								});
							}
						} else {
							console.error(`Capture process exited with unexpected code: ${code}`);
							mainWindow.webContents.send("capture-status", {
								status: "error",
								message: `Capture process exited with unexpected code: ${code}`,
							});
							return reject({
								success: false,
								error: `Capture process exited with unexpected code: ${code}`,
							});
						}
					});
					// Ensure a return value at the end of the function
					return undefined;
				});

				isCapturing = true;
				return resolve({
					success: true,
				});
			} catch (error) {
				console.error(`Error starting capture: ${JSON.stringify(error, null, 2)}`);

				mainWindow.webContents.send("capture-status", {
					status: "error",
					message: `Failed to start capture: ${(error as Error).message}`,
				});

				return reject({
					success: false,
					error: `Failed to start capture: ${(error as Error).message}`,
				});
			}
		};

		executeCapture();
	});
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

// * Capture handlers
ipcMain.handle("start-capture", async (_, interfaceName: string, filter: string) => {
	if (isCapturing) {
		console.warn(
			"Capture is already in progress. Please stop the current capture before starting a new one."
		);
		return {
			success: false,
			error: "Capture is already in progress.",
		};
	}

	try {
		const mainWindow = BrowserWindow.getAllWindows()[0];
		if (!mainWindow || mainWindow.isDestroyed()) {
			console.error("Main window is not available or has been destroyed.");
			return {
				success: false,
				error: "Main window is not available.",
			};
		}

		const captureCommand = process.platform === "win32" ? "npcap" : "tcpdump";
		const captureArgs = [
			"-i",
			interfaceName,
			"-w",
			"capture.pcap",
			"-U", // Unbuffered output
			"-s",
			"0", // Capture full packets
		];

		if (filter) {
			captureArgs.push("-f", filter);
		}

		console.log(`Starting capture on interface: ${interfaceName} with filter: ${filter}`);

		const result = await startRealCapture(captureCommand, captureArgs, mainWindow);
		if (!result.success) {
			console.error(`Failed to start capture: ${result.error}`);
			return {
				success: false,
				error: result.error,
			};
		}

		isCapturing = true;
		captureProcess = result.process;
		console.log("Capture started successfully.");
		mainWindow.webContents.send("capture-status", {
			status: "started",
			message: `Capture started on interface: ${interfaceName}`,
		});

		return {
			success: true,
			message: `Capture started on interface: ${interfaceName}`,
		};
	} catch (error) {
		console.error(`Error starting capture: ${JSON.stringify(error, null, 2)}`);

		isCapturing = false;
		captureProcess = null;
		return {
			success: false,
			error: `Failed to start capture: ${(error as Error).message}`,
		};
	}
});

ipcMain.handle("stop-capture", async () => {
	console.log("Stopping capture...");

	if (captureProcess) {
		try {
			// ? For detached processes, we need to kill process group
			const pid = captureProcess.pid;
			if (pid !== undefined) {
				process.kill(-pid, "SIGTERM");
			} else if (typeof captureProcess.kill === "function") {
				captureProcess.kill("SIGTERM");
			}

			// ! If process doesn't exit gracefully, force kill
			setTimeout(() => {
				if (captureProcess && !captureProcess.killed) {
					console.warn("Capture process did not exit gracefully, force killing...");
					try {
						if (captureProcess.pid) {
							process.kill(-captureProcess.pid, "SIGKILL");
						} else {
							captureProcess.kill("SIGKILL");
						}
					} catch (error) {
						console.error("Error force killing capture process:", error);
					}
				}
			}, 5000); // Wait 5 seconds before force killing

			captureProcess = null;
			isCapturing = false;
		} catch (error) {
			console.error("Error stopping capture:", error);

			// ? Try to clean up capture process
			if (captureProcess && typeof captureProcess.kill === "function") {
				try {
					captureProcess.kill("SIGKILL");
				} catch (killError) {
					console.error("Error force killing capture process:", killError);
				}
			}
			captureProcess = null;
			isCapturing = false;
		}
	}

	// ? Notify renderer that capture has stopped
	const mainWindow = BrowserWindow.getAllWindows()[0];
	if (mainWindow && mainWindow.webContents && !mainWindow.isDestroyed()) {
		mainWindow.webContents.send("capture-status", {
			status: "stopped",
			message: "Capture stopped successfully.",
		});
	}

	return {
		success: true,
	};
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

	app.on("before-quit", () => {
		if (captureProcess) {
			captureProcess.kill("SIGTERM");
			captureProcess = null;
			isCapturing = false;
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (captureProcess) {
		captureProcess.kill("SIGTERM");
		captureProcess = null;
		isCapturing = false;
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
