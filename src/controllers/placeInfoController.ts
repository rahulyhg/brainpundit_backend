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
    placeInfo ? res.status(200).send(placeInfo) : fetchPlaceInfo(searchText, res).then((place: IPlaceInfoModel) => {
      res.status(200).send(place);
    }).catch((err) => {
      err.code ? res.status(err.code).send({error: err.message}) : res.status(500).send({error: err.message});  
    });
  }).catch((err) => {
    err.code ? res.status(err.code).send({error: err.message}) : res.status(500).send({error: err.message});
  });
};

function fetchPlaceInfo(searchText: any, res: Response): Promise<any> {
  return googleMapsClient.places({query: searchText}).asPromise().then((googlePlaceResponse: any) => {
    let placeInfo: any = {} ;
    const placeList = googlePlaceResponse.json.results;
    return (googlePlaceResponse.status == 200 && placeList.length > 0) ? proceedToSearchLocationNews(searchText, placeInfo, placeList) 
    : Promise.reject({message : "Location Info Not Found", code: 404});

  }).catch((err: any) => {
      return err.code ? Promise.reject(err) : Promise.reject({message : "Internal Server Error", code: 500});
  });
}

function proceedToSearchLocationNews(searchText: any, placeInfo: any, placeList: any): Promise<any> {
  const place = placeList[0];
  placeInfo.name = place.name;
  placeInfo.loc = {};
  placeInfo.loc.coordinates = [place.geometry.location.lng, place.geometry.location.lat]; 
  return newsapi.v2.everything({q: searchText, pageSize: 10}).then((placeNewsResult: any) => {
    const articles = placeNewsResult.articles;
    placeInfo.articles =  (articles && articles.length > 0) ? articles : [] ;
    return new PlaceInfo(placeInfo).save().then((place: any) => {
      return Promise.resolve(place);
    }).catch((err: any) => {
      // console.log("SAVE Error", err);
      return Promise.reject({message : "Internal Server Error", code: 500});
    });
    
  }).catch((err: any) => {
    return Promise.reject({message : err.message, code: 500});
  });    
}