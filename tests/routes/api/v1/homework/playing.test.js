const chai = require('chai');

const app = require('../../../../../src/routes/app.js');
const PlayingModel = require('../../../../../src/models/homework/PlayingModel.js');
const {
  prepareDB,
  deleteAllDataFromDB,
} = require('../../../../../src/utils/db.js');

const basePath = '/api/v1';

const propfilter = '-_id -__v';

function reformPiece(d) {
  const arry = [...Array(d.length).fill(0)];
  const r = Math.sqrt(d.length);
  let obj; let
    order;
  for (let i = 0; i < d.length; i += 1) {
    if (d[i] !== 0 && !Array.isArray(d[i])) {
      obj = {
        x: i % r,
        y: r - Math.floor(i / r) - 1,
        userId: +d[i].split(':')[0],
      };
      order = +d[i].split(':')[1] - 1;
      arry.splice(order, 1, obj);
    } else if (d[i] !== 0 && Array.isArray(d[i])) { // 配列が入っている場合 = 同じ手がある場合
      obj = {
        x: i % r,
        y: r - Math.floor(i / r) - 1,
        userId: +d[i][0].split(':')[0],
      };
      order = +d[i][0].split(':')[1] - 1;
      arry.splice(order, 1, obj);
    }
  }
  return arry;
}

function reformMatchers(m) {
  const arry = [];
  const r = Math.sqrt(m.length);
  for (let i = 0; i < m.length; i += 1) {
    const obj = {
      x: i % r,
      y: r - Math.floor(i / r) - 1,
      userId: +m[i],
    };
    arry.push(obj);
  }
  return arry;
}


describe('play', () => {
  beforeAll(prepareDB);
  afterEach(deleteAllDataFromDB);

  describe('put piece', () => {
    it('puts piece(s)', async () => {
      const piece = [
        '2:4', '1:3',
        '1:1', '2:2',
      ];

      const matchers = [
        2, 1,
        1, 2,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/homework/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }


      // // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(matchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });

    it('puts on same the place', async () => {
      const piece = [
        '2:4', ['1:3', '2:5'],
        '1:1', '2:2',
      ];

      const matchers = [
        2, 1,
        1, 2,
      ];

      // When
      let response;
      const rPiece = reformPiece(piece);
      // console.log(rPiece);
      for (let i = 0; i < rPiece.length; i += 1) {
        response = await chai.request(app)
          .post(`${basePath}/homework/playing`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(rPiece[i]);
      }


      // // Then
      const rMatchers = reformMatchers(matchers);
      expect(response.body).toHaveLength(matchers.length);
      expect(response.body).toEqual(expect.arrayContaining(rMatchers));

      const pieces = JSON.parse(JSON.stringify(await PlayingModel.find({}, propfilter)));
      expect(pieces).toHaveLength(matchers.length);
      expect(pieces).toEqual(expect.arrayContaining(rMatchers));
    });
  });
});