import * as path from 'path';
import * as express from 'express';
import { expect } from 'chai';
import * as request from 'supertest';
import { createApp } from './common/app';

const packageJson = require('../package.json');

describe(packageJson.name, () => {
  let app = null;
  let basePath = null;

  before(async () => {
    // Set up the express app
    const apiSpec = path.join('test', 'resources', 'coercion.yaml');
    app = await createApp({ apiSpec }, 3005);
    basePath = app.basePath;

    // Define new coercion routes
    app.use(
      `${basePath}/coercion`,
      express
        .Router()
        .post(`/pets`, (req, res) => res.json(req.body))
        .post(`/pets_string_boolean`, (req, res) => res.json(req.body)),
    );
  });

  after(() => {
    app.server.close();
  });

  it('should coerce is_cat to boolean since it is defined as a boolean in the spec', async () =>
    request(app)
      .post(`${basePath}/coercion/pets`)
      .send({
        name: 'test',
        is_cat: 'true',
      })
      .expect(200)
      .then(r => {
        expect(r.body.is_cat).to.be.a('boolean');
        expect(r.body.is_cat).to.be.equal(true);
      }));

  it('should keep is_cat as boolean', async () =>
    request(app)
      .post(`${basePath}/coercion/pets`)
      .send({
        name: 'test',
        is_cat: true,
      })
      .expect(200)
      .then(r => {
        expect(r.body.is_cat).to.be.a('boolean');
        expect(r.body.is_cat).to.be.equal(true);
      }));

  it('should coerce a is_cat from boolean to string since it is defined as such in the spec', async () =>
    request(app)
      .post(`${basePath}/coercion/pets_string_boolean`)
      .send({
        name: 'test',
        is_cat: true,
      })
      .expect(200)
      .then(r => {
        expect(r.body.is_cat).to.be.a('string');
        expect(r.body.is_cat).to.be.equal('true');
      }));
});
