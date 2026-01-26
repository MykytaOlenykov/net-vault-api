import { Telnet } from "telnet-client";

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

    connection.on("connect", () => console.log("DEBUG: Telnet event: connect"));
    connection.on("ready", () => console.log("DEBUG: Telnet event: ready"));

    connection.on("data", (data: Buffer) => {
        if (Buffer.isBuffer(data)) {
            console.log(`DEBUG: Telnet event: data (${data.toString()})`);
        } else {
            console.log(`DEBUG: Telnet event: data (str=${data})`);
        }
    });

    connection.on("error", (err: NodeJS.ErrnoException) => {
        if (
            err.code === "ECONNRESET" ||
            (err.message && err.message.includes("ECONNRESET"))
        ) {
            console.log(
                "DEBUG: Telnet connection reset (remote side closed connection)"
            );
        } else {
            console.error("DEBUG: Telnet event: error", err);
        }
    });

    connection.on("close", () => console.log("DEBUG: Telnet event: close"));
    connection.on("timeout", () => console.log("DEBUG: Telnet event: timeout"));

    console.log("DEBUG: Connecting to ", host, port);

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

    console.log("Connected and Authenticated (via built-in flow)");
    console.log("TELNET authenticated, shell ready");

    return connection;
}

export async function execTelnet(
    client: Telnet,
    commands: string[]
): Promise<string> {
    console.log("Start exec TELNET...");
    console.log("commands: ", commands);
    let output = "";

    try {
        for (const command of commands) {
            console.log(`command: ${command}`);

            let cmdBuffer = "";

            const dataListener = (data: Buffer) => {
                cmdBuffer += data.toString();
            };

            client.on("data", dataListener);

            try {
                // exec returns the response from the server after the command
                const cmdOutput = await client.exec(command);
                console.log("output received (len): ", cmdOutput.length);
                output += cmdOutput + "\n";
            } finally {
                client.removeListener("data", dataListener);
            }
        }
    } catch (error) {
        console.error("DEBUG: Error in execTelnet", error);
        throw error;
    }

    console.log("End exec TELNET.");

    return output;
}
