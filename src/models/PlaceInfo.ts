import mongoose from "mongoose";
const schema = mongoose.Schema;

interface ICoordinates {
    type: string | "Point";
    coordinates: [number];
}

interface IArticle {
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
}

interface IPlaceInfo {
    name: string;
    loc: ICoordinates;
    articles: [IArticle];
}


const coordinatesSchema = new schema({
    type: {type: String, required: true, default: "Point"},
    coordinates: {type: [Number]}
});

const articleSchema = new schema({
    author : String,
    title: String,
    description: String,
    url: String,
    urlToImage: String,
    publishedAt: {type: Date, default: Date.now}
});

const placeInfoSchema = new schema({
    name : String,
    loc: coordinatesSchema,
    articles : [articleSchema]
});

export interface IPlaceInfoModel extends IPlaceInfo, mongoose.Document {
}

export const PlaceInfo: mongoose.Model<IPlaceInfoModel> = mongoose.model<IPlaceInfoModel>("placeInfo", placeInfoSchema);


