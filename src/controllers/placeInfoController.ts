import { Request, Response, NextFunction } from "express";
import Promise from "bluebird";
import { IPlaceInfoModel, PlaceInfo } from "../models/PlaceInfo";
const NewsAPI = require("newsapi");

const googleMapsClient = require("@google/maps").createClient({
  key: process.env.PLACES_API_KEY,
  Promise : Promise
});

const newsapi = new NewsAPI(process.env.NEWS_API_KEY);


export let validateSearchedText = (req: Request, res: Response, next: NextFunction) => {
  const searchText = req.query.name || "".trim();
  if (searchText.length > 0){
    next();
    return;
  }
  res.status(400).send({error: "Place cannot be empty"});
};
export let getPlaceInfo = (req: Request, res: Response) => {
  const searchText = req.query.name || "".replace(/%20/g, " ");
  PlaceInfo.findOne({name : searchText}).exec().then((placeInfo: IPlaceInfoModel) => {
    console.log(placeInfo);
    placeInfo ? res.status(200).send(placeInfo) : fetchPlaceInfo(searchText, res).then((place: IPlaceInfoModel) => {
      res.status(200).send(place);
    });
  }).catch((err) => {
    res.status(500).send({error: err.message});
  });
};

function fetchPlaceInfo(searchText: any, res: Response): Promise<any> {
  const googlePlacePromise = googleMapsClient.places({query: searchText}).asPromise();
  const newsPromise = newsapi.v2.everything({q: searchText, pageSize: 10});
  
  return Promise.all([googlePlacePromise, newsPromise]).then((result) => {
    const googlePlaceResult = result[0];
    const placeNewsResult = result[1];
    
    let placeInfo: any = {} ;
    const placeList = googlePlaceResult.json.results;
    if (googlePlaceResult.status == 200 && placeList.length > 0){
      const place = placeList[0];
      placeInfo.name = place.name;
      placeInfo.loc = {};
      placeInfo.loc.coordinates = [place.geometry.location.lng, place.geometry.location.lat]; 
    }
    
    const articles = placeNewsResult.articles;
    placeInfo.articles =  (articles && articles.length > 0) ? articles : [] ;
    
    return new PlaceInfo(placeInfo).save().then((place: IPlaceInfoModel) => {
      return Promise.resolve(place);
    }).catch((err) => {
      console.log("SAVE Error", err);
      return Promise.reject({err : {message : "Internal Server Error"}});

    });    
  }).catch((err) => {
    console.log("Search Error", err);
    return Promise.reject({err : {message : "Internal Server Error"}});
  });
}