"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = mongoose_1.default.Schema;
const coordinatesSchema = new schema({
    type: { type: String, required: true, default: "Point" },
    coordinates: { type: [Number] }
});
const articleSchema = new schema({
    author: String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: { type: Date, default: Date.now }
});
const placeInfoSchema = new schema({
    name: String,
    loc: coordinatesSchema,
    articles: [articleSchema]
});
exports.PlaceInfo = mongoose_1.default.model("placeInfo", placeInfoSchema);
//# sourceMappingURL=PlaceInfo.js.map