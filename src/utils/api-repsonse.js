export class ApiResponse {
  static ok() {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created() {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static noContent() {
    return res.status(204).end();
  }
}