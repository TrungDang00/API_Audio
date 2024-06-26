// import express from 'express';
// import { transcribe } from './controller.js';
// import multer from 'multer';

// const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

// // router.post('/transcribe12', upload.single('file'), (req, res) => {
// //     res.json(req.file)
// // });


// router.post('/transcribe', upload.single('file'), transcribe);

// export default router;


import express from 'express';
import { transcribe } from './controller.js';
import multer from 'multer';
import path from 'path'; // Import path for handling file extensions

let uploadCounter = 0;

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        uploadCounter += 1;
        const fileExtension = path.extname(file.originalname);
        cb(null, `upload_${uploadCounter}${fileExtension}`);
    }
});

const upload = multer({ storage: storage });

router.post('/transcribe', upload.single('file'), transcribe);

export default router;
