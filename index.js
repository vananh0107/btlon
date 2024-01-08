const express = require('express');
const dbConnect = require('./config/dbConnect');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const categoryRouter = require('./routes/categoryRoute');
const brandRouter = require('./routes/brandRoute');
const uploadRoute = require('./routes/uploadRoute');
const { notFound, errorHandler } = require('./middleware/errHandler');
const morgan = require('morgan');
const app = express();
dbConnect();
app.use(
  cors({
    origin: '*',
  })
);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/prodcategory', categoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/upload', uploadRoute);
app.use(notFound);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port http://localhost:${process.env.PORT}`);
});
