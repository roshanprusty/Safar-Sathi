import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import tourRoute from './routes/tours.js';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import reviewRoute from './routes/reviews.js';
import bookingRoute from './routes/bookings.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const corsOptions={
    origin: true,
    credentials: true
}

// db connection
mongoose.set('strictQuery', false);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('MongoDB database connected');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
    }
};

app.use(express.json());
/* `app.use(cors(corsOptions));` is enabling Cross-Origin Resource Sharing (CORS) for the Express
application. */
app.use(cors(corsOptions));
/* `app.use(cookieParser());` is a middleware function that parses cookies attached to the incoming
request object. It adds a `cookies` property to the request object, which contains the parsed
cookies. This allows you to access and manipulate cookies in your application. */
app.use(cookieParser());
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/review', reviewRoute);
app.use('/api/v1/booking', bookingRoute);

app.listen(port, () => {
    connect();
    console.log('Listening on port', port);
});
