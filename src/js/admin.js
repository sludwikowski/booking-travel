/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-alert */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */

import '../css/admin.css';
import '../css/reset.css';

import ExcursionsAPI from './ExcursionsAPI';

document.addEventListener('DOMContentLoaded', init);
const excursions = new ExcursionsAPI();
const prototype = document.querySelector('.excursions__item--prototype');
const ulEl = document.querySelector('.excursions');

function init() {
  loadExcursions();
  addExcursions();
  removeExcursions();
  updateExcursions();
}

function loadExcursions() {
  excursions
    .loadData()
    .then((data) => insertExcursions(data))
    .catch((err) => console.error(err));
}

function insertExcursions(data) {
  ulEl.innerHTML = '';
  data.forEach((element) => {
    const newLiEl = createLiEl(element);
    ulEl.appendChild(newLiEl);
  });
}

function addExcursions() {
  const form = document.querySelector('.form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const {
      name, description, adultsPrice, childrenPrice,
    } = e.target.elements;
    const data = {
      name: name.value,
      description: description.value,
      adultsPrice: adultsPrice.value,
      childrenPrice: childrenPrice.value,
    };
    excursions
      .addData(data)
      .catch((err) => console.error(err))
      .finally(() => loadExcursions());
  });
}

function removeExcursions() {
  ulEl.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.className.includes('excursions__field-input--remove')) {
      const { id } = e.target.parentElement.parentElement.parentElement.dataset;
      excursions
        .removeData(id)
        .catch((err) => console.error(err))
        .finally(() => loadExcursions());
    }
  });
}

function updateExcursions() {
  ulEl.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.className.includes('excursions__field-input--update')) {
      const liEl = e.target.parentElement.parentElement.parentElement;
      const [name, description, adultsPrice, childrenPrice] = [...liEl.querySelectorAll('.excursions__field-name strong, .excursions__description, .excursions__title')];
      if (e.target.value === 'edytuj') {
        e.target.value = 'zapisz';
        [name, description, adultsPrice, childrenPrice].forEach((item) => (item.contentEditable = 'true'));
      } else {
        const { id } = liEl.dataset;
        const data = {
          name: name.innerText,
          description: description.innerText,
          adultsPrice: adultsPrice.innerText,
          childrenPrice: childrenPrice.innerText,
        };
        e.target.value = 'edytuj';
        [name, description, adultsPrice, childrenPrice].forEach((item) => (item.contentEditable = 'false'));
        excursions
          .updateData(id, data)
          .catch((err) => console.error(err))
          .finally(() => loadExcursions());
      }
    }
  });
}

function createLiEl(element) {
  const newLiEl = prototype.cloneNode(true);
  newLiEl.dataset.id = element.id;
  const titleEl = newLiEl.querySelector('.excursions__title');
  titleEl.innerText = element.name;
  const descriptionEl = newLiEl.querySelector('.excursions__description');
  descriptionEl.innerText = element.description;
  newLiEl.classList.remove('excursions__item--prototype');
  const fieldList = newLiEl.querySelectorAll('.excursions__field-name');
  fieldList[0].innerHTML = `Dorosły:<strong>${element.adultsPrice}</strong>PLN`;
  fieldList[1].innerHTML = `Dziecko:<strong>${element.childrenPrice}</strong>PLN`;
  return newLiEl;
}
