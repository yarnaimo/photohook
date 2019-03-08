import modifyExif from 'modify-exif'

export function setDateTagIfNotExists(buffer: Buffer, dateTag?: string) {
    if (!dateTag) {
        return buffer
    }

    try {
        return modifyExif(buffer, ({ Exif }) => {
            if (Exif['36867']) {
                return
            }

            Exif['36867'] = dateTag
        })
    } catch (error) {
        return buffer
    }
}
