const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const crypto = require("crypto");

// ==========================================
// SETTINGS
// ==========================================

const SERIES_ID = "tt27502465";
const SEASON = 4;

// ב-Render:
// MEDIA_BASE_URL=http://PUBLIC-IP:3000/videos
const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL ||
    "http://127.0.0.1:3000/videos";

// חייב להיות אותו SECRET גם ב-Render וגם ב-server.js
const MEDIA_SECRET =
    process.env.MEDIA_SECRET ||
    "CHANGE-THIS-TO-A-LONG-RANDOM-SECRET";

// הכתוביות נמצאות בתוך videos ב-GitHub
const SUBTITLE_BASE_URL =
    "https://raw.githubusercontent.com/imry129-beep/dragons-rising-stremio-addon/main/videos";


// ==========================================
// MANIFEST
// ==========================================

const builder = new addonBuilder({
    id: "com.imry.dragonsrising.hebrew",

    version: "1.6.0",

    name: "Dragons Rising Hebrew",

    description:
        "Ninjago Dragons Rising Season 4 Episodes 11-20 with Hebrew subtitles",

    stremioAddonsConfig: {
        issuer: "https://stremio-addons.net",

        signature:
            "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..KKuyge6O2pYREL_nCNONeg.GPYOwVdXYiFKFK6wEmmQZ4MP5tGFsdGy34aDUqdJSCwadOyJ2Ah-v2Mt1ey26P9_Z1KM7iRhVgVBeV7Ww4tKdidOajrL_FXTNd97eHAINAtWKD3RVRhXDpz1HOvGo_4z.mTUVI6a4yfuH6HQJt04lqg"
    },

    resources: [
        "stream",
        "subtitles"
    ],

    types: [
        "series"
    ],

    catalogs: [],

    idPrefixes: [
        SERIES_ID
    ]
});


// ==========================================
// EPISODES
// ==========================================

const episodes = {
    11: "es11.mp4",
    12: "es12.mp4",
    13: "es13.mp4",
    14: "es14.mp4",
    15: "es15.mp4",
    16: "es16.mp4",
    17: "es17.mp4",

    // English + Hebrew Audio
    18: "output.mkv",

    19: "es19.mp4",
    20: "es20.mp4"
};


// ==========================================
// SUBTITLES
// ==========================================

const subtitleFiles = {
    11: "es11.srt",
    12: "es12.srt",
    13: "es13.srt",
    14: "es14.srt",
    15: "es15.srt",
    16: "es16.srt",
    17: "es17.srt",
    18: "es18.srt",
    19: "es19.srt",
    20: "es20.srt"
};


// ==========================================
// GET EPISODE NUMBER
// ==========================================

function getEpisode(id) {

    if (!id) {
        return null;
    }

    // Example:
    // tt27502465:4:18

    const parts = id.split(":");

    if (parts.length < 3) {
        return null;
    }

    const imdbId = parts[0];
    const season = Number(parts[1]);
    const episode = Number(parts[2]);

    if (imdbId !== SERIES_ID) {
        return null;
    }

    if (season !== SEASON) {
        return null;
    }

    if (!Number.isInteger(episode)) {
        return null;
    }

    return episode;
}


// ==========================================
// CREATE SIGNED VIDEO URL
// ==========================================

function createProtectedVideoUrl(filename) {

    // הקישור תקף ל-4 שעות
    const expires =
        Date.now() + (4 * 60 * 60 * 1000);

    const signature = crypto
        .createHmac("sha256", MEDIA_SECRET)
        .update(`${filename}:${expires}`)
        .digest("hex");

    return (
        `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}` +
        `?expires=${expires}` +
        `&signature=${signature}`
    );
}


// ==========================================
// STREAM HANDLER
// ==========================================

builder.defineStreamHandler(async (args) => {

    console.log("");
    console.log("========================================");
    console.log("STREAM REQUEST");
    console.log("Type:", args.type);
    console.log("ID:", args.id);
    console.log("========================================");

    if (args.type !== "series") {

        return {
            streams: []
        };
    }

    const episode =
        getEpisode(args.id);

    if (!episode) {

        console.log("Invalid episode");

        return {
            streams: []
        };
    }

    const filename =
        episodes[episode];

    if (!filename) {

        console.log(
            `Episode ${episode} is not available`
        );

        return {
            streams: []
        };
    }

    const videoUrl =
        createProtectedVideoUrl(filename);

    console.log(
        `Protected video S04E${episode}:`
    );

    console.log(videoUrl);

    return {
        streams: [
            {
                name:
                    "🇮🇱 Dragons Rising",

                title:
                    episode === 18
                        ? "S04E18 • Hebrew + English Audio"
                        : `S04E${episode} • Dragons Rising`,

                url:
                    videoUrl,

                // חשוב ל-HTTP / MKV / streams שלא Web-ready
                behaviorHints: {
                    notWebReady: true
                }
            }
        ]
    };
});


// ==========================================
// SUBTITLES HANDLER
// ==========================================

builder.defineSubtitlesHandler(async (args) => {

    console.log("");
    console.log("========================================");
    console.log("SUBTITLE REQUEST");
    console.log("Type:", args.type);
    console.log("ID:", args.id);
    console.log("========================================");

    if (args.type !== "series") {

        return {
            subtitles: []
        };
    }

    const episode =
        getEpisode(args.id);

    if (!episode) {

        return {
            subtitles: []
        };
    }

    const filename =
        subtitleFiles[episode];

    if (!filename) {

        console.log(
            `No subtitles for episode ${episode}`
        );

        return {
            subtitles: []
        };
    }

    const subtitleUrl =
        `${SUBTITLE_BASE_URL}/${encodeURIComponent(filename)}`;

    console.log(
        `Hebrew subtitles S04E${episode}:`
    );

    console.log(subtitleUrl);

    return {
        subtitles: [
            {
                id:
                    `dragons-rising-s04e${episode}-heb`,

                lang:
                    "heb",

                url:
                    subtitleUrl
            }
        ]
    };
});


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 7000;

serveHTTP(
    builder.getInterface(),
    {
        port: PORT
    }
);

console.log("");
console.log("========================================");
console.log("Dragons Rising Hebrew Addon");
console.log(`Running on port ${PORT}`);
console.log("Signed URLs: ENABLED");
console.log("notWebReady: ENABLED");
console.log("========================================");