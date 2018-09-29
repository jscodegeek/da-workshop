const Joi = require('joi');

const schema = Joi.object().keys({
    title: Joi.string().min(5).max(255).required(),
    brand: Joi.string(),
    number: Joi.string().alphanum().min(3).max(8).required()
});

module.exports = function(req, res, next) {

  const { title, brand, number } = req.body;

  const result = Joi.validate({ title, brand, number }, schema);

  if (result.error) {
    return res.json(400, result.error);
  }

  next();
}