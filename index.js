const {
    addonBuilder,
    serveHTTP
} = require("stremio-addon-sdk");


// ==================================================
// SETTINGS
// ==================================================

const PORT =
    Number(
        process.env.PORT || 7000
    );


const SERIES_IMDB_ID =
    "tt27502465";


const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL ||
    "https://media.thefrozen.online/videos";


const SUBTITLE_BASE_URL =
    "https://raw.githubusercontent.com/imry129-beep/dragons-rising-stremio-addon/main/videos";


const DRIVE_IMAGE_ID =
    "14C3sLDHU_JX94VtkKRGpCwgKcYyiFeH0";


const POSTER_URL =
    `https://drive.google.com/thumbnail?id=${DRIVE_IMAGE_ID}&sz=w500`;


const BACKGROUND_URL =
    `https://drive.google.com/thumbnail?id=${DRIVE_IMAGE_ID}&sz=w1280`;


// ==================================================
// ADDON IDS
// ==================================================

const CATALOG_ID =
    "dragons_rising_hebrew_english";


const META_PREFIX =
    "dragons-rising-hebrew-english-s";


// ==================================================
// MANIFEST
//
// IMPORTANT:
// Keep the same manifest ID if your old index.js
// already used a different one.
// ==================================================

const manifest = {

    id:
        "org.dragons.rising.hebrew.english",

    version:
        "2.9.0",

    name:
        "Dragons Rising Hebrew + English",

    description:
        "Ninjago: Dragons Rising Seasons 2-4. Hebrew and English audio for Seasons 2-3. Season 4 is English only.",

    logo:
        POSTER_URL,

    background:
        BACKGROUND_URL,

    resources: [
        "catalog",
        "meta",
        "stream"
    ],

    types: [
        "series"
    ],

    catalogs: [
        {
            type:
                "series",

            id:
                CATALOG_ID,

            name:
                "Dragons Rising Hebrew + English"
        }
    ],

    behaviorHints: {
        configurable:
            true,

        configurationRequired:
            true
    },

    config: [

        {
            key:
                "audio",

            type:
                "select",

            title:
                "Audio",

            options: [
                "Hebrew",
                "English",
                "Hebrew + English"
            ],

            default:
                "Hebrew + English"
        },

        {
            key:
                "season2",

            type:
                "checkbox",

            title:
                "Season 2",

            default:
                "checked"
        },

        {
            key:
                "season3",

            type:
                "checkbox",

            title:
                "Season 3",

            default:
                "checked"
        },

        {
            key:
                "season4",

            type:
                "checkbox",

            title:
                "Season 4 - English only",

            default:
                "checked"
        }

    ]

};


// ==================================================
// OPTIONAL STREMIO ADDONS SIGNATURE
// ==================================================

if (
    process.env.STREMIO_ADDONS_SIGNATURE
) {

    manifest.stremioAddonsConfig = {

        issuer:
            "https://stremio-addons.net",

        signature:
            process.env.STREMIO_ADDONS_SIGNATURE

    };

}


// ==================================================
// BUILDER
// ==================================================

const builder =
    new addonBuilder(
        manifest
    );


// ==================================================
// CONFIG HELPERS
// ==================================================

function isConfigured(
    config
) {

    return !!(
        config &&
        [
            "Hebrew",
            "English",
            "Hebrew + English"
        ].includes(
            config.audio
        )
    );

}


function checkboxEnabled(
    value
) {

    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        value === "checked" ||
        value === "on"
    );

}


function seasonEnabled(
    config,
    season
) {

    if (
        !isConfigured(
            config
        )
    ) {

        return false;

    }


    return checkboxEnabled(
        config[
            `season${season}`
        ]
    );

}


// ==================================================
// UI LANGUAGE
// ==================================================

function getUILanguage(
    config
) {

    if (
        config?.audio === "Hebrew"
    ) {

        return "he";

    }


    if (
        config?.audio === "English"
    ) {

        return "en";

    }


    return "both";

}


// ==================================================
// AUDIO MODE
//
// SEASON 4 = ALWAYS ENGLISH
// ==================================================

function getAudioMode(
    config,
    season
) {

    // ==============================================
    // SEASON 4
    //
    // English only.
// ==============================================

    if (
        Number(
            season
        ) === 4
    ) {

        return "eng";

    }


    // ==============================================
    // SEASON 2 / 3
    // ==============================================

    if (
        config?.audio === "Hebrew"
    ) {

        return "heb";

    }


    if (
        config?.audio === "English"
    ) {

        return "eng";

    }


    return "both";

}


// ==================================================
// AUDIO DISPLAY NAME
// ==================================================

function getAudioDisplayName(
    config,
    season
) {

    if (
        Number(
            season
        ) === 4
    ) {

        return "English";

    }


    if (
        config?.audio === "Hebrew"
    ) {

        return "Hebrew";

    }


    if (
        config?.audio === "English"
    ) {

        return "English";

    }


    return "Hebrew + English";

}


// ==================================================
// SEASON NAME
// ==================================================

function getSeasonName(
    season,
    config
) {

    const language =
        getUILanguage(
            config
        );


    if (
        language === "he"
    ) {

        if (
            season === 4
        ) {

            return (
                `נינג'גו: עליית הדרקונים — עונה ${season} 🇬🇧`
            );

        }


        return (
            `נינג'גו: עליית הדרקונים — עונה ${season}`
        );

    }


    if (
        language === "en"
    ) {

        if (
            season === 4
        ) {

            return (
                `Ninjago: Dragons Rising — Season ${season} 🇬🇧`
            );

        }


        return (
            `Ninjago: Dragons Rising — Season ${season}`
        );

    }


    if (
        season === 4
    ) {

        return (
            `Dragons Rising — Season ${season} • English Only 🇬🇧`
        );

    }


    return (
        `Dragons Rising — Season ${season} • Hebrew + English`
    );

}


// ==================================================
// SEASON DESCRIPTION
// ==================================================

function getSeasonDescription(
    season,
    config
) {

    const language =
        getUILanguage(
            config
        );


    if (
        season === 4
    ) {

        if (
            language === "he"
        ) {

            return (
                "עונה 4 של נינג'גו: עליית הדרקונים. עונה זו זמינה באנגלית בלבד."
            );

        }


        if (
            language === "en"
        ) {

            return (
                "Season 4 of Ninjago: Dragons Rising. This season is available in English only."
            );

        }


        return (
            "Season 4 of Ninjago: Dragons Rising • English audio only."
        );

    }


    const audio =
        getAudioDisplayName(
            config,
            season
        );


    if (
        language === "he"
    ) {

        return (
            `עונה ${season} של נינג'גו: עליית הדרקונים. שמע: ${audio}.`
        );

    }


    if (
        language === "en"
    ) {

        return (
            `Season ${season} of Ninjago: Dragons Rising. Audio: ${audio}.`
        );

    }


    return (
        `Ninjago: Dragons Rising Season ${season} • Audio: ${audio}`
    );

}


// ==================================================
// FILE NAME
// ==================================================

function getVideoFilename(
    season,
    episode
) {

    const ep =
        String(
            episode
        ).padStart(
            2,
            "0"
        );


    // ==============================================
    // SEASON 2
    // ==============================================

    if (
        season === 2
    ) {

        return (
            `es${ep}s2.mp4`
        );

    }


    // ==============================================
    // SEASON 3
    // ==============================================

    if (
        season === 3
    ) {

        return (
            `es${ep}s3.mp4`
        );

    }


    // ==============================================
    // SEASON 4
    // ==============================================

    if (
        season === 4
    ) {

        if (
            episode === 18
        ) {

            return "output.mkv";

        }


        return (
            `es${ep}.mp4`
        );

    }


    return null;

}


// ==================================================
// VIRTUAL FILENAME
// ==================================================

function getVirtualFilename(
    filename,
    mode
) {

    if (
        mode === "both"
    ) {

        return filename;

    }


    const dot =
        filename.lastIndexOf(
            "."
        );


    const base =
        dot === -1
            ? filename
            : filename.slice(
                0,
                dot
            );


    return (
        `${base}.${mode}.mp4`
    );

}


// ==================================================
// CUSTOM VIDEO ID
// ==================================================

function getVideoId(
    season,
    episode
) {

    return (
        `${META_PREFIX}${season}:${season}:${episode}`
    );

}


// ==================================================
// PARSE VIDEO ID
// ==================================================

function parseVideoId(
    id
) {

    // ==============================================
    // CUSTOM IDs
    //
    // dragons-rising-hebrew-english-s2:2:1
    // ==============================================

    let match =
        /^dragons-rising-hebrew-english-s(\d+):(\d+):(\d+)$/
            .exec(
                id
            );


    if (
        match
    ) {

        const seasonFromMeta =
            Number(
                match[1]
            );


        const season =
            Number(
                match[2]
            );


        const episode =
            Number(
                match[3]
            );


        if (
            seasonFromMeta !== season
        ) {

            return null;

        }


        return {
            season,
            episode
        };

    }


    // ==============================================
    // ALSO SUPPORT STANDARD IMDB EPISODE IDs
    //
    // tt27502465:2:1
    // ==============================================

    match =
        new RegExp(
            `^${SERIES_IMDB_ID}:(\\d+):(\\d+)$`
        )
            .exec(
                id
            );


    if (
        match
    ) {

        return {

            season:
                Number(
                    match[1]
                ),

            episode:
                Number(
                    match[2]
                )

        };

    }


    return null;

}


// ==================================================
// CINEMETA CACHE
// ==================================================

let cinemetaCache =
    null;


let cinemetaCacheTime =
    0;


const CINEMETA_CACHE_MS =
    60 * 60 * 1000;


// ==================================================
// FETCH CINEMETA
// ==================================================

async function getCinemeta() {

    const now =
        Date.now();


    if (
        cinemetaCache &&
        (
            now -
            cinemetaCacheTime
        ) <
        CINEMETA_CACHE_MS
    ) {

        return cinemetaCache;

    }


    try {

        const response =
            await fetch(
                `https://v3-cinemeta.strem.io/meta/series/${SERIES_IMDB_ID}.json`
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Cinemeta HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        cinemetaCache =
            data?.meta || null;


        cinemetaCacheTime =
            now;


        return cinemetaCache;

    }

    catch (
        error
    ) {

        console.error(
            "Cinemeta error:",
            error.message
        );


        return null;

    }

}


// ==================================================
// EPISODE DATA
// ==================================================

async function getEpisodes(
    season
) {

    const meta =
        await getCinemeta();


    const sourceVideos =
        Array.isArray(
            meta?.videos
        )
            ? meta.videos
            : [];


    const episodes =
        sourceVideos
            .filter(
                (
                    video
                ) =>
                    Number(
                        video.season
                    ) === season
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.episode
                    ) -
                    Number(
                        b.episode
                    )
            );


    // ==============================================
    // CINEMETA WORKED
    // ==============================================

    if (
        episodes.length > 0
    ) {

        return episodes.slice(
            0,
            20
        );

    }


    // ==============================================
    // FALLBACK
    // ==============================================

    return Array.from(
        {
            length:
                20
        },
        (
            _,
            index
        ) => {

            const episode =
                index + 1;


            return {

                season:
                    season,

                episode:
                    episode,

                title:
                    `Episode ${episode}`,

                overview:
                    "",

                thumbnail:
                    BACKGROUND_URL

            };

        }
    );

}


// ==================================================
// SUBTITLES
// ==================================================

function getSubtitles(
    season,
    episode
) {

    const ep =
        String(
            episode
        ).padStart(
            2,
            "0"
        );


    const subtitles =
        [];


    // ==============================================
    // SEASON 2
    // Expected English subtitle filenames:
    // es01s2.en.srt ...
    // ==============================================

    if (
        season === 2
    ) {

        subtitles.push({

            id:
                `s2e${episode}-eng`,

            url:
                `${SUBTITLE_BASE_URL}/es${ep}s2.en.srt`,

            lang:
                "eng"

        });

    }


    // ==============================================
    // SEASON 3
    // English subtitles
    // ==============================================

    if (
        season === 3
    ) {

        subtitles.push({

            id:
                `s3e${episode}-eng`,

            url:
                `${SUBTITLE_BASE_URL}/es${ep}s3.en.srt`,

            lang:
                "eng"

        });

    }


    // ==============================================
    // SEASON 4
    //
    // Episodes 1-10 = English
    // Episodes 11-20 = Hebrew
    // ==============================================

    if (
        season === 4
    ) {

        if (
            episode <= 10
        ) {

            subtitles.push({

                id:
                    `s4e${episode}-eng`,

                url:
                    `${SUBTITLE_BASE_URL}/es${ep}.en.srt`,

                lang:
                    "eng"

            });

        }

        else {

            subtitles.push({

                id:
                    `s4e${episode}-heb`,

                url:
                    `${SUBTITLE_BASE_URL}/es${ep}.srt`,

                lang:
                    "heb"

            });

        }

    }


    return subtitles;

}


// ==================================================
// CATALOG HANDLER
// ==================================================

builder.defineCatalogHandler(
    async (
        args
    ) => {

        const {
            type,
            id,
            config = {}
        } =
            args;


        if (
            type !== "series" ||
            id !== CATALOG_ID
        ) {

            return {
                metas: []
            };

        }


        if (
            !isConfigured(
                config
            )
        ) {

            return {
                metas: []
            };

        }


        const metas =
            [];


        for (
            const season
            of [
                2,
                3,
                4
            ]
        ) {

            if (
                !seasonEnabled(
                    config,
                    season
                )
            ) {

                continue;

            }


            metas.push({

                id:
                    `${META_PREFIX}${season}`,

                type:
                    "series",

                name:
                    getSeasonName(
                        season,
                        config
                    ),

                poster:
                    POSTER_URL,

                background:
                    BACKGROUND_URL,

                description:
                    getSeasonDescription(
                        season,
                        config
                    ),

                releaseInfo:
                    "2024-",

                genres: [
                    "Animation",
                    "Action",
                    "Adventure"
                ]

            });

        }


        return {
            metas
        };

    }
);


// ==================================================
// META HANDLER
// ==================================================

builder.defineMetaHandler(
    async (
        args
    ) => {

        const {
            type,
            id,
            config = {}
        } =
            args;


        if (
            type !== "series"
        ) {

            return {
                meta: null
            };

        }


        const match =
            /^dragons-rising-hebrew-english-s(\d+)$/
                .exec(
                    id
                );


        if (
            !match
        ) {

            return {
                meta: null
            };

        }


        const season =
            Number(
                match[1]
            );


        if (
            ![
                2,
                3,
                4
            ].includes(
                season
            )
        ) {

            return {
                meta: null
            };

        }


        if (
            !seasonEnabled(
                config,
                season
            )
        ) {

            return {
                meta: null
            };

        }


        const episodes =
            await getEpisodes(
                season
            );


        const videos =
            episodes.map(
                (
                    episodeData,
                    index
                ) => {

                    const episode =
                        Number(
                            episodeData.episode ||
                            index + 1
                        );


                    return {

                        id:
                            getVideoId(
                                season,
                                episode
                            ),

                        title:
                            episodeData.title ||
                            `Episode ${episode}`,

                        season:
                            season,

                        episode:
                            episode,

                        released:
                            episodeData.released ||
                            undefined,

                        overview:
                            episodeData.overview ||
                            "",

                        thumbnail:
                            episodeData.thumbnail ||
                            BACKGROUND_URL

                    };

                }
            );


        return {

            meta: {

                id:
                    `${META_PREFIX}${season}`,

                type:
                    "series",

                name:
                    getSeasonName(
                        season,
                        config
                    ),

                poster:
                    POSTER_URL,

                background:
                    BACKGROUND_URL,

                description:
                    getSeasonDescription(
                        season,
                        config
                    ),

                releaseInfo:
                    "2024-",

                genres: [
                    "Animation",
                    "Action",
                    "Adventure"
                ],

                videos:
                    videos

                // IMPORTANT:
                // NO defaultVideoId
                // so clicking the season card
                // opens the season instead of
                // instantly playing episode 1.

            }

        };

    }
);


// ==================================================
// STREAM HANDLER
// ==================================================

builder.defineStreamHandler(
    async (
        args
    ) => {

        const {
            type,
            id,
            config = {}
        } =
            args;


        if (
            type !== "series"
        ) {

            return {
                streams: []
            };

        }


        const parsed =
            parseVideoId(
                id
            );


        if (
            !parsed
        ) {

            return {
                streams: []
            };

        }


        const {
            season,
            episode
        } =
            parsed;


        if (
            ![
                2,
                3,
                4
            ].includes(
                season
            )
        ) {

            return {
                streams: []
            };

        }


        if (
            episode < 1 ||
            episode > 20
        ) {

            return {
                streams: []
            };

        }


        if (
            !seasonEnabled(
                config,
                season
            )
        ) {

            return {
                streams: []
            };

        }


        const filename =
            getVideoFilename(
                season,
                episode
            );


        if (
            !filename
        ) {

            return {
                streams: []
            };

        }


        // ==============================================
        // AUDIO
        //
        // S4 ALWAYS -> eng
        // ==============================================

        const mode =
            getAudioMode(
                config,
                season
            );


        const audioName =
            getAudioDisplayName(
                config,
                season
            );


        const url =
            `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}?audio=${mode}`;


        const subtitles =
            getSubtitles(
                season,
                episode
            );


        const streamTitle =
            season === 4
                ? "English 🇬🇧"
                : audioName;


        console.log(
            `STREAM S${season}E${episode} | ${mode} | ${filename}`
        );


        return {

            streams: [

                {

                    name:
                        `Dragons Rising • ${streamTitle}`,

                    title:
                        `Season ${season} Episode ${episode}\n${streamTitle}`,

                    url:
                        url,

                    subtitles:
                        subtitles,

                    behaviorHints: {

                        notWebReady:
                            true,

                        filename:
                            getVirtualFilename(
                                filename,
                                mode
                            ),

                        bingeGroup:
                            `dragons-rising-s${season}-${mode}`

                    }

                }

            ]

        };

    }
);


// ==================================================
// START
// ==================================================

serveHTTP(
    builder.getInterface(),
    {
        port:
            PORT
    }
);


console.log("");
console.log("========================================");
console.log("Dragons Rising Stremio Addon");
console.log("Version: 2.9.0");
console.log(`Port: ${PORT}`);
console.log(`Media: ${MEDIA_BASE_URL}`);
console.log("Season 2: configurable audio");
console.log("Season 3: configurable audio");
console.log("Season 4: ENGLISH ONLY");
console.log("========================================");