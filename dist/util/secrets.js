"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const dotenv_1 = __importDefault(require("dotenv"));
logger_1.default.debug("Using variables.env file to supply config environment variables");
dotenv_1.default.config({ path: "variables.env" });
exports.ENVIRONMENT = process.env.NODE_ENV;
const prod = exports.ENVIRONMENT === "production"; // Anything else is treated as 'dev'
exports.MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];
if (!exports.MONGODB_URI) {
    logger_1.default.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}
//# sourceMappingURL=secrets.js.map