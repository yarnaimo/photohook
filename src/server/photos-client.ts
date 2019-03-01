import { got } from '@yarnaimo/rain'

export const photosClient = got.extend({
    baseUrl: 'https://photoslibrary.googleapis.com/v1',
})
