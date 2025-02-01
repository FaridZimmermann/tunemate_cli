// keyAnalyzer.js (Logic File)
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import ffmpeg from "fluent-ffmpeg";
import Meyda from "meyda";
import wav from "wav-decoder";



async function analyzeKey(filePath) {
    //Main entry function for analyzing the key of an audio file
    // Args: filePath - path to the audio file to analyze

    if (!fs.existsSync(filePath)) {
        console.error(chalk.red('Error: File does not exist.'));
        process.exit(1);
    }
    
    const spinner = ora('Processing audio file...').start();   //start loading spinner
    const tempWavPath = path.join(path.resolve(), 'temp.wav');
    
    try {

        //convert if file is mp3 to wav file
        await convertToWav(filePath, tempWavPath);
        spinner.text = 'Analyzing key with Meyda...';
        

        const result = await runMeyda(tempWavPath);
        
        spinner.succeed(`Estimated key: ${chalk.green(result.key)}`);
    } catch (error) {
        spinner.fail(chalk.red('Failed to analyze the key.'));
        console.error(error.message);
    } finally {
        fs.removeSync(tempWavPath); 
    }
}

function convertToWav(inputPath, outputPath) {
     return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

async function runMeyda(audioPath) {
    const buffer = fs.readFileSync(audioPath);
    console.log(buffer)
    const decoded = await wav.decode(buffer);
    const audioData = decoded.channelData[0]; // Extract first channel

    const features = Meyda.extract(['chroma'], audioData);
    
    const key = estimateKey(features.chroma);
    return { key };
}

function estimateKey(chroma) {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const maxIndex = chroma.indexOf(Math.max(...chroma));
    return keys[maxIndex];
}

export { analyzeKey };
