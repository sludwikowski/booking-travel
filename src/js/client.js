/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */

import '../css/client.css';

import ExcursionsAPI from './ExcursionsAPI';

const excursions = new ExcursionsAPI();

document.addEventListener('DOMContentLoaded', init);
const ulEl = document.querySelector('.excursions');
const prototypeExcursion = document.querySelector('.excursions__item--prototype');
const summaryEl = document.querySelector('.summary');
const prototypeOrder = document.querySelector('.summary__item--prototype');
const formPanelOrderEl = document.querySelector('.panel__order');
let basket = [];

function init() {
  loadExcursions();
  ulEl.addEventListener('submit', addExcursionToBasket);
  summaryEl.addEventListener('click', removeFromBasket);
  formPanelOrderEl.addEventListener('submit', sendOrder);
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

function addExcursionToBasket(e) {
  e.preventDefault();
  const {
    name, adultsPrice, adultsNumber, childrenPrice, childrenNumber,
  } = getExcursionData(e.target);
  const data = {
    name,
    adultsPrice,
    adultsNumber,
    childrenPrice,
    childrenNumber,
  };
  if (checkNumbers(adultsNumber, childrenNumber)) {
    basket.forEach((element) => {
      if (name === element.name) {
        removeElementFromArray(element, basket);
      }
    });
    basket.push(data);
    showExcursionInBasket(basket);
    countOrderTotalPrice(basket);
  }
}

function showExcursionInBasket(data) {
  summaryEl.innerHTML = '';
  data.forEach((element) => {
    const newOrderEl = prepareOrderEl(element);
    summaryEl.appendChild(newOrderEl);
  });
}

function countOrderTotalPrice(data) {
  const orderTotalPriceEl = document.querySelector('.order__total-price-value');
  let totalPrice = 0;
  data.forEach((element) => {
    totalPrice += element.adultsPrice * element.adultsNumber + element.childrenPrice * element.childrenNumber;
  });
  orderTotalPriceEl.innerText = `${totalPrice}PLN`;
}

function removeFromBasket(e) {
  e.preventDefault();
  if (e.target.tagName === 'A') {
    const currentTitleEl = e.target.parentElement;
    const name = currentTitleEl.querySelector('.summary__name').innerText;
    basket.forEach((element) => {
      if (name === element.name) {
        removeElementFromArray(element, basket);
      }
    });
    showExcursionInBasket(basket);
    countOrderTotalPrice(basket);
  }
}

function sendOrder(e) {
  e.preventDefault();
  const orderTotalPrice = e.target.querySelector('.order__total-price-value').innerText;
  const customerName = e.target.querySelector('[name="name"]').value;
  const mailAdress = e.target.querySelector('[name="email"]').value;
  if (!checkData(customerName, mailAdress, orderTotalPrice)) {
    e.preventDefault();
  } else {
    alert(`Dziękujemy za złożenie zamówienia o wartości ${orderTotalPrice}. Wszelkie szczegóły zamówienia zostały wysłane na adres email: ${mailAdress}.`);
    const order = {
      customerName,
      mailAdress,
      excursion: [],
    };
    basket.forEach((element) => {
      const excursion = {
        name: element.name,
        adultsPrice: element.adultsPrice,
        adultsNumber: element.adultsNumber,
        childrenPrice: element.childrenPrice,
        childrenNumber: element.childrenNumber,
      };
      order.excursion.push(excursion);
      basket = [];
      showExcursionInBasket(basket);
      countOrderTotalPrice(basket);
    });
    excursions.addOrders(order).catch((err) => console.error(err));
  }
}

function createLiEl(element) {
  const newLiEl = prototypeExcursion.cloneNode(true);
  newLiEl.dataset.id = element.id;
  const titleEl = newLiEl.querySelector('.excursions__title');
  titleEl.innerText = element.name;
  const descriptionEl = newLiEl.querySelector('.excursions__description');
  descriptionEl.innerText = element.description;
  newLiEl.classList.remove('excursions__item--prototype');
  const fieldList = newLiEl.querySelectorAll('.excursions__field-price');
  fieldList[0].innerText = element.adultsPrice;
  fieldList[1].innerText = element.childrenPrice;
  return newLiEl;
}

function getExcursionData(item) {
  const { adults, children } = item.elements;
  const name = item.previousElementSibling.querySelector('.excursions__title').innerText;
  const adultsPrice = Number(item.adults.parentElement.querySelector('.excursions__field-price').innerText);
  const childrenPrice = Number(item.children.parentElement.querySelector('.excursions__field-price').innerText);
  const adultsNumber = Number(adults.value);
  const childrenNumber = Number(children.value);
  return {
    name,
    adultsPrice,
    adultsNumber,
    childrenPrice,
    childrenNumber,
  };
}

function prepareOrderEl(element) {
  const newLiEl = prototypeOrder.cloneNode(true);
  newLiEl.classList.remove('summary__item--prototype');
  const titleEl = newLiEl.querySelector('.summary__name');
  const summaryTotalPriceEl = newLiEl.querySelector('.summary__total-price');
  const paragrafEl = newLiEl.querySelector('.summary__prices');
  titleEl.innerText = element.name;
  summaryTotalPriceEl.innerText = `${element.adultsPrice * element.adultsNumber + element.childrenPrice * element.childrenNumber}PLN`;
  paragrafEl.innerText = `${element.adultsNumber === 0 ? '' : `dorośli: ${element.adultsNumber} x ${element.adultsPrice}PLN`} ${
    element.adultsNumber !== 0 && element.childrenNumber !== 0 ? ',' : ''
  } ${element.childrenNumber === 0 ? '' : `dzieci: ${element.childrenNumber} x ${element.childrenPrice}PLN`}`;
  return newLiEl;
}

function removeElementFromArray(element, arr) {
  const index = arr.indexOf(element);
  arr.splice(index, 1);
}

function checkNumbers(num1, num2) {
  const errors = [];
  if (Number.isNaN(num1) || Number.isNaN(num2) || num1 < 0 || num2 < 0) {
    errors.push('Podano błednie liczbę uczestników');
  } else if (num1 === 0 && num2 === 0) {
    errors.push('Podaj liczbę uczestników wycieczki');
  }
  if (errors.length > 0) {
    showErrors(errors);
  }
  return !(errors.length > 0);
}

function showErrors(err) {
  let txt = '';
  err.forEach((item) => {
    txt += `${item} \n`;
  });
  alert(`${txt}`);
}

function checkData(name, email, order) {
  const errors = [];
  if (name.length < 1) {
    errors.push('Pole "Imię i Nazwisko" nie może byc puste.');
  }
  if (!email.includes('@')) {
    errors.push('Podano błędny email.');
  }
  if (order === '0PLN') {
    errors.push('Wybierz wycieczkę zanim złożysz zamówienie.');
  }
  if (errors.length > 0) {
    showErrors(errors);
  }
  return !(errors.length > 0);
}
