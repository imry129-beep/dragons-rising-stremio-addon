const {
    addonBuilder,
    serveHTTP
} = require("stremio-addon-sdk");

const https = require("https");


// ==========================================
// BASIC SETTINGS
// ==========================================

const SERIES_ID =
    "tt27502465";

const CATALOG_ID =
    "dragons_rising_hebrew_english";

const META_PREFIX =
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
// ADDON
// ==========================================

const builder = new addonBuilder({

    id:
        "com.imry.dragonsrising.hebrew",

    version:
        "2.5.0",

    name:
        "Dragons Rising Hebrew+English",

    description:
        "Configure the addon first, then choose audio language and seasons.",

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
            true

    },


    config: [

        {
            key:
                "audio",

            type:
                "select",

            title:
                "Audio language",

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
    // ADDONS CONFIG
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
                META_PREFIX
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
                META_PREFIX
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
                META_PREFIX
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

function trueish(value) {

    return (

        value === true ||

        value === 1 ||

        value === "1" ||

        value === "true" ||

        value === "checked" ||

        value === "on"

    );

}


// ==========================================
// CHECK IF USER CONFIGURED ADDON
// ==========================================

function isConfigured(config) {

    return !!(

        config &&

        typeof config.audio === "string" &&

        config.audio.length > 0

    );

}


// ==========================================
// SEASON ENABLED
//
// IMPORTANT FIX:
//
// If configured:
// unchecked checkbox = FALSE
//
// Before:
// undefined was treated as TRUE
// ==========================================

function seasonEnabled(
    config,
    season
) {

    // Only fallback to all seasons if
    // there is actually no configuration.

    if (
        !isConfigured(config)
    ) {

        return true;

    }


    return trueish(
        config[
            `season${season}`
        ]
    );

}


// ==========================================
// AUDIO SETTING
// ==========================================

function getAudio(config) {

    const value =
        config &&
        config.audio;


    if (
        value === "Hebrew" ||
        value === "English" ||
        value === "Hebrew + English"
    ) {

        return value;

    }


    return (
        "Hebrew + English"
    );

}


// ==========================================
// DESCRIPTION BY LANGUAGE
// ==========================================

function getSeasonDescription(
    season,
    config
) {

    const audio =
        getAudio(
            config
        );


    // ======================================
    // HEBREW
    // ======================================

    if (
        audio === "Hebrew"
    ) {

        return (
            `נינג'גו: עליית הדרקונים — עונה ${season}. שמע בעברית.`
        );

    }


    // ======================================
    // ENGLISH
    // ======================================

    if (
        audio === "English"
    ) {

        return (
            `Ninjago: Dragons Rising — Season ${season}. English audio.`
        );

    }


    // ======================================
    // BOTH
    // ======================================

    return (
        `נינג'גו: עליית הדרקונים / Ninjago: Dragons Rising — עונה ${season} / Season ${season}. שמע בעברית ובאנגלית / Hebrew + English audio.`
    );

}


// ==========================================
// EPISODE DESCRIPTION
// ==========================================

function getEpisodeOverview(
    sourceOverview,
    season,
    episode,
    config
) {

    const audio =
        getAudio(
            config
        );


    // ======================================
    // HEBREW
    // ======================================

    if (
        audio === "Hebrew"
    ) {

        return (
            `פרק ${episode} בעונה ${season} של נינג'גו: עליית הדרקונים.`
        );

    }


    // ======================================
    // ENGLISH
    // ======================================

    if (
        audio === "English"
    ) {

        return (

            sourceOverview ||

            `Episode ${episode} of Ninjago: Dragons Rising Season ${season}.`

        );

    }


    // ======================================
    // BOTH
    // ======================================

    return (

        sourceOverview ||

        `פרק ${episode} / Episode ${episode} — Ninjago: Dragons Rising Season ${season}.`

    );

}


// ==========================================
// HELPERS
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
        `${META_PREFIX}${season}`
    );

}


// ==========================================
// VIDEO FILE
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
// SUBTITLES
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
                "eng"

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
                "eng"

        };

    }


    // ======================================
    // SEASON 4 E01-E10
    // ======================================

    if (
        season === 4 &&
        episode <= 10
    ) {

        return {

            filename:
                `es${ep}.en.srt`,

            lang:
                "eng"

        };

    }


    // ======================================
    // SEASON 4 E11-E20
    // ======================================

    if (
        season === 4
    ) {

        return {

            filename:
                `es${ep}.srt`,

            lang:
                "heb"

        };

    }


    return null;

}


// ==========================================
// CREATE STREAM
// ==========================================

function makeStream(
    season,
    episode,
    config
) {

    const filename =
        getVideoFilename(
            season,
            episode
        );


    if (
        !filename
    ) {

        return null;

    }


    const audio =
        getAudio(
            config
        );


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


    let name;

    let title;


    // ======================================
    // HEBREW
    // ======================================

    if (
        audio === "Hebrew"
    ) {

        name =
            "🇮🇱 עברית";

        title =
            `עונה ${seasonText} פרק ${episodeText} • עברית`;

    }


    // ======================================
    // ENGLISH
    // ======================================

    else if (
        audio === "English"
    ) {

        name =
            "🇺🇸 English";

        title =
            `S${seasonText}E${episodeText} • English`;

    }


    // ======================================
    // BOTH
    // ======================================

    else {

        name =
            "🇮🇱🇺🇸 Hebrew + English";

        title =
            `S${seasonText}E${episodeText} • Hebrew + English`;

    }


    return {

        name:
            name,

        title:
            title,

        url:
            `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}`,


        // ==================================
        // KEEP THIS
        //
        // THIS IS WHAT FIXED
        // MULTIPLE AUDIO TRACKS
        // ==================================

        behaviorHints: {

            notWebReady:
                true,

            filename:
                filename,

            bingeGroup:
                `dragons-rising-s${season}-${audio
                    .toLowerCase()
                    .replace(
                        /[^a-z]+/g,
                        "-"
                    )}`

        }

    };

}


// ==========================================
// VIDEO ID PARSER
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
    // NORMAL CINEMETA
    //
    // tt27502465:2:11
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
    // CUSTOM CATALOG
    //
    // dragons-rising-hebrew-english-s2:2:11
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


    return (

        match

            ? Number(
                match[1]
            )

            : null

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
// HTTP JSON
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

                (
                    response
                ) => {


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

                        (
                            chunk
                        ) => {

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
// GET CINEMETA
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
    season,
    config
) {

    const metaId =
        getSeasonMetaId(
            season
        );


    const year = {

        2:
            2024,

        3:
            2025,

        4:
            2026

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


            const stream =
                makeStream(
                    season,
                    episode,
                    config
                );


            return {

                id:
                    `${metaId}:${season}:${episode}`,


                title:
                    getAudio(config) === "Hebrew"

                        ? `פרק ${episode}`

                        : `Episode ${episode}`,


                released:
                    new Date(

                        Date.UTC(
                            year,
                            0,
                            episode
                        )

                    ).toISOString(),


                season:
                    season,


                episode:
                    episode,


                overview:
                    getEpisodeOverview(
                        "",
                        season,
                        episode,
                        config
                    ),


                // ==================================
                // STREAM DIRECTLY INSIDE EPISODE
                // ==================================

                streams:

                    stream

                        ? [
                            stream
                        ]

                        : [],


                available:
                    true

            };

        }

    );

}


// ==========================================
// GET EPISODES
// ==========================================

async function getSeasonVideos(
    season,
    config
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


        const videos =
            sourceVideos


                // ==================================
                // ONLY CORRECT SEASON
                // ==================================

                .filter(

                    (
                        video
                    ) => {

                        return (

                            Number(
                                video.season
                            ) === season &&

                            Number(
                                video.episode
                            ) >= 1 &&

                            Number(
                                video.episode
                            ) <= 20

                        );

                    }

                )


                // ==================================
                // SORT
                // ==================================

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


                // ==================================
                // CREATE OUR EPISODES
                // ==================================

                .map(

                    (
                        video
                    ) => {

                        const episode =
                            Number(
                                video.episode
                            );


                        const stream =
                            makeStream(
                                season,
                                episode,
                                config
                            );


                        return {

                            id:
                                `${metaId}:${season}:${episode}`,


                            title:

                                getAudio(config) === "Hebrew"

                                    ? `פרק ${episode}`

                                    : (
                                        video.title ||
                                        `Episode ${episode}`
                                    ),


                            released:

                                video.released ||

                                new Date()
                                    .toISOString(),


                            season:
                                season,


                            episode:
                                episode,


                            overview:
                                getEpisodeOverview(

                                    video.overview,

                                    season,

                                    episode,

                                    config

                                ),


                            thumbnail:
                                video.thumbnail,


                            // ==================================
                            // IMPORTANT FIX
                            //
                            // STREAM IS PROVIDED HERE
                            // SO "NO STREAMS WERE FOUND"
                            // SHOULD NOT HAPPEN
                            // ==================================

                            streams:

                                stream

                                    ? [
                                        stream
                                    ]

                                    : [],


                            available:
                                true

                        };

                    }

                );


        if (
            videos.length > 0
        ) {

            return (
                videos
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
            season,
            config
        )
    );

}


// ==========================================
// CATALOG
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

                metas:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        const metas =
            [];


        // ======================================
        // ONLY ADD SELECTED SEASONS
        // ======================================

        for (
            const season of [
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
                    getSeasonMetaId(
                        season
                    ),

                type:
                    "series",

                name:
                    `Season ${season}`,

                poster:
                    POSTER_URL,

                posterShape:
                    "poster",

                description:
                    getSeasonDescription(
                        season,
                        config
                    )

            });

        }


        return {

            metas:
                metas,

            // Do not keep old config catalog cached

            cacheMaxAge:
                0

        };

    }

);


// ==========================================
// META
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
                    null,

                cacheMaxAge:
                    0

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
                    null,

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        // ======================================
        // BLOCK DISABLED SEASON
        // ======================================

        if (
            !seasonEnabled(
                config,
                season
            )
        ) {

            return {

                meta:
                    null,

                cacheMaxAge:
                    0

            };

        }


        const videos =
            await getSeasonVideos(
                season,
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
                    getSeasonDescription(
                        season,
                        config
                    ),

                videos:
                    videos,


                // ==================================
                // OPEN FIRST EPISODE BY DEFAULT
                // ==================================

                behaviorHints: {

                    defaultVideoId:

                        videos.length

                            ? videos[0].id

                            : undefined

                }

            },


            cacheMaxAge:
                0

        };

    }

);


// ==========================================
// STREAM
// ==========================================

builder.defineStreamHandler(

    async (
        args
    ) => {


        if (
            args.type !== "series"
        ) {

            return {

                streams:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        const info =
            getEpisodeInfo(
                args.id
            );


        if (
            !info
        ) {

            return {

                streams:
                    [],

                cacheMaxAge:
                    0

            };

        }


        // ======================================
        // BLOCK DISABLED SEASON
        // ======================================

        if (
            !seasonEnabled(
                config,
                info.season
            )
        ) {

            return {

                streams:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const stream =
            makeStream(

                info.season,

                info.episode,

                config

            );


        return {

            streams:

                stream

                    ? [
                        stream
                    ]

                    : [],


            cacheMaxAge:
                0

        };

    }

);


// ==========================================
// SUBTITLES
// ==========================================

builder.defineSubtitlesHandler(

    async (
        args
    ) => {


        if (
            args.type !== "series"
        ) {

            return {

                subtitles:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        const info =
            getEpisodeInfo(
                args.id
            );


        if (
            !info
        ) {

            return {

                subtitles:
                    [],

                cacheMaxAge:
                    0

            };

        }


        if (
            !seasonEnabled(
                config,
                info.season
            )
        ) {

            return {

                subtitles:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const subtitle =
            getSubtitleInfo(

                info.season,

                info.episode

            );


        if (
            !subtitle
        ) {

            return {

                subtitles:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const seasonText =
            String(
                info.season
            ).padStart(
                2,
                "0"
            );


        const episodeText =
            String(
                info.episode
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
                        `${SUBTITLE_BASE_URL}/${encodeURIComponent(subtitle.filename)}`

                }

            ],


            cacheMaxAge:
                0

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
            PORT,

        cacheMaxAge:
            0

    }

);


// ==========================================
// LOG
// ==========================================

console.log("");

console.log(
    "========================================"
);

console.log(
    "Dragons Rising Hebrew+English"
);

console.log(
    "Version: 2.5.0"
);

console.log(
    `Port: ${PORT}`
);

console.log(
    "Configure required: YES"
);

console.log(
    "Season filtering: FIXED"
);

console.log(
    "Custom episode streams: EMBEDDED"
);

console.log(
    "Dynamic descriptions: ENABLED"
);

console.log(
    "notWebReady: ENABLED"
);

console.log(
    `Media: ${MEDIA_BASE_URL}`
);

console.log(
    "========================================"
);