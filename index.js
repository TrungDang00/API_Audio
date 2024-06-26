import express from 'express';
import multer from 'multer';
import cors from 'cors';

import bodyParser from 'body-parser';
import routes from './route.js';


const app = express();

// Sử dụng CORS middleware
app.use(cors());
// const upload = multer({ dest: 'uploads/',
//                         mimetype: "audio/mp3" });

app.use(bodyParser.json());
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
