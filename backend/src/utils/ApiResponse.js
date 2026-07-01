// Uniform JSON response shape.
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Created') {
    return new ApiResponse(201, data, message);
  }

  static accepted(data, message = 'Accepted') {
    return new ApiResponse(202, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }
}

module.exports = ApiResponse;
