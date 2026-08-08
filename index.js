const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const SERIES_ID = "tt27502465";
const SEASON = 4;

// מקומי:
// http://127.0.0.1:3000/videos
//
// כשתפרסם את הסרטונים באינטרנט,
// תגדיר ב-Render משתנה בשם MEDIA_BASE_URL
const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL ||
    "http://127.0.0.1:3000/videos";

const builder = new addonBuilder({
    id: "com.imry.dragonsrising.hebrew",
    version: "1.2.0",

    name: "Dragons Rising Hebrew",

    description:
        "Ninjago Dragons Rising Season 4 - Hebrew Audio & Subtitles",

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
// פרקים
// ==========================================

const episodes = {
    11: "es11.mp4",
    12: "es12.mp4",
    13: "es13.mp4",
    14: "es14.mp4",
    15: "es15.mp4",
    16: "es16.mp4",
    17: "es17.mp4",

    // פרק 18 שיצרנו עם English + Hebrew
    18: "output.mkv",

    19: "es19.mp4",
    20: "es20.mp4"
};


// ==========================================
// כתוביות
// ==========================================

const subtitles = {
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
// זיהוי פרק
// ==========================================

function getEpisode(id) {
    if (!id) {
        return null;
    }

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
// STREAM
// ==========================================

builder.defineStreamHandler(async (args) => {
    console.log("");
    console.log("==================================");
    console.log("STREAM REQUEST");
    console.log("Type:", args.type);
    console.log("ID:", args.id);
    console.log("==================================");

    if (args.type !== "series") {
        return {
            streams: []
        };
    }

    const episode = getEpisode(args.id);

    if (!episode || !episodes[episode]) {
        console.log("Episode not available");

        return {
            streams: []
        };
    }

    const filename = episodes[episode];

    const videoUrl =
        `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}`;

    console.log(
        `Playing S04E${episode}: ${videoUrl}`
    );

    return {
        streams: [
            {
                name: "🇮🇱 Dragons Rising",

                title:
                    episode === 18
                        ? `S04E18 • Hebrew + English Audio`
                        : `S04E${episode} • Dragons Rising`,

                url: videoUrl
            }
        ]
    };
});


// ==========================================
// SUBTITLES
// ==========================================

builder.defineSubtitlesHandler(async (args) => {
    console.log("");
    console.log("==================================");
    console.log("SUBTITLE REQUEST");
    console.log("Type:", args.type);
    console.log("ID:", args.id);
    console.log("==================================");

    if (args.type !== "series") {
        return {
            subtitles: []
        };
    }

    const episode = getEpisode(args.id);

    if (!episode || !subtitles[episode]) {
        return {
            subtitles: []
        };
    }

    const filename = subtitles[episode];

    const subtitleUrl =
        `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}`;

    console.log(
        `Subtitle S04E${episode}: ${subtitleUrl}`
    );

    return {
        subtitles: [
            {
                id: `dragons-rising-s04e${episode}-heb`,
                lang: "heb",
                url: subtitleUrl
            }
        ]
    };
});


// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 7000;

serveHTTP(
    builder.getInterface(),
    {
        port: PORT
    }
);

console.log(
    `Starting Dragons Rising Addon on port ${PORT}`
);