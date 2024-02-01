import express from 'express';
import {createTour, deleteTour, getAllTour, getSingleTour, updateTour, getTourBySearch, getFeaturedTour, getTourCount} from '../controllers/tourController.js';
import { verifyAdmin, verifyToken } from '../utils/verifyToken.js';
const router = express.Router();

//create a new tour
router.post('/', verifyAdmin, createTour);
//update tour
router.put('/:id',verifyAdmin, updateTour);
//delete tour
router.delete('/:id',verifyAdmin, deleteTour);
//create a new tour
router.get('/:id', getSingleTour);
// create a new tour
router.get('/', getAllTour);
//get tour by search 
router.get('/search/getTourBySearch', getTourBySearch);
//get Featured tour by search 
router.get('/search/getFeaturedTours', getFeaturedTour);
//get tour count
router.get('/search/getTourCount', getTourCount);



export default router;