import {program} from "commander";
import { analyzeKey } from "./helpers/keyAnalyzer.js";

program.version("1.0.0").description("TuneMate CLI - Analyze songs, find keys, and more");

program.command("analyze")
    .description("Analyze the musical key of an audio file")
    .argument("<file>", "Path to the audio file")
    .action(analyzeKey);

program.parse(process.argv);
