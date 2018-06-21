import express from "express";
const router = express.Router();
import * as placesInfoController from "../controllers/placeInfoController";
import * as homeController from "../controllers/homeController";


router.get("/", homeController.welcomeMsg);
router.get("/v1/places", placesInfoController.validateSearchedText, placesInfoController.getPlaceInfo);

export default router;