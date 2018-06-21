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
        placeInfo ? res.status(200).send(placeInfo) : fetchPlaceInfo(searchText, res).then((place) => {
            res.status(200).send(place);
        }).catch((err) => {
            err.code ? res.status(err.code).send({ error: err.message }) : res.status(500).send({ error: err.message });
        });
    }).catch((err) => {
        err.code ? res.status(err.code).send({ error: err.message }) : res.status(500).send({ error: err.message });
    });
};
function fetchPlaceInfo(searchText, res) {
    return googleMapsClient.places({ query: searchText }).asPromise().then((googlePlaceResponse) => {
        let placeInfo = {};
        const placeList = googlePlaceResponse.json.results;
        return (googlePlaceResponse.status == 200 && placeList.length > 0) ? proceedToSearchLocationNews(searchText, placeInfo, placeList)
            : bluebird_1.default.reject({ message: "Location Info Not Found", code: 404 });
    }).catch((err) => {
        return err.code ? bluebird_1.default.reject(err) : bluebird_1.default.reject({ message: "Internal Server Error", code: 500 });
    });
}
function proceedToSearchLocationNews(searchText, placeInfo, placeList) {
    const place = placeList[0];
    placeInfo.name = place.name;
    placeInfo.loc = {};
    placeInfo.loc.coordinates = [place.geometry.location.lng, place.geometry.location.lat];
    return newsapi.v2.everything({ q: searchText, pageSize: 10 }).then((placeNewsResult) => {
        const articles = placeNewsResult.articles;
        placeInfo.articles = (articles && articles.length > 0) ? articles : [];
        return new PlaceInfo_1.PlaceInfo(placeInfo).save().then((place) => {
            return bluebird_1.default.resolve(place);
        }).catch((err) => {
            // console.log("SAVE Error", err);
            return bluebird_1.default.reject({ message: "Internal Server Error", code: 500 });
        });
    }).catch((err) => {
        return bluebird_1.default.reject({ message: err.message, code: 500 });
    });
}
//# sourceMappingURL=placeInfoController.js.map