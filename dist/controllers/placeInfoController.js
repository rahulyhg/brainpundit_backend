"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = __importDefault(require("bluebird"));
const PlaceInfo_1 = require("../models/PlaceInfo");
const NewsAPI = require("newsapi");
const googleMapsClient = require("@google/maps").createClient({
    key: process.env.PLACES_API_KEY,
    Promise: bluebird_1.default
});
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
exports.validateSearchedText = (req, res, next) => {
    const searchText = req.query.name || "".trim();
    if (searchText.length > 0) {
        next();
        return;
    }
    res.status(400).send({ error: "Place cannot be empty" });
};
exports.getPlaceInfo = (req, res) => {
    const searchText = req.query.name || "".replace(/%20/g, " ");
    PlaceInfo_1.PlaceInfo.findOne({ name: searchText }).exec().then((placeInfo) => {
        console.log(placeInfo);
        placeInfo ? res.status(200).send(placeInfo) : fetchPlaceInfo(searchText, res).then((place) => {
            res.status(200).send(place);
        });
    }).catch((err) => {
        res.status(500).send({ error: err.message });
    });
};
function fetchPlaceInfo(searchText, res) {
    const googlePlacePromise = googleMapsClient.places({ query: searchText }).asPromise();
    const newsPromise = newsapi.v2.everything({ q: searchText, pageSize: 10 });
    return bluebird_1.default.all([googlePlacePromise, newsPromise]).then((result) => {
        const googlePlaceResult = result[0];
        const placeNewsResult = result[1];
        let placeInfo = {};
        const placeList = googlePlaceResult.json.results;
        if (googlePlaceResult.status == 200 && placeList.length > 0) {
            const place = placeList[0];
            placeInfo.name = place.name;
            placeInfo.loc = {};
            placeInfo.loc.coordinates = [place.geometry.location.lng, place.geometry.location.lat];
        }
        const articles = placeNewsResult.articles;
        placeInfo.articles = (articles && articles.length > 0) ? articles : [];
        return new PlaceInfo_1.PlaceInfo(placeInfo).save().then((place) => {
            return bluebird_1.default.resolve(place);
        }).catch((err) => {
            console.log("SAVE Error", err);
            return bluebird_1.default.reject({ err: { message: "Internal Server Error" } });
        });
    }).catch((err) => {
        console.log("Search Error", err);
        return bluebird_1.default.reject({ err: { message: "Internal Server Error" } });
    });
}
//# sourceMappingURL=placeInfoController.js.map