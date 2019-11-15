import { exit } from './exit';
import * as Joi from '@hapi/joi';

// @ts-ignore
export const createSchema = (fn: (joi: Joi) => Joi.Schema) => fn(require('@hapi/joi'));

export const validate = (obj: any, schema: Joi.Schema, cb: (msg: string) => void) => {
  Joi.validate(obj, schema, {}, err => {
    if (err) {
      cb(err.message);
      exit(1);
    }
  });
};
