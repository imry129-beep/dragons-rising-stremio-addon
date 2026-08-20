const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const app = express();

const PORT = 3000;

const videosFolder =
    path.join(__dirname, "videos");

const cacheFolder =
    path.join(__dirname, ".audio-cache");

fs.mkdirSync(
    cacheFolder,
    {
        recursive: true
    }
);


// ==========================================
// CACHE
// ==========================================

const pendingBuilds =
    new Map();

const probeCache =
    new Map();


// ==========================================
// CONTENT TYPE
// ==========================================

function contentTypeFor(filename) {

    const ext =
        path
            .extname(filename)
            .toLowerCase();


    if (ext === ".mkv") {

        return "video/x-matroska";

    }


    if (ext === ".webm") {

        return "video/webm";

    }


    return "video/mp4";

}


// ==========================================
// AUDIO MODE
// ==========================================

function audioMode(value) {

    if (
        value === "heb" ||
        value === "eng"
    ) {

        return value;

    }


    return "both";

}


// ==========================================
// FFPROBE AUDIO TRACKS
// ==========================================

async function probeAudioStreams(
    filePath
) {

    const cached =
        probeCache.get(
            filePath
        );


    if (cached) {

        return cached;

    }


    const {
        stdout
    } =
        await execFileAsync(

            "ffprobe",

            [

                "-v",
                "error",

                "-select_streams",
                "a",

                "-show_entries",
                "stream=index:stream_tags=language,title",

                "-of",
                "json",

                filePath

            ],

            {
                maxBuffer:
                    1024 * 1024
            }

        );


    const parsed =
        JSON.parse(
            stdout ||
            "{}"
        );


    const streams =
        Array.isArray(
            parsed.streams
        )

            ? parsed.streams

            : [];


    probeCache.set(
        filePath,
        streams
    );


    return streams;

}


// ==========================================
// FIND LANGUAGE TRACK
// ==========================================

function findLanguageTrack(
    streams,
    wanted
) {

    const aliases =

        wanted === "heb"

            ? new Set([
                "heb",
                "he",
                "hebrew",
                "עברית"
            ])

            : new Set([
                "eng",
                "en",
                "english",
                "אנגלית"
            ]);


    return streams.find(
        (stream) => {

            const language =
                String(
                    stream.tags?.language ||
                    ""
                )
                    .toLowerCase();


            const title =
                String(
                    stream.tags?.title ||
                    ""
                )
                    .toLowerCase();


            return (

                aliases.has(
                    language
                ) ||

                aliases.has(
                    title
                )

            );

        }
    );

}


// ==========================================
// CACHE PATH
// ==========================================

function cachePathFor(
    filename,
    mode
) {

    const safeName =
        path.basename(
            filename
        );


    const dir =
        path.join(
            cacheFolder,
            mode
        );


    fs.mkdirSync(
        dir,
        {
            recursive: true
        }
    );


    return path.join(
        dir,
        safeName
    );

}


// ==========================================
// BUILD SINGLE AUDIO VERSION
// ==========================================

async function buildSingleAudioVariant(
    sourcePath,
    filename,
    mode
) {

    const targetPath =
        cachePathFor(
            filename,
            mode
        );


    // ======================================
    // ALREADY EXISTS
    // ======================================

    if (
        fs.existsSync(
            targetPath
        ) &&
        fs.statSync(
            targetPath
        ).size > 0
    ) {

        return targetPath;

    }


    const key =
        `${sourcePath}|${mode}`;


    // ======================================
    // ALREADY BUILDING
    // ======================================

    if (
        pendingBuilds.has(
            key
        )
    ) {

        return pendingBuilds.get(
            key
        );

    }


    const buildPromise =
        (
            async () => {


                // ==================================
                // FIND TRACK
                // ==================================

                const streams =
                    await probeAudioStreams(
                        sourcePath
                    );


                const selected =
                    findLanguageTrack(
                        streams,
                        mode
                    );


                if (!selected) {

                    throw new Error(

                        `No ${mode} audio track found in ${filename}`

                    );

                }


                // ==================================
                // TEMP FILE
                // ==================================

                const tempPath =
                    `${targetPath}.tmp-${process.pid}-${Date.now()}`;


                const ext =
                    path
                        .extname(filename)
                        .toLowerCase();


                // ==================================
                // FFMPEG
                // ==================================

                const args = [

                    "-y",

                    "-i",
                    sourcePath,

                    // video
                    "-map",
                    "0:v:0?",

                    // selected audio only
                    "-map",
                    `0:${selected.index}`,

                    "-map_metadata",
                    "0",

                    "-map_chapters",
                    "0",

                    // NO ENCODING
                    "-c",
                    "copy"

                ];


                // ==================================
                // MP4
                // ==================================

                if (
                    ext === ".mp4" ||
                    ext === ".m4v" ||
                    ext === ".mov"
                ) {

                    args.push(
                        "-movflags",
                        "+faststart"
                    );

                    args.push(
                        "-f",
                        "mp4"
                    );

                }


                // ==================================
                // MKV
                // ==================================

                else if (
                    ext === ".mkv"
                ) {

                    args.push(
                        "-f",
                        "matroska"
                    );

                }


                args.push(
                    tempPath
                );


                console.log(
                    `Building ${mode} cache: ${filename}`
                );


                await execFileAsync(

                    "ffmpeg",

                    args,

                    {
                        maxBuffer:
                            16 * 1024 * 1024
                    }

                );


                // ==================================
                // FINISHED
                // ==================================

                fs.renameSync(
                    tempPath,
                    targetPath
                );


                console.log(
                    `Ready: ${targetPath}`
                );


                return targetPath;

            }
        )();


    pendingBuilds.set(
        key,
        buildPromise
    );


    try {

        return await buildPromise;

    }

    finally {

        pendingBuilds.delete(
            key
        );

    }

}


// ==========================================
// SERVE FILE WITH RANGE
// ==========================================

function serveFile(
    req,
    res,
    filePath,
    displayFilename
) {

    const stat =
        fs.statSync(
            filePath
        );


    const fileSize =
        stat.size;


    const range =
        req.headers.range;


    res.setHeader(
        "Accept-Ranges",
        "bytes"
    );


    res.setHeader(
        "Content-Type",
        contentTypeFor(
            displayFilename
        )
    );


    res.setHeader(
        "Cache-Control",
        "public, max-age=3600"
    );


    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );


    // ======================================
    // NORMAL REQUEST
    // ======================================

    if (!range) {

        res.status(
            200
        );


        res.setHeader(
            "Content-Length",
            fileSize
        );


        if (
            req.method === "HEAD"
        ) {

            return res.end();

        }


        return fs
            .createReadStream(
                filePath
            )
            .pipe(
                res
            );

    }


    // ======================================
    // RANGE
    // ======================================

    const match =
        /^bytes=(\d*)-(\d*)$/
            .exec(
                range
            );


    if (!match) {

        res.status(
            416
        );


        res.setHeader(
            "Content-Range",
            `bytes */${fileSize}`
        );


        return res.end();

    }


    let start =
        match[1]

            ? Number(
                match[1]
            )

            : 0;


    let end =
        match[2]

            ? Number(
                match[2]
            )

            : fileSize - 1;


    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        start >= fileSize ||
        end < start
    ) {

        res.status(
            416
        );


        res.setHeader(
            "Content-Range",
            `bytes */${fileSize}`
        );


        return res.end();

    }


    if (
        end >= fileSize
    ) {

        end =
            fileSize - 1;

    }


    const chunkSize =
        end - start + 1;


    res.status(
        206
    );


    res.setHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
    );


    res.setHeader(
        "Content-Length",
        chunkSize
    );


    if (
        req.method === "HEAD"
    ) {

        return res.end();

    }


    console.log(
        `${displayFilename} | ${start}-${end} | ${chunkSize} bytes`
    );


    fs
        .createReadStream(
            filePath,
            {
                start,
                end
            }
        )
        .pipe(
            res
        );

}


// ==========================================
// VIDEO ROUTE
//
// ?audio=heb
// ?audio=eng
// ?audio=both
// ==========================================

app.get(
    "/videos/:file",

    async (
        req,
        res
    ) => {

        try {


            const filename =
                path.basename(
                    req.params.file
                );


            const sourcePath =
                path.join(
                    videosFolder,
                    filename
                );


            const mode =
                audioMode(

                    String(
                        req.query.audio ||
                        "both"
                    )
                        .toLowerCase()

                );


            // ==================================
            // FILE NOT FOUND
            // ==================================

            if (
                !fs.existsSync(
                    sourcePath
                )
            ) {

                return res
                    .status(
                        404
                    )
                    .send(
                        "File not found"
                    );

            }


            let fileToServe =
                sourcePath;


            // ==================================
            // HEBREW / ENGLISH ONLY
            // ==================================

            if (
                mode === "heb" ||
                mode === "eng"
            ) {

                fileToServe =
                    await buildSingleAudioVariant(

                        sourcePath,

                        filename,

                        mode

                    );

            }


            // ==================================
            // SERVE
            // ==================================

            return serveFile(

                req,

                res,

                fileToServe,

                filename

            );

        }

        catch (
            error
        ) {

            console.error(

                "Media error:",

                error.message

            );


            return res
                .status(
                    500
                )
                .send(
                    error.message
                );

        }

    }
);


// ==========================================
// STATUS
// ==========================================

app.get(
    "/",

    (
        req,
        res
    ) => {

        res.send(
            "Dragons Rising Media Server is running"
        );

    }
);


// ==========================================
// START
// ==========================================

app.listen(

    PORT,

    "127.0.0.1",

    () => {

        console.log("");

        console.log(
            "===================================="
        );

        console.log(
            "Dragons Rising Media Server"
        );

        console.log(
            `Port: ${PORT}`
        );

        console.log(
            "Audio filtering: ENABLED"
        );

        console.log(
            "?audio=heb"
        );

        console.log(
            "?audio=eng"
        );

        console.log(
            "?audio=both"
        );

        console.log(
            "Range requests: ENABLED"
        );

        console.log(
            "===================================="
        );

    }

);