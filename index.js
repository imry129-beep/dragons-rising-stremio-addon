const {
    addonBuilder,
    serveHTTP
} = require("stremio-addon-sdk");

const https = require("https");


// ==========================================
// SETTINGS
// ==========================================

const SERIES_ID =
    "tt27502465";

const CATALOG_ID =
    "dragons_rising_hebrew_english";

const CUSTOM_META_PREFIX =
    "dragons-rising-hebrew-english-s";


// ==========================================
// IMAGE
// ==========================================

const DRIVE_IMAGE_ID =
    "14C3sLDHU_JX94VtkKRGpCwgKcYyiFeH0";

const POSTER_URL =
    `https://drive.google.com/thumbnail?id=${DRIVE_IMAGE_ID}&sz=w500`;

const BACKGROUND_URL =
    `https://drive.google.com/thumbnail?id=${DRIVE_IMAGE_ID}&sz=w1280`;


// ==========================================
// MEDIA
// ==========================================

const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL ||
    "https://media.thefrozen.online/videos";

const SUBTITLE_BASE_URL =
    "https://raw.githubusercontent.com/imry129-beep/dragons-rising-stremio-addon/main/videos";


// ==========================================
// CINEMETA
// ==========================================

const CINEMETA_URL =
    `https://v3-cinemeta.strem.io/meta/series/${SERIES_ID}.json`;


// ==========================================
// ADDON MANIFEST
// ==========================================

const builder = new addonBuilder({

    id:
        "com.imry.dragonsrising.hebrew",

    version:
        "2.4.0",

    name:
        "Dragons Rising Hebrew+English",

    description:
        "Ninjago Dragons Rising Seasons 2, 3 and 4 with Hebrew and English audio",

    logo:
        POSTER_URL,

    background:
        BACKGROUND_URL,


    // ======================================
    // CONFIGURE
    // ======================================

    behaviorHints: {

        configurable:
            true,

        configurationRequired:
            false

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

                "Hebrew + English",

                "Hebrew",

                "English"

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
                "Show Season 2",

            default:
                "checked"

        },


        {

            key:
                "season3",

            type:
                "checkbox",

            title:
                "Show Season 3",

            default:
                "checked"

        },


        {

            key:
                "season4",

            type:
                "checkbox",

            title:
                "Show Season 4",

            default:
                "checked"

        }

    ],


    // ======================================
    // STREMIO ADDONS CONFIG
    // ======================================

    stremioAddonsConfig: {

        issuer:
            "https://stremio-addons.net",

        signature:
            "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..KKuyge6O2pYREL_nCNONeg.GPYOwVdXYiFKFK6wEmmQZ4MP5tGFsdGy34aDUqdJSCwadOyJ2Ah-v2Mt1ey26P9_Z1KM7iRhVgVBeV7Ww4tKdidOajrL_FXTNd97eHAINAtWKD3RVRhXDpz1HOvGo_4z.mTUVI6a4yfuH6HQJt04lqg"

    },


    // ======================================
    // RESOURCES
    // ======================================

    resources: [

        "catalog",

        {

            name:
                "meta",

            types: [
                "series"
            ],

            idPrefixes: [
                CUSTOM_META_PREFIX
            ]

        },

        {

            name:
                "stream",

            types: [
                "series"
            ],

            idPrefixes: [

                SERIES_ID,

                CUSTOM_META_PREFIX

            ]

        },

        {

            name:
                "subtitles",

            types: [
                "series"
            ],

            idPrefixes: [

                SERIES_ID,

                CUSTOM_META_PREFIX

            ]

        }

    ],


    types: [
        "series"
    ],


    // ======================================
    // CATALOG
    // ======================================

    catalogs: [

        {

            type:
                "series",

            id:
                CATALOG_ID,

            name:
                "Dragons Rising Hebrew+English"

        }

    ]

});


// ==========================================
// CONFIG HELPERS
// ==========================================

function checkboxEnabled(
    config,
    key
) {

    // If no config was supplied,
    // keep the season enabled.

    if (
        !config ||
        config[key] === undefined ||
        config[key] === null
    ) {

        return true;

    }


    const value =
        config[key];


    if (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        value === "checked" ||
        value === "on"
    ) {

        return true;

    }


    return false;

}


function getAudioPreference(
    config
) {

    if (
        !config ||
        !config.audio
    ) {

        return (
            "Hebrew + English"
        );

    }


    if (
        config.audio === "Hebrew"
    ) {

        return (
            "Hebrew"
        );

    }


    if (
        config.audio === "English"
    ) {

        return (
            "English"
        );

    }


    return (
        "Hebrew + English"
    );

}


function getAudioDisplay(
    config
) {

    const audio =
        getAudioPreference(
            config
        );


    if (
        audio === "Hebrew"
    ) {

        return (
            "🇮🇱 Hebrew"
        );

    }


    if (
        audio === "English"
    ) {

        return (
            "🇺🇸 English"
        );

    }


    return (
        "🇮🇱🇺🇸 Hebrew + English"
    );

}


// ==========================================
// GENERAL HELPERS
// ==========================================

function padEpisode(
    episode
) {

    return String(
        episode
    ).padStart(
        2,
        "0"
    );

}


function getSeasonMetaId(
    season
) {

    return (
        `${CUSTOM_META_PREFIX}${season}`
    );

}


// ==========================================
// VIDEO FILES
// ==========================================

function getVideoFilename(
    season,
    episode
) {

    const ep =
        padEpisode(
            episode
        );


    // ======================================
    // SEASON 2
    // ======================================

    if (
        season === 2
    ) {

        return (
            `es${ep}s2.mp4`
        );

    }


    // ======================================
    // SEASON 3
    // ======================================

    if (
        season === 3
    ) {

        return (
            `es${ep}s3.mp4`
        );

    }


    // ======================================
    // SEASON 4
    // ======================================

    if (
        season === 4
    ) {

        if (
            episode === 18
        ) {

            return (
                "output.mkv"
            );

        }


        return (
            `es${ep}.mp4`
        );

    }


    return null;

}


// ==========================================
// SUBTITLE FILES
// ==========================================

function getSubtitleInfo(
    season,
    episode
) {

    const ep =
        padEpisode(
            episode
        );


    // ======================================
    // SEASON 2
    // ======================================

    if (
        season === 2
    ) {

        return {

            filename:
                `es${ep}s2.en.srt`,

            lang:
                "eng",

            name:
                "English"

        };

    }


    // ======================================
    // SEASON 3
    // ======================================

    if (
        season === 3
    ) {

        return {

            filename:
                `es${ep}s3.en.srt`,

            lang:
                "eng",

            name:
                "English"

        };

    }


    // ======================================
    // SEASON 4
    // ======================================

    if (
        season === 4
    ) {


        // E01 - E10
        // English subtitles

        if (
            episode <= 10
        ) {

            return {

                filename:
                    `es${ep}.en.srt`,

                lang:
                    "eng",

                name:
                    "English"

            };

        }


        // E11 - E20
        // Hebrew subtitles

        return {

            filename:
                `es${ep}.srt`,

            lang:
                "heb",

            name:
                "Hebrew"

        };

    }


    return null;

}


// ==========================================
// EPISODE ID PARSER
// ==========================================

function getEpisodeInfo(
    id
) {

    if (
        !id
    ) {

        return null;

    }


    // ======================================
    // NORMAL IMDB ID
    //
    // tt27502465:2:1
    // ======================================

    const imdbMatch =
        id.match(
            /^tt27502465:(2|3|4):(\d+)$/
        );


    if (
        imdbMatch
    ) {

        const season =
            Number(
                imdbMatch[1]
            );


        const episode =
            Number(
                imdbMatch[2]
            );


        if (
            episode < 1 ||
            episode > 20
        ) {

            return null;

        }


        return {

            season,
            episode

        };

    }


    // ======================================
    // CUSTOM CATALOG ID
    //
    // dragons-rising-hebrew-english-s2:2:1
    // ======================================

    const customMatch =
        id.match(
            /^dragons-rising-hebrew-english-s(2|3|4):(2|3|4):(\d+)$/
        );


    if (
        customMatch
    ) {

        const metaSeason =
            Number(
                customMatch[1]
            );


        const season =
            Number(
                customMatch[2]
            );


        const episode =
            Number(
                customMatch[3]
            );


        if (
            metaSeason !== season
        ) {

            return null;

        }


        if (
            episode < 1 ||
            episode > 20
        ) {

            return null;

        }


        return {

            season,
            episode

        };

    }


    return null;

}


// ==========================================
// META ID PARSER
// ==========================================

function getSeasonFromMetaId(
    id
) {

    if (
        !id
    ) {

        return null;

    }


    const match =
        id.match(
            /^dragons-rising-hebrew-english-s(2|3|4)$/
        );


    if (
        !match
    ) {

        return null;

    }


    return Number(
        match[1]
    );

}


// ==========================================
// CINEMETA CACHE
// ==========================================

let cinemetaCache =
    null;

let cinemetaCacheTime =
    0;


// ==========================================
// GET JSON
// ==========================================

function getJson(
    url
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            https.get(

                url,

                (response) => {


                    // ==================================
                    // REDIRECT
                    // ==================================

                    if (

                        response.statusCode >= 300 &&

                        response.statusCode < 400 &&

                        response.headers.location

                    ) {

                        response.resume();


                        return getJson(
                            response.headers.location
                        )
                            .then(
                                resolve
                            )
                            .catch(
                                reject
                            );

                    }


                    // ==================================
                    // ERROR
                    // ==================================

                    if (
                        response.statusCode !== 200
                    ) {

                        response.resume();


                        return reject(

                            new Error(
                                `HTTP ${response.statusCode}`
                            )

                        );

                    }


                    let data =
                        "";


                    response.setEncoding(
                        "utf8"
                    );


                    response.on(

                        "data",

                        (chunk) => {

                            data +=
                                chunk;

                        }

                    );


                    response.on(

                        "end",

                        () => {

                            try {

                                resolve(

                                    JSON.parse(
                                        data
                                    )

                                );

                            }

                            catch (
                                error
                            ) {

                                reject(
                                    error
                                );

                            }

                        }

                    );

                }

            )
                .on(
                    "error",
                    reject
                );

        }

    );

}


// ==========================================
// CINEMETA META
// ==========================================

async function getCinemetaMeta() {

    const now =
        Date.now();


    if (

        cinemetaCache &&

        now - cinemetaCacheTime <
        30 * 60 * 1000

    ) {

        return (
            cinemetaCache
        );

    }


    const data =
        await getJson(
            CINEMETA_URL
        );


    if (
        !data ||
        !data.meta
    ) {

        throw new Error(
            "Cinemeta returned no meta"
        );

    }


    cinemetaCache =
        data.meta;


    cinemetaCacheTime =
        now;


    return (
        cinemetaCache
    );

}


// ==========================================
// FALLBACK EPISODES
// ==========================================

function createFallbackVideos(
    season
) {

    const metaId =
        getSeasonMetaId(
            season
        );


    const fallbackYear = {

        2: 2024,

        3: 2025,

        4: 2026

    }[season];


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

                id:
                    `${metaId}:${season}:${episode}`,

                title:
                    `Episode ${episode}`,

                released:
                    new Date(

                        Date.UTC(

                            fallbackYear,

                            0,

                            episode

                        )

                    ).toISOString(),

                season:
                    season,

                episode:
                    episode,

                available:
                    true

            };

        }

    );

}


// ==========================================
// GET SEASON VIDEOS
// ==========================================

async function getSeasonVideos(
    season
) {

    const metaId =
        getSeasonMetaId(
            season
        );


    try {

        const cinemeta =
            await getCinemetaMeta();


        const sourceVideos =
            Array.isArray(
                cinemeta.videos
            )
                ? cinemeta.videos
                : [];


        const seasonVideos =
            sourceVideos

                .filter(

                    (video) => {

                        const videoSeason =
                            Number(
                                video.season
                            );


                        const videoEpisode =
                            Number(
                                video.episode
                            );


                        return (

                            videoSeason === season &&

                            videoEpisode >= 1 &&

                            videoEpisode <= 20

                        );

                    }

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

                )

                .map(

                    (video) => {

                        const episode =
                            Number(
                                video.episode
                            );


                        return {

                            id:
                                `${metaId}:${season}:${episode}`,

                            title:
                                video.title ||
                                `Episode ${episode}`,

                            released:
                                video.released ||
                                new Date().toISOString(),

                            season:
                                season,

                            episode:
                                episode,

                            overview:
                                video.overview ||
                                "",

                            thumbnail:
                                video.thumbnail,

                            available:
                                true

                        };

                    }

                );


        if (
            seasonVideos.length > 0
        ) {

            return (
                seasonVideos
            );

        }

    }

    catch (
        error
    ) {

        console.error(

            "Cinemeta metadata error:",

            error.message

        );

    }


    return (
        createFallbackVideos(
            season
        )
    );

}


// ==========================================
// CATALOG HANDLER
// ==========================================

builder.defineCatalogHandler(

    async (
        args
    ) => {

        if (

            args.type !== "series" ||

            args.id !== CATALOG_ID

        ) {

            return {

                metas: []

            };

        }


        const config =
            args.config ||
            {};


        const audio =
            getAudioPreference(
                config
            );


        const metas =
            [];


        // ======================================
        // SEASON 2
        // ======================================

        if (
            checkboxEnabled(
                config,
                "season2"
            )
        ) {

            metas.push({

                id:
                    getSeasonMetaId(
                        2
                    ),

                type:
                    "series",

                name:
                    "Season 2",

                poster:
                    POSTER_URL,

                posterShape:
                    "poster",

                description:
                    `Dragons Rising Season 2 • ${audio}`

            });

        }


        // ======================================
        // SEASON 3
        // ======================================

        if (
            checkboxEnabled(
                config,
                "season3"
            )
        ) {

            metas.push({

                id:
                    getSeasonMetaId(
                        3
                    ),

                type:
                    "series",

                name:
                    "Season 3",

                poster:
                    POSTER_URL,

                posterShape:
                    "poster",

                description:
                    `Dragons Rising Season 3 • ${audio}`

            });

        }


        // ======================================
        // SEASON 4
        // ======================================

        if (
            checkboxEnabled(
                config,
                "season4"
            )
        ) {

            metas.push({

                id:
                    getSeasonMetaId(
                        4
                    ),

                type:
                    "series",

                name:
                    "Season 4",

                poster:
                    POSTER_URL,

                posterShape:
                    "poster",

                description:
                    `Dragons Rising Season 4 • ${audio}`

            });

        }


        return {

            metas:
                metas

        };

    }

);


// ==========================================
// META HANDLER
// ==========================================

builder.defineMetaHandler(

    async (
        args
    ) => {

        if (
            args.type !== "series"
        ) {

            return {

                meta:
                    null

            };

        }


        const season =
            getSeasonFromMetaId(
                args.id
            );


        if (
            !season
        ) {

            return {

                meta:
                    null

            };

        }


        const config =
            args.config ||
            {};


        if (

            season === 2 &&

            !checkboxEnabled(
                config,
                "season2"
            )

        ) {

            return {

                meta:
                    null

            };

        }


        if (

            season === 3 &&

            !checkboxEnabled(
                config,
                "season3"
            )

        ) {

            return {

                meta:
                    null

            };

        }


        if (

            season === 4 &&

            !checkboxEnabled(
                config,
                "season4"
            )

        ) {

            return {

                meta:
                    null

            };

        }


        const videos =
            await getSeasonVideos(
                season
            );


        const audio =
            getAudioPreference(
                config
            );


        return {

            meta: {

                id:
                    getSeasonMetaId(
                        season
                    ),

                type:
                    "series",

                name:
                    `Dragons Rising Hebrew+English - Season ${season}`,

                poster:
                    POSTER_URL,

                posterShape:
                    "poster",

                background:
                    BACKGROUND_URL,

                description:
                    `Ninjago: Dragons Rising Season ${season} • Audio preference: ${audio}`,

                videos:
                    videos

            }

        };

    }

);


// ==========================================
// STREAM HANDLER
// ==========================================

builder.defineStreamHandler(

    async (
        args
    ) => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "STREAM REQUEST"
        );

        console.log(
            "ID:",
            args.id
        );


        const config =
            args.config ||
            {};


        const audioPreference =
            getAudioPreference(
                config
            );


        console.log(
            "Audio preference:",
            audioPreference
        );


        const info =
            getEpisodeInfo(
                args.id
            );


        if (
            !info
        ) {

            return {

                streams:
                    []

            };

        }


        const {
            season,
            episode
        } =
            info;


        // ======================================
        // DISABLED SEASON
        // ======================================

        if (

            season === 2 &&

            !checkboxEnabled(
                config,
                "season2"
            )

        ) {

            return {

                streams:
                    []

            };

        }


        if (

            season === 3 &&

            !checkboxEnabled(
                config,
                "season3"
            )

        ) {

            return {

                streams:
                    []

            };

        }


        if (

            season === 4 &&

            !checkboxEnabled(
                config,
                "season4"
            )

        ) {

            return {

                streams:
                    []

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

                streams:
                    []

            };

        }


        const videoUrl =
            `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}`;


        const seasonText =
            String(
                season
            ).padStart(
                2,
                "0"
            );


        const episodeText =
            String(
                episode
            ).padStart(
                2,
                "0"
            );


        const audioDisplay =
            getAudioDisplay(
                config
            );


        // ======================================
        // STREAM
        // ======================================

        return {

            streams: [

                {

                    name:
                        audioDisplay,

                    title:
                        `S${seasonText}E${episodeText} • ${audioPreference}`,

                    description:
                        `Dragons Rising • ${audioPreference}`,

                    url:
                        videoUrl,


                    // ==================================
                    // IMPORTANT:
                    // KEEP THIS - IT FIXED AUDIO TRACKS
                    // ==================================

                    behaviorHints: {

                        notWebReady:
                            true,

                        filename:
                            filename,

                        bingeGroup:
                            `dragons-rising-${audioPreference
                                .toLowerCase()
                                .replace(/[^a-z]+/g, "-")}`

                    }

                }

            ]

        };

    }

);


// ==========================================
// SUBTITLES HANDLER
// ==========================================

builder.defineSubtitlesHandler(

    async (
        args
    ) => {

        const info =
            getEpisodeInfo(
                args.id
            );


        if (
            !info
        ) {

            return {

                subtitles:
                    []

            };

        }


        const {
            season,
            episode
        } =
            info;


        const subtitle =
            getSubtitleInfo(

                season,

                episode

            );


        if (
            !subtitle
        ) {

            return {

                subtitles:
                    []

            };

        }


        const subtitleUrl =
            `${SUBTITLE_BASE_URL}/${encodeURIComponent(subtitle.filename)}`;


        const seasonText =
            String(
                season
            ).padStart(
                2,
                "0"
            );


        const episodeText =
            String(
                episode
            ).padStart(
                2,
                "0"
            );


        return {

            subtitles: [

                {

                    id:
                        `dragons-rising-s${seasonText}e${episodeText}-${subtitle.lang}`,

                    lang:
                        subtitle.lang,

                    url:
                        subtitleUrl

                }

            ]

        };

    }

);


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT ||
    7000;


serveHTTP(

    builder.getInterface(),

    {

        port:
            PORT

    }

);


// ==========================================
// STARTUP LOG
// ==========================================

console.log("");

console.log(
    "========================================"
);

console.log(
    "Dragons Rising Hebrew+English"
);

console.log(
    "Version: 2.4.0"
);

console.log(
    `Port: ${PORT}`
);

console.log(
    "Configure: ENABLED"
);

console.log(
    "Audio options:"
);

console.log(
    "- Hebrew + English"
);

console.log(
    "- Hebrew"
);

console.log(
    "- English"
);

console.log(
    "Season selection: ENABLED"
);

console.log(
    "Multiple audio track support: ENABLED"
);

console.log(
    `Media: ${MEDIA_BASE_URL}`
);

console.log(
    "========================================"
);