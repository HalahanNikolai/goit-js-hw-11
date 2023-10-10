import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { PictureAPI } from './js/api';

let totalHits;

const refs = {
    gallery: document.querySelector('.gallery'),
    form: document.getElementById('search-form'),
    target: document.getElementById('js-guard'),
    currentPage: 1,
};

const pixabayApi = new PictureAPI();
const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
});

refs.form.addEventListener('submit', searchForm);

// Пошук фото + рендер розмітки
async function searchForm(event) {
    event.preventDefault();
    refs.target.classList.remove('hidden');
    refs.currentPage = 1;
    InputValue();
    refs.gallery.innerHTML = '';
    setTimeout(() => {
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
    }, 1000);
}

// Отримання даних
async function InputValue() {
    const searchValue = refs.form.elements['searchQuery'].value;
    pixabayApi.query = searchValue;

    // console.log(searchValue);

    pixabayApi.page = refs.currentPage;

    // Отримання фото + обробка помилки, як що не знайдено
    try {
        const {
            data,
            data: { hits },
        } = await pixabayApi.fetchPics();

        // console.log(hits);
        totalHits = data.totalHits;

        // Обробка, як що нічого не знайдено
        if (!hits.length) {
            throw new Error('Sorry, no photos were found for this search query.');
        } else {
            // Затримка для маркапу фотокарток
            setTimeout(() => {
                const markupFoto = hits.map(markupCreat).join('');
                refs.gallery.insertAdjacentHTML('beforeend', markupFoto);
                lightbox.refresh();
                swichObserver();
            }, 300);
        }
    } catch (error) {
        Notiflix.Notify.warning(error.message);
        Notiflix.Report.warning(
            'We are sorry,  but no photos were found for your request. Please try entering a different keyword.',
            'Ok'
        );
    }
}

// створення фотокартки
function markupCreat({
    webformatURL,
    largeImageURL,
    tags,
    likes,
    views,
    comments,
    downloads,
}) {
    return `
  <div class="photo-card">
    <a href = ${largeImageURL}>
      <img src=${webformatURL} alt=${tags} loading="lazy" />
    </a>
      <div class="info">
        <p class="info-item">
          <b>&#128155;</b>${likes}
        </p>
        <p class="info-item">
          <b>&#128064;</b>${views}
        </p>
        <p class="info-item">
          <b>&#128488; </b>${comments}
        </p>
        <p class="info-item">
          <b>&#128190;</b>${downloads}
        </p>
      </div>
  </div>`;
}

// Observer
async function swichObserver() {
    // лічильник сторінок
    let totalPages = Math.ceil(totalHits / pixabayApi.pageLim);
    if (totalPages > refs.currentPage) {
        observer.observe(refs.target);
    } else {
        observer.unobserve(refs.target);
        setTimeout(() => {
            Notiflix.Notify.warning(
                'We are sorry, but you have reached the end of search results.'
            );
        }, 1000);
    }
}

let observer = new IntersectionObserver(loadMore, {
    root: null,
    rootMargin: '1000px',
    threshold: 0,
});
function loadMore(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            refs.currentPage += 1;
            InputValue();
        }
    });
}
