class ServerException {
  response?: any;
  status?: number;
  message?: string;
  name?: string;

  constructor(res) {
    this.response = res.response;
    this.status = res.status;
    this.message = res.message;
    this.name = res.name;
  }
}

export default ServerException;
