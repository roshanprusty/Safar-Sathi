import Tour from "../models/Tour.js"
import Review from "../models/Review.js"

export const createReview = async (req,res) => {
   const tourId  = req.params.tourId

   // basic payload validation before constructing mongoose document
   const { rating, reviewText, username } = req.body
   if (rating == null) {
      return res.status(400).json({
         success: false,
         message: 'Rating is required'
      })
   }
   if (reviewText == null) {
      return res.status(400).json({
         success: false,
         message: 'Review text is required'
      })
   }
   if (username == null) {
      return res.status(400).json({
         success: false,
         message: 'Username is required'
      })
   }

   const newReview = new Review({ ...req.body })
   
   try {
      const savedReview = await newReview.save()

      // after creating a new review now update the reviews array of the tour 
      await Tour.findByIdAndUpdate(tourId, {
         $push: {reviews: savedReview._id}
      })

      res.status(200).json({success:true, message:"Review submitted", data:savedReview})
   } catch (error) {
      // forward mongoose validation message if available
      const message = error?.message || 'Failed to submit'
      res.status(500).json({success:false, message})
   }
}