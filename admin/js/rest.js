const REST_PREFIX = 'famtree/v1';

export default class RestClient {
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
  
    return wp.apiRequest(options);
  }

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
  
    return wp.apiRequest(options);
  }

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

    return wp.apiRequest(options);
  }
}
