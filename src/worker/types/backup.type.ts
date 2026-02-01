import { Queue } from "bullmq";

export interface BackupJobData {
    deviceId: string;
}

export type BackupQueue = Queue<BackupJobData>;
