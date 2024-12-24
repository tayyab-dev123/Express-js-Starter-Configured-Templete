class apiResponse {
  constructor(success, message = 'Success', data, statusCode) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this;
  }
}
