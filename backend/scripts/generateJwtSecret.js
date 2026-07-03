import crypto from "node:crypto";

const secret = crypto.randomBytes(32).toString("hex");

process.stdout.write(`${secret}\n`);
