const {
    addonBuilder,
    serveHTTP
} = require("stremio-addon-sdk");


// ==========================================
// SETTINGS
// ==========================================

const SERIES_ID = "tt27502465";

const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL ||
    "https://media.thefrozen.online/videos";

const SUBTITLE_BASE_URL =
    "https://raw.githubusercontent.com/imry129-beep/dragons-rising-stremio-addon/main/videos";


// ==========================================
// MANIFEST
// ==========================================

const builder = new addonBuilder({

    id: "com.imry.dragonsrising.hebrew",

    version: "2.0.0",

    name: "Dragons Rising Hebrew",

    description:
        "Ninjago Dragons Rising Seasons 3 and 4",

    stremioAddonsConfig: {

        issuer:
            "https://stremio-addons.net",

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

    // ======================================
    // SEASON 3
    // ======================================

    3: {

        1: "es01s3.mp4",
        2: "es02s3.mp4",
        3: "es03s3.mp4",
        4: "es04s3.mp4",
        5: "es05s3.mp4",
        6: "es06s3.mp4",
        7: "es07s3.mp4",
        8: "es08s3.mp4",
        9: "es09s3.mp4",
        10: "es10s3.mp4",

        11: "es11s3.mp4",
        12: "es12s3.mp4",
        13: "es13s3.mp4",
        14: "es14s3.mp4",
        15: "es15s3.mp4",
        16: "es16s3.mp4",
        17: "es17s3.mp4",
        18: "es18s3.mp4",
        19: "es19s3.mp4",
        20: "es20s3.mp4"

    },


    // ======================================
    // SEASON 4
    // ======================================

    4: {

        1: "es01.mp4",
        2: "es02.mp4",
        3: "es03.mp4",
        4: "es04.mp4",
        5: "es05.mp4",
        6: "es06.mp4",
        7: "es07.mp4",
        8: "es08.mp4",
        9: "es09.mp4",
        10: "es10.mp4",

        11: "es11.mp4",
        12: "es12.mp4",
        13: "es13.mp4",
        14: "es14.mp4",
        15: "es15.mp4",
        16: "es16.mp4",
        17: "es17.mp4",

        // Hebrew + English audio
        18: "output.mkv",

        19: "es19.mp4",
        20: "es20.mp4"

    }

};


// ==========================================
// SUBTITLES
// ==========================================

const subtitleFiles = {

    // ======================================
    // SEASON 3 - ENGLISH
    // ======================================

    3: {

        1: "es01s3.en.srt",
        2: "es02s3.en.srt",
        3: "es03s3.en.srt",
        4: "es04s3.en.srt",
        5: "es05s3.en.srt",
        6: "es06s3.en.srt",
        7: "es07s3.en.srt",
        8: "es08s3.en.srt",
        9: "es09s3.en.srt",
        10: "es10s3.en.srt",

        11: "es11s3.en.srt",
        12: "es12s3.en.srt",
        13: "es13s3.en.srt",
        14: "es14s3.en.srt",
        15: "es15s3.en.srt",
        16: "es16s3.en.srt",
        17: "es17s3.en.srt",
        18: "es18s3.en.srt",
        19: "es19s3.en.srt",
        20: "es20s3.en.srt"

    },


    // ======================================
    // SEASON 4
    // ======================================

    4: {

        // Episodes 1-10 - English

        1: "es01.en.srt",
        2: "es02.en.srt",
        3: "es03.en.srt",
        4: "es04.en.srt",
        5: "es05.en.srt",
        6: "es06.en.srt",
        7: "es07.en.srt",
        8: "es08.en.srt",
        9: "es09.en.srt",
        10: "es10.en.srt",


        // Episodes 11-20 - Hebrew

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

    }

};


// ==========================================
// PARSE EPISODE ID
// ==========================================

function getEpisodeInfo(id) {

    if (!id) {
        return null;
    }

    // Examples:
    //
    // tt27502465:3:1
    // tt27502465:4:11

    const parts = id.split(":");

    if (parts.length < 3) {
        return null;
    }

    const imdbId =
        parts[0];

    const season =
        Number(parts[1]);

    const episode =
        Number(parts[2]);


    if (imdbId !== SERIES_ID) {
        return null;
    }

    if (!Number.isInteger(season)) {
        return null;
    }

    if (!Number.isInteger(episode)) {
        return null;
    }

    if (season !== 3 && season !== 4) {
        return null;
    }

    if (episode < 1 || episode > 20) {
        return null;
    }


    return {
        season,
        episode
    };

}


// ==========================================
// STREAM HANDLER
// ==========================================

builder.defineStreamHandler(
    async (args) => {

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "STREAM REQUEST"
        );

        console.log(
            "Type:",
            args.type
        );

        console.log(
            "ID:",
            args.id
        );

        console.log(
            "========================================"
        );


        if (args.type !== "series") {

            return {
                streams: []
            };

        }


        const info =
            getEpisodeInfo(args.id);


        if (!info) {

            return {
                streams: []
            };

        }


        const {
            season,
            episode
        } = info;


        const seasonEpisodes =
            episodes[season];


        if (!seasonEpisodes) {

            return {
                streams: []
            };

        }


        const filename =
            seasonEpisodes[episode];


        if (!filename) {

            console.log(
                `S${season}E${episode} not available`
            );

            return {
                streams: []
            };

        }


        const videoUrl =
            `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}`;


        const seasonText =
            String(season).padStart(
                2,
                "0"
            );


        const episodeText =
            String(episode).padStart(
                2,
                "0"
            );


        console.log(
            `S${seasonText}E${episodeText}`
        );

        console.log(
            videoUrl
        );


        let title =
            `S${seasonText}E${episodeText} • Dragons Rising`;


        if (
            season === 4 &&
            episode === 18
        ) {

            title =
                "S04E18 • Hebrew + English Audio";

        }


        return {

            streams: [

                {

                    name:
                        "🐉 Dragons Rising",

                    title:
                        title,

                    url:
                        videoUrl

                }

            ]

        };

    }
);


// ==========================================
// SUBTITLES HANDLER
// ==========================================

builder.defineSubtitlesHandler(
    async (args) => {

        console.log("");
        console.log(
            "========================================"
        );

        console.log(
            "SUBTITLE REQUEST"
        );

        console.log(
            "Type:",
            args.type
        );

        console.log(
            "ID:",
            args.id
        );

        console.log(
            "========================================"
        );


        if (args.type !== "series") {

            return {
                subtitles: []
            };

        }


        const info =
            getEpisodeInfo(args.id);


        if (!info) {

            return {
                subtitles: []
            };

        }


        const {
            season,
            episode
        } = info;


        const seasonSubtitles =
            subtitleFiles[season];


        if (!seasonSubtitles) {

            return {
                subtitles: []
            };

        }


        const filename =
            seasonSubtitles[episode];


        if (!filename) {

            return {
                subtitles: []
            };

        }


        const subtitleUrl =
            `${SUBTITLE_BASE_URL}/${encodeURIComponent(filename)}`;


        // ==================================
        // LANGUAGE
        // ==================================
        //
        // Season 3:
        // Episodes 1-20 = English
        //
        // Season 4:
        // Episodes 1-10 = English
        // Episodes 11-20 = Hebrew

        const isEnglish =
            season === 3 ||
            (
                season === 4 &&
                episode >= 1 &&
                episode <= 10
            );


        const language =
            isEnglish
                ? "eng"
                : "heb";


        const languageName =
            isEnglish
                ? "English"
                : "Hebrew";


        const seasonText =
            String(season).padStart(
                2,
                "0"
            );


        const episodeText =
            String(episode).padStart(
                2,
                "0"
            );


        console.log(
            `${languageName} subtitles S${seasonText}E${episodeText}`
        );

        console.log(
            subtitleUrl
        );


        return {

            subtitles: [

                {

                    id:
                        `dragons-rising-s${seasonText}e${episodeText}-${language}`,

                    lang:
                        language,

                    url:
                        subtitleUrl

                }

            ]

        };

    }
);


// ==========================================
// START ADDON
// ==========================================

const PORT =
    process.env.PORT ||
    7000;


serveHTTP(
    builder.getInterface(),
    {
        port: PORT
    }
);


console.log("");
console.log(
    "========================================"
);

console.log(
    "Dragons Rising Addon"
);

console.log(
    `Port: ${PORT}`
);

console.log(
    "Season 3: Episodes 1-20"
);

console.log(
    "Season 3 subtitles: English"
);

console.log(
    "Season 4: Episodes 1-20"
);

console.log(
    "Season 4 Episodes 1-10 subtitles: English"
);

console.log(
    "Season 4 Episodes 11-20 subtitles: Hebrew"
);

console.log(
    `Media: ${MEDIA_BASE_URL}`
);

console.log(
    "========================================"
);