import {
    MILLISECONDS_PER_SECOND,
    MILLISECONDS_PER_MINUTE,
    MILLISECONDS_PER_HOUR,
} from './constants.js'

// Converts milliseconds (integer) to FFMPEG string format hh:mm:ss.(ms fraction)
export function millisecondsToFfmpegString(milliseconds) {
    const hours = Math.floor(milliseconds / MILLISECONDS_PER_HOUR)
    milliseconds %= MILLISECONDS_PER_HOUR

    const minutes = Math.floor(milliseconds / MILLISECONDS_PER_MINUTE)
    milliseconds %= MILLISECONDS_PER_MINUTE

    const seconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND)
    milliseconds %= MILLISECONDS_PER_SECOND

    function toZeroFilled(integer) {
        // FIXME, do for any length
        if(integer < 10) {
            return `0${integer}`
        }
        return `${integer}`
    }

    milliseconds = `${milliseconds / MILLISECONDS_PER_SECOND}`
    milliseconds = milliseconds.substring(1)
    
    return `${toZeroFilled(hours)}:${toZeroFilled(minutes)}:${toZeroFilled(seconds)}${milliseconds}`
}