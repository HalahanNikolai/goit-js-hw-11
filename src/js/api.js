import axios from 'axios';
export class PictureAPI {
    page = 1;
    query = null;
    pageLim = 40;
    async fetchPics() {
        return await axios.get(`https://pixabay.com/api/`, {
            params: {
                key: '39884939-f973fe0cf2cb34cf3e6c18c7b',
                q: this.query,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: this.page,
                per_page: this.pageLim,
            },
        });
    }
}

