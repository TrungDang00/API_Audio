import express from 'express';
import { transcribe } from './controller.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

// router.post('/transcribe12', upload.single('file'), (req, res) => {
//     res.json(req.file)
// });


router.post('/transcribe', upload.single('file'), transcribe);

export default router;
