import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * File-backed queue used when Redis is not reachable.
 * Same interface as the BullMQ driver, and it survives a restart because the
 * pending list is written to disk.
 */
export class FileQueue {
  constructor({ filePath, handler, pollIntervalMs = 1200 }) {
    this.name = 'file';
    this.filePath = filePath;
    this.handler = handler;
    this.pollIntervalMs = pollIntervalMs;
    this.pending = [];
    this.timer = null;
    this.running = false;
  }

  async init() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      this.pending = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.pending = [];
    }
    await this.persist();
  }

  async persist() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(this.pending, null, 2), 'utf8');
  }

  async enqueue(data) {
    const entry = {
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      data,
      runAt: Date.now(),
      attempts: 0,
    };
    this.pending.push(entry);
    await this.persist();
    return { id: entry.id, driver: this.name };
  }

  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const due = this.pending.filter((entry) => entry.runAt <= Date.now());
      if (due.length === 0) return;

      for (const entry of due) {
        this.pending = this.pending.filter((e) => e.id !== entry.id);
        try {
          await this.handler(entry.data);
          entry.attempts += 1;
        } catch {
          entry.attempts += 1;
          if (entry.attempts < 3) {
            entry.runAt = Date.now() + 1500 * entry.attempts;
            this.pending.push(entry);
          }
        }
      }
      await this.persist();
    } finally {
      this.running = false;
    }
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tick().catch((err) => console.error('[queue:file] tick failed:', err.message));
    }, this.pollIntervalMs);
    this.timer.unref?.();
  }

  async stats() {
    return { driver: this.name, pending: this.pending.length, completed: 0, failed: 0 };
  }

  async close() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.persist();
  }
}

export default FileQueue;
