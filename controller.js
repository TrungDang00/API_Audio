import { spawn } from 'child_process';
import vosk from 'vosk';
import fs from 'fs';
import path from 'path';

const MODEL_PATH = 'model';
const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4000;

if (!fs.existsSync(MODEL_PATH)) {
    console.log('Please download the model from https://alphacephei.com/vosk/models and unpack as ' + MODEL_PATH + ' in the current folder.');
    process.exit();
}
vosk.setLogLevel(0); // Đặt mức độ log của thư viện vosk thành 0 để tắt các thông báo log.
const model = new vosk.Model(MODEL_PATH); // Tạo một instance của model vosk từ đường dẫn MODEL_PATH.

// const transcribe = (req, res) => { // Định nghĩa hàm transcribe nhận request (req) và response (res).
//     const FILE_NAME = req.file.path;
//     // console.log("req.file", req.file);
//     const ffmpeg_run = spawn('ffmpeg', [ // Tạo một quá trình con để chạy lệnh ffmpeg.
//         '-loglevel', 'quiet', // Đặt mức độ log của ffmpeg thành quiet (không log).
//         '-i', FILE_NAME, // Đường dẫn của tệp âm thanh đầu vào.
//         '-ar', String(SAMPLE_RATE), // Tần số lấy mẫu của âm thanh đầu ra.
//         '-ac', '1', // Số kênh âm thanh đầu ra.
//         '-f', 's16le', // Định dạng âm thanh đầu ra.
//         '-bufsize', String(BUFFER_SIZE), // Kích thước bộ đệm.
//         '-' // Đặt đầu ra của ffmpeg là stdout.
//     ]);


//     const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });
//     let transcription = '';
//     ffmpeg_run.stdout.on('data', (data) => {
//         if (rec.acceptWaveform(data)) {
//             const result = rec.result().text;
//             transcription += result;
//             // console.log("abc2", result);
//         } else {
//             const partialResult = rec.partialResult();
//             // console.log("abc1:", partialResult);
//         }
//     });
//     ffmpeg_run.on('close', (code) => {
//         if (code !== 0) {
//             console.error(`ffmpeg process exited with code ${code}`);
//         }
//         const finalResult = rec.finalResult();
//         transcription += finalResult.text;

//         // console.log("abc112321", finalResult.text);
//         console.log("transcription", transcription);
//         res.json(transcription);
//     });
// };

const transcribe = (req, res) => {
    const FILE_NAME = req.file.path;
    console.log("req.file", req.file);

    // Định nghĩa đường dẫn cho tệp MP3 đầu ra trong thư mục audios
    const audiosDir = path.resolve(process.cwd(), 'audios');
    if (!fs.existsSync(audiosDir)) {
        fs.mkdirSync(audiosDir);
    }
    const MP3_FILE_NAME = path.join(audiosDir, path.basename(FILE_NAME, path.extname(FILE_NAME)) + '.wav');

    // Bước 1: Chuyển đổi tệp đầu vào sang định dạng MP3 và lưu vào thư mục audios
    const convertToMp3 = spawn('ffmpeg', [
        '-i', FILE_NAME,      // Đường dẫn tệp đầu vào
        '-ar', '44100',       // Tần số lấy mẫu (điều chỉnh nếu cần)
        '-ac', '2',           // Số kênh âm thanh (stereo)
        MP3_FILE_NAME         // Đường dẫn tệp MP3 đầu ra trong thư mục audios
    ]);

    convertToMp3.on('close', (code) => {
        if (code !== 0) {
            console.error(`Quá trình chuyển đổi ffmpeg thoát với mã lỗi ${code}`);
            return res.status(500).send("Chuyển đổi tệp sang MP3 thất bại");
        }

        // Bước 2: Tiến hành phiên âm sử dụng tệp MP3
        const ffmpeg_run = spawn('ffmpeg', [
            '-loglevel', 'quiet', // Tắt log ffmpeg
            '-i', MP3_FILE_NAME,  // Đường dẫn của tệp MP3
            '-ar', String(SAMPLE_RATE), // Thiết lập tần số lấy mẫu
            '-ac', '1',  // Kênh âm thanh đơn
            '-f', 's16le', // Định dạng đầu ra
            '-' // Đầu ra đến stdout
        ]);

        const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });
        let transcription = '';

        ffmpeg_run.stdout.on('data', (data) => {
            if (rec.acceptWaveform(data)) {
                const result = rec.result().text;
                transcription += result;
            } else {
                const partialResult = rec.partialResult();
                transcription += partialResult.partial;
            }
        });

        ffmpeg_run.on('close', (code) => {
            if (code !== 0) {
                console.error(`Quá trình ffmpeg thoát với mã lỗi ${code}`);
                return res.status(500).send("Phiên âm thất bại");
            }
            const finalResult = rec.finalResult();
            transcription += finalResult.text;
            console.log("phiên âm", transcription);
            res.json(transcription);
        });
    });
};

export { transcribe };