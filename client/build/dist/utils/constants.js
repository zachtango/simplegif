
// Stores all the variables used to parameterize the app

export const PAGE_STATE = {
    LANDING: 'LANDING',
    RECORDING: 'RECORDING',
    EDITING: 'EDITING'
}

export const SIDE = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
}

export const RESOLUTION_TO_FFMPEG_ARG = {
    360: 'scale=640:360:force_original_aspect_ratio=decrease',
    480: 'scale=854:480:force_original_aspect_ratio=decrease',
    720: 'scale=1280:720:force_original_aspect_ratio=decrease',
    1080: 'scale=1920:1080:force_original_aspect_ratio=decrease'
}

export const VIDEO_EDITING_CONTAINER_WIDTH = 1300

export const VIDEO_EDITING_TIMELINE_WIDTH = VIDEO_EDITING_CONTAINER_WIDTH - 600

export const MILLISECONDS_PER_SECOND = 1000

export const MILLISECONDS_PER_MINUTE = 60000

export const MILLISECONDS_PER_HOUR = 3600000

export const TRIM_SELECTOR_WIDTH_PX = 8