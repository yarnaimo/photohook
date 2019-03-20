interface Window {
    gapi: any
}

declare module 'modify-exif' {
    export default function modifyExif(buffer: Buffer, modifierFn: (data: any) => void): Buffer
}
