import { Client } from "ssh2";

const DEFAULT_SSH_PORT = 22;

export function connectSSH({
    host,
    port = DEFAULT_SSH_PORT,
    username,
    password,
}: {
    host: string;
    port?: number;
    username: string;
    password: string;
}) {
    return new Promise<Client>((resolve, reject) => {
        const client = new Client();

        client
            .on("ready", () => resolve(client))
            .on("error", reject)
            .connect({
                host,
                port,
                username,
                password,
                readyTimeout: 10_000,
            });
    });
}

export function execShell(
    client: Client,
    commands: string[],
    timeout?: number
): Promise<string> {
    return new Promise((resolve, reject) => {
        let timer: NodeJS.Timeout;

        if (timeout) {
            timer = setTimeout(() => {
                reject(new Error("Timeout"));
            }, timeout);
        }

        client.shell((err, stream) => {
            if (err) {
                if (timer) {
                    clearTimeout(timer);
                }

                return reject(err);
            }

            let output = "";

            stream
                .on("data", (data: Buffer) => {
                    output += data.toString();
                })
                .on("close", () => {
                    if (timer) {
                        clearTimeout(timer);
                    }

                    if (commands.length > 0) {
                        const lastCommand = commands[commands.length - 1];
                        const lastCmdIndex = output.lastIndexOf(lastCommand);

                        if (lastCmdIndex >= 0) {
                            let result = output.substring(
                                lastCmdIndex + lastCommand.length
                            );
                            // Remove leading newlines/returns
                            result = result.replace(/^\s+/, "");

                            // Remove trailing prompt and exit
                            // Assume the output ends with ...<prompt>exit...
                            const exitIndex = result.lastIndexOf("exit");

                            if (exitIndex >= 0) {
                                // Extract up to the 'exit' command
                                const beforeExit = result.substring(
                                    0,
                                    exitIndex
                                );

                                // The prompt is typically on the last line of beforeExit
                                const lastNewline = Math.max(
                                    beforeExit.lastIndexOf("\n"),
                                    beforeExit.lastIndexOf("\r")
                                );

                                const hasNewline = lastNewline >= 0;

                                result = hasNewline
                                    ? beforeExit.substring(0, lastNewline)
                                    : "";
                            }

                            output = result.trim();
                        }
                    }

                    // console.log(output);
                    resolve(output);
                })
                .stderr.on("data", (data) => {
                    if (timer) {
                        clearTimeout(timer);
                    }

                    reject(new Error(data.toString()));
                });

            for (const command of commands) {
                stream.write(command + "\n");
            }

            stream.end("exit\n");
        });
    });
}
