/* eslint-disable no-underscore-dangle */
class ExcursionsAPI {
  constructor() {
    this.url = 'http://localhost:3000';
  }

  loadData() {
    return this._fetch();
  }

  addData(data) {
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this._fetch(options, '/excursions');
  }

  removeData(id) {
    const options = {
      method: 'DELETE',
    };
    return this._fetch(options, `/excursions/${id}`);
  }

  updateData(id, data) {
    const options = {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this._fetch(options, `/excursions/${id}`);
  }

  _fetch(options, additionalPath = '/excursions') {
    const url = this.url + additionalPath;
    return fetch(url, options).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return Promise.reject(resp);
    });
  }

  addOrders(data) {
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this._fetch(options, '/orders');
  }
}

export default ExcursionsAPI;
