import sqlite3 from "sqlite3";
import { StoredComment } from "../types";

export class DatabaseService {
  private db: sqlite3.Database;
  private isInitialized: boolean = false;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const createTable = `
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          videoId TEXT NOT NULL,
          processedAt DATETIME NOT NULL,
          repliedAt DATETIME,
          aiResponse TEXT,
          status TEXT NOT NULL DEFAULT 'pending'
        )
      `;

      this.db.run(createTable, (err) => {
        if (err) {
          console.error("Error creating database table:", err);
          reject(err);
        } else {
          console.log("Database initialized successfully");
          this.isInitialized = true;
          resolve();
        }
      });
    });
  }

  async isCommentProcessed(commentId: string): Promise<boolean> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const query = "SELECT id FROM comments WHERE id = ?";
      this.db.get(query, [commentId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(!!row);
        }
      });
    });
  }

  async storeComment(comment: StoredComment): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO comments (id, videoId, processedAt, repliedAt, aiResponse, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [
          comment.id,
          comment.videoId,
          comment.processedAt,
          comment.repliedAt,
          comment.aiResponse,
          comment.status,
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateCommentStatus(
    commentId: string,
    status: StoredComment["status"],
    aiResponse?: string
  ): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE comments 
        SET status = ?, aiResponse = ?, repliedAt = ? 
        WHERE id = ?
      `;

      const repliedAt = status === "replied" ? new Date().toISOString() : null;

      this.db.run(query, [status, aiResponse, repliedAt, commentId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getProcessedCommentsCount(): Promise<number> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) as count FROM comments";
      this.db.get(query, [], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
    });
  }
}
