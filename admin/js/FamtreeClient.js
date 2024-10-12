const REST_PREFIX = 'famtree/v1';

const getRestClient = (wp) => ({
  wp,

  /**
   * Performs a get api request to Wordpress.
   * @param {string} endpoint 
   * @returns WPRequest
   */
  get(endpoint) {
    const options = {
      path: `${REST_PREFIX}${endpoint}`,
      type: 'GET',
    };
  
    return this.wp.apiRequest(options);
  },

  /**
   * Performs a post api request to Wordpress.
   * @param {string} endpoint 
   * @param {Object} nonce 
   * @param {Object} data 
   * @returns WPRequest
   */
  post(endpoint, nonce, data) {
    const options = {
      path: `${REST_PREFIX}${endpoint}`,
      type: 'POST',
      data,
    };
  
    options.data[nonce.name] = nonce.value;
  
    return this.wp.apiRequest(options);
  },

  /**
   * Performs a delete api request to Wordpress.
   * @param {string} endpoint 
   * @param {Object} nonce 
   * @returns WPRequest
   */
  delete(endpoint, nonce) {
    const options = {
      path: `${REST_PREFIX}${endpoint}`,
      type: 'DELETE',
    };
  
    if (options.path.includes('?')) {
      options.path += `&${nonce.name}=${nonce.value}`;
    } else {
      options.path += `?${nonce.name}=${nonce.value}`;
    }

    return this.wp.apiRequest(options);
  },
});

export default class FamtreeClient {
  constructor(wp, nonces = {}) {
    this.restClient = getRestClient(wp);
    this.nonces = { ...nonces };
    
  }
  /**
   * Load famtree families data
   * @returns { persons: [Persons], relations: [Relation] }
   */
  loadFamilies() {
    return this.restClient.get('/family/');
  }

  savePerson(data) {
    if (data.id) {
      return this.updatePerson(data.id, data);
    } else {
      return this.createPerson(data);
    }
  }

  createPerson(data) {
    const nonce = this.nonces.person();
    delete data.id;
    return this.restClient.post('/person/', nonce, data);
  }

  updatePerson(id, data) {
    const nonce = this.nonces.person();
    return this.restClient.post(`/person/${id}`, nonce, data);
  }

  deletePerson(id) {
    const nonce = this.nonces.person();
    return this.restClient.delete(`/person/${id}`, nonce);
  }

  loadPersonMetadata(id) {
    return this.restClient.get(`/person/${id}/metadata`);
  }

  createRelation(data) {
    const nonce = this.nonces.person();
    return this.restClient.post('/relation/', nonce, data);
  }

  updateRelation(id, data) {
    const nonce = this.nonces.person();
    return this.restClient.post(`/relation/${id}`, nonce, data);
  }

  deleteRelation(id) {
    const nonce = this.nonces.person();
    return this.restClient.delete(`/relation/${id}`, nonce);
  }

  createMetadata(data) {
    const nonce = this.nonces.metadata();
    return this.restClient.post('/metadata/', nonce, data);
  }

  deleteMetadata(id) {
    const nonce = this.nonces.metadata();
    return this.restClient.delete(`/metadata/${id}`, nonce)
  }

  updateRoot(id, data) {
    const nonce = this.nonces.root();
    return this.restClient.post(`/root/${id}`, nonce, data);
  }
}
