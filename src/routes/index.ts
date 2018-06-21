import express from "express";
const router = express.Router();
import * as placesInfoController from "../controllers/placeInfoController";


router.get("/",)
router.get("/v1/places", placesInfoController.validateSearchedText, placesInfoController.getPlaceInfo);

export default router;