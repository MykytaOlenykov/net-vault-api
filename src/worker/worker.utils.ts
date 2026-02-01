import pino from "pino";

export const logger = pino();

export function getBackupScheduleKey(deviceId: string) {
    return `backup:schedule:${deviceId}`;
}
