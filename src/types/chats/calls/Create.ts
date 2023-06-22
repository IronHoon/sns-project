interface Create {
  message: string;
  statusCode: string;
  retryable: boolean;
  time: Date;
  code: string;
  originalError: {
    message: string;
    statusCode: string;
    retryable: boolean;
    time: Date;
    code: string;
    originalError: {
      message: string;
      statusCode: string;
      retryable: boolean;
      time: Date;
    };
  };
}

export default Create;
