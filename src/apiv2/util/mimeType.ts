const mimeTypes: { [key: string]: string } = {
    'image/*': '.png',
    'image/gif': '.gif',
    'image/png': '.png',
    'image/jpeg': '.jpeg',
    'audio/*': '.mp3',
    'audio/mpeg': '.mp3',
    'audio/mpeg3': '.mp3',
    'audio/ogg': '.mp3',
    'audio/wav': '.mp3',
    'audio/wave': '.mp3',
    'video/*': '.mp4',
    'video/mp4': '.mp4',
};

export default async function mimeTypeStr(mimetype: string) {
    return mimeTypes[mimetype];
}