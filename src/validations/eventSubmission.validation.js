/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const Joi = require('joi');

// Define file schema
const fileSchema = Joi.object({
  fieldname: Joi.string().required(), // Include fieldname
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid('application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'video/mp4').required(),
  buffer: Joi.binary().required(),
  size: Joi.number().required(), // Size should be validated dynamically
});

// Define field schema
const fieldSchema = (eventFields) =>
  Joi.object({
    name: Joi.string()
      .valid(...eventFields.map((f) => f.name))
      .required(),
    value: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()), fileSchema),
  });

// Define validation schema for event submission
const validateEventSubmission = (eventFields) =>
  Joi.object({
    fields: Joi.array().items(fieldSchema(eventFields)).required(),
  }).custom((value, helpers) => {
    console.log('Starting validation...');

    const validFieldNames = new Set(eventFields.map((eventField) => eventField.name));
    console.log('Valid field names:', validFieldNames);

    const modifiedFields = value.fields.map((field) => {
      console.log('Original field:', field);

      if (field.value && field.value.fieldname) {
        console.log(`Field "${field.name}" has a file with fieldname "${field.value.fieldname}".`);
        return {
          ...field,
          name: field.value.fieldname,
        };
      }

      console.log(`Field "${field.name}" does not have a file. Keeping original name.`);
      return field;
    });

    console.log('Modified fields:', modifiedFields);

    modifiedFields.forEach((field) => {
      if (!validFieldNames.has(field.name)) {
        console.error(`Invalid field name: ${field.name}`);
        return helpers.error('any.invalid', { message: `Invalid field name: ${field.name}` });
      }
    });

    value.fields = modifiedFields;

    console.log('Final validated fields:', value.fields);
    console.log('Validation complete.');

    return value;
  });

module.exports = validateEventSubmission;
