export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          errors: result.error.errors,
          data: null,
        });
      }

      req[source] = result.data;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal error during validation',
        data: null,
      });
    }
  };
}

export default validate;
