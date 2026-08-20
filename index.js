const {
    addonBuilder,
    serveHTTP
} = require("stremio-addon-sdk");

const https =
    require("https");


// ==========================================
// SETTINGS
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

const CINEMETA_URL =
    `https://v3-cinemeta.strem.io/meta/series/${SERIES_ID}.json`;


// ==========================================
// ADDON
// ==========================================

const builder =
    new addonBuilder({

        id:
            "com.imry.dragonsrising.hebrew",

        version:
            "2.7.0",

        name:
            "Dragons Rising Hebrew+English",

        description:
            "Choose audio language and seasons before installing.",

        logo:
            POSTER_URL,

        background:
            BACKGROUND_URL,


        // ==================================
        // CONFIGURE REQUIRED
        // ==================================

        behaviorHints: {

            configurable:
                true,

            configurationRequired:
                true

        },


        // ==================================
        // CONFIGURE
        // ==================================

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
                    "Season 4",

                default:
                    "checked"

            }

        ],


        // ==================================
        // STREMIO ADDONS CONFIG
        // ==================================

        stremioAddonsConfig: {

            issuer:
                "https://stremio-addons.net",

            signature:
                "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..KKuyge6O2pYREL_nCNONeg.GPYOwVdXYiFKFK6wEmmQZ4MP5tGFsdGy34aDUqdJSCwadOyJ2Ah-v2Mt1ey26P9_Z1KM7iRhVgVBeV7Ww4tKdidOajrL_FXTNd97eHAINAtWKD3RVRhXDpz1HOvGo_4z.mTUVI6a4yfuH6HQJt04lqg"

        },


        // ==================================
        // RESOURCES
        // ==================================

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


        // ==================================
        // CATALOG
        // ==================================

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
// CONFIGURED?
// ==========================================

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


// ==========================================
// CHECKBOX
// ==========================================

function trueish(
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


// ==========================================
// SEASON ENABLED
// ==========================================

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


    return trueish(

        config[
            `season${season}`
        ]

    );

}


// ==========================================
// AUDIO
// ==========================================

function getAudio(
    config
) {

    if (
        !isConfigured(
            config
        )
    ) {

        return null;

    }


    return config.audio;

}


// ==========================================
// AUDIO MODE
//
// Hebrew           -> heb
// English          -> eng
// Hebrew + English -> both
// ==========================================

function getAudioMode(
    config
) {

    const audio =
        getAudio(
            config
        );


    if (
        audio === "Hebrew"
    ) {

        return "heb";

    }


    if (
        audio === "English"
    ) {

        return "eng";

    }


    return "both";

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
// ORIGINAL VIDEO FILE
// ==========================================

function getOriginalVideoFilename(
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

            return "output.mkv";

        }


        return (
            `es${ep}.mp4`
        );

    }


    return null;

}


// ==========================================
// VIRTUAL FILENAME
//
// Example:
//
// es01s2.mp4
// es01s2.heb.mp4
// es01s2.eng.mp4
// ==========================================

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


    if (
        dot === -1
    ) {

        return (
            `${filename}.${mode}`
        );

    }


    return (

        filename.slice(
            0,
            dot
        ) +

        `.${mode}` +

        filename.slice(
            dot
        )

    );

}


// ==========================================
// SEASON NAME
// ==========================================

function getSeasonName(
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
            `עליית הדרקונים - עונה ${season}`
        );

    }


    // ======================================
    // ENGLISH
    // ======================================

    if (
        audio === "English"
    ) {

        return (
            `Dragons Rising - Season ${season}`
        );

    }


    // ======================================
    // BOTH
    // ======================================

    return (
        `Dragons Rising Hebrew+English - Season ${season}`
    );

}


// ==========================================
// CATALOG SEASON NAME
// ==========================================

function getCatalogSeasonName(
    season,
    config
) {

    if (
        getAudio(
            config
        ) === "Hebrew"
    ) {

        return (
            `עונה ${season}`
        );

    }


    return (
        `Season ${season}`
    );

}


// ==========================================
// SEASON DESCRIPTION
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
            `נינג'גו: עליית הדרקונים — עונה ${season}. שמע בעברית בלבד.`
        );

    }


    // ======================================
    // ENGLISH
    // ======================================

    if (
        audio === "English"
    ) {

        return (
            `Ninjago: Dragons Rising — Season ${season}. English audio only.`
        );

    }


    // ======================================
    // BOTH
    // ======================================

    return (
        `נינג'גו: עליית הדרקונים / Ninjago: Dragons Rising — עונה ${season} / Season ${season}. Hebrew + English audio.`
    );

}


// ==========================================
// EPISODE TITLE
// ==========================================

function getEpisodeTitle(
    episode,
    originalTitle,
    config
) {

    const audio =
        getAudio(
            config
        );


    if (
        audio === "Hebrew"
    ) {

        return (
            `פרק ${episode}`
        );

    }


    return (

        originalTitle ||

        `Episode ${episode}`

    );

}


// ==========================================
// EPISODE DESCRIPTION
// ==========================================

function getEpisodeDescription(
    season,
    episode,
    originalDescription,
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
            `פרק ${episode} בעונה ${season} של נינג'גו: עליית הדרקונים. שמע בעברית בלבד.`
        );

    }


    // ======================================
    // ENGLISH
    // ======================================

    if (
        audio === "English"
    ) {

        return (

            originalDescription ||

            `Episode ${episode} of Ninjago: Dragons Rising Season ${season}. English audio only.`

        );

    }


    // ======================================
    // BOTH
    // ======================================

    return (

        originalDescription ||

        `Episode ${episode} of Ninjago: Dragons Rising Season ${season}. Hebrew + English audio.`

    );

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
// MAKE STREAM
// ==========================================

function makeStream(
    season,
    episode,
    config
) {

    const filename =
        getOriginalVideoFilename(

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


    const mode =
        getAudioMode(
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
            `עונה ${seasonText} פרק ${episodeText} • עברית בלבד`;

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
            `S${seasonText}E${episodeText} • English only`;

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


    // ======================================
    // URL
    //
    // Hebrew:
    // ?audio=heb
    //
    // English:
    // ?audio=eng
    //
    // Both:
    // ?audio=both
    // ======================================

    const url =
        `${MEDIA_BASE_URL}/${encodeURIComponent(filename)}?audio=${encodeURIComponent(mode)}`;


    return {

        name:
            name,

        title:
            title,

        url:
            url,


        // ==================================
        // IMPORTANT
        // ==================================

        behaviorHints: {

            // Keep this enabled.
            // This fixed the audio-track support
            // inside Stremio.

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

    };

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
    // NORMAL IMDB
    //
    // tt27502465:2:1
    // ======================================

    let match =
        id.match(
            /^tt27502465:(2|3|4):(\d+)$/
        );


    if (
        match
    ) {

        const season =
            Number(
                match[1]
            );


        const episode =
            Number(
                match[2]
            );


        if (
            episode >= 1 &&
            episode <= 20
        ) {

            return {

                season,
                episode

            };

        }

    }


    // ======================================
    // CUSTOM CATALOG
    //
    // dragons-rising-hebrew-english-s2:2:1
    // ======================================

    match =
        id.match(
            /^dragons-rising-hebrew-english-s(2|3|4):(2|3|4):(\d+)$/
        );


    if (
        match
    ) {

        const metaSeason =
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

            metaSeason === season &&

            episode >= 1 &&

            episode <= 20

        ) {

            return {

                season,
                episode

            };

        }

    }


    return null;

}


// ==========================================
// META ID PARSER
// ==========================================

function getSeasonFromMetaId(
    id
) {

    const match =
        String(
            id ||
            ""
        )
            .match(
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
// CINEMETA
// ==========================================

async function getCinemetaMeta() {

    const now =
        Date.now();


    // Cache for 30 minutes

    if (

        cinemetaCache &&

        now - cinemetaCacheTime <
        30 * 60 * 1000

    ) {

        return cinemetaCache;

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


    return cinemetaCache;

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


            return {

                id:
                    `${metaId}:${season}:${episode}`,

                title:
                    getEpisodeTitle(

                        episode,

                        null,

                        config

                    ),

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
                    getEpisodeDescription(

                        season,

                        episode,

                        "",

                        config

                    ),

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
                // ONLY THIS SEASON
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
                    ) => {

                        return (

                            Number(
                                a.episode
                            ) -

                            Number(
                                b.episode
                            )

                        );

                    }

                )


                // ==================================
                // EPISODES
                // ==================================

                .map(

                    (
                        video
                    ) => {

                        const episode =
                            Number(
                                video.episode
                            );


                        return {

                            id:
                                `${metaId}:${season}:${episode}`,

                            title:
                                getEpisodeTitle(

                                    episode,

                                    video.title,

                                    config

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
                                getEpisodeDescription(

                                    season,

                                    episode,

                                    video.overview,

                                    config

                                ),

                            thumbnail:
                                video.thumbnail,

                            available:
                                true

                        };

                    }

                );


        if (
            videos.length > 0
        ) {

            return videos;

        }

    }

    catch (
        error
    ) {

        console.error(

            "Cinemeta error:",

            error.message

        );

    }


    return createFallbackVideos(

        season,

        config

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

                metas:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        // ==================================
        // MUST CONFIGURE FIRST
        // ==================================

        if (
            !isConfigured(
                config
            )
        ) {

            return {

                metas:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const metas =
            [];


        // ==================================
        // ONLY SELECTED SEASONS
        // ==================================

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
                    getCatalogSeasonName(

                        season,

                        config

                    ),

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

            cacheMaxAge:
                0

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
                    null,

                cacheMaxAge:
                    0

            };

        }


        const config =
            args.config ||
            {};


        // ==================================
        // MUST CONFIGURE FIRST
        // ==================================

        if (
            !isConfigured(
                config
            )
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

            !season ||

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


        // ==================================
        // IMPORTANT:
        //
        // NO defaultVideoId
        //
        // So clicking Season 2 opens
        // the season page instead of
        // jumping directly into Episode 1.
        // ==================================

        return {

            meta: {

                id:
                    getSeasonMetaId(
                        season
                    ),

                type:
                    "series",

                name:
                    getSeasonName(

                        season,

                        config

                    ),

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
                    videos

            },

            cacheMaxAge:
                0

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


        if (
            !isConfigured(
                config
            )
        ) {

            return {

                streams:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const info =
            getEpisodeInfo(
                args.id
            );


        if (

            !info ||

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
// SUBTITLES HANDLER
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


        if (
            !isConfigured(
                config
            )
        ) {

            return {

                subtitles:
                    [],

                cacheMaxAge:
                    0

            };

        }


        const info =
            getEpisodeInfo(
                args.id
            );


        if (

            !info ||

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
    "Version: 2.7.0"
);

console.log(
    `Port: ${PORT}`
);

console.log(
    "Configure required: YES"
);

console.log(
    "Audio filtering:"
);

console.log(
    "Hebrew -> ?audio=heb"
);

console.log(
    "English -> ?audio=eng"
);

console.log(
    "Hebrew + English -> ?audio=both"
);

console.log(
    "Season filtering: ENABLED"
);

console.log(
    "defaultVideoId: DISABLED"
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