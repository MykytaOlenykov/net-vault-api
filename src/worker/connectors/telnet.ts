import { Telnet } from "telnet-client";
import { logger } from "../worker.utils.js";

export interface TelnetConnectParams {
    host: string;
    port?: number;
    username: string;
    password: string;
}

export async function connectTelnet({
    host,
    port = 23,
    username,
    password,
}: TelnetConnectParams): Promise<Telnet> {
    const connection = new Telnet();

    connection.on("error", (err: NodeJS.ErrnoException) => {
        if (
            err.code === "ECONNRESET" ||
            (err.message && err.message.includes("ECONNRESET"))
        ) {
            logger.info(
                "DEBUG: Telnet connection reset (remote side closed connection)"
            );
        } else {
            logger.error({ err }, "Telnet event: error");
        }
    });

    connection.on("close", () => logger.info("Telnet event: close"));
    connection.on("timeout", () => logger.warn("Telnet event: timeout"));

    logger.info({ host, port }, "Connecting via Telnet");

    // Configured for Cisco Nexus or generic linux/network device
    await connection.connect({
        host,
        port,
        username,
        password,
        timeout: 15000,
        // Let telnet-client handle negotiation and login
        negotiationMandatory: true,
        ors: "\r\n",
        irs: "\r\n",
        initialLFCR: false, // Don't send CR initially
        debug: false,

        // Regex patterns for login
        loginPrompt: /(?:login|username|User Name):\s*$/i,
        passwordPrompt: /password:\s*$/i,
        shellPrompt: /[<a-zA-Z0-9._-]{3,}[>#]\s*$/,

        // Helper to debug what we are waiting for if it stalls
        pageSeparator: /---- More ----|--More--/i,
    });

    return connection;
}

export async function execTelnet(
    client: Telnet,
    commands: string[]
): Promise<string> {
    let output = "";

    try {
        for (const command of commands) {
            const cmdOutput = await client.exec(command, {
                execTimeout: 30000,
            });

            output = cmdOutput + "\n";
        }
    } catch (error) {
        logger.error({ error }, "Error in execTelnet");
        throw error;
    }

    return output;
}
