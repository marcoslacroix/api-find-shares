const bcrypt = require('bcrypt');
const { encryptPassword } = require('./function_util');
const request = require('supertest');
const app = require('./routes');

test('Teste de criptografia de senha', async () => {
  const password = 'password123';
  const hashedPassword = await encryptPassword(password);

  expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
});


describe('POST /create-user', () => {
  test('should create a error to create user', async () => {
    const response = await request(app)
      .post('/create-user')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        lastName: 'Doe'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ mensagem: 'User already registered' });
  });

  test('should return error for missing required fields', async () => {
    const response = await request(app)
      .post('/create-user')
      .send({
        email: 'test@example.com',
        name: 'John'
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ mensagem: '\"password\" is required' });
  });

});

describe('GET /login', () => {
  test('should return token for valid credentials', async () => {
    const response = await request(app)
      .get('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('should return error for invalid credentials', async () => {
    const response = await request(app)
      .get('/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ mensagem: 'Credenciais inválidas' });
  });

});

describe('POST /api/companies/updateFavorite', () => {
  test('should update favorite status for a company', async () => {
    const response = await request(app)
      .post('/api/companies/updateFavorite?ticker=XYZ&favorite=true')
      .set('Authorization', 'Bearer ');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Favorite status updated');
  });

});

describe('GET /api/brazil-company/sector', () => {
  test('should retrieve distinct sectors', async () => {
    const response = await request(app)
      .get('/api/brazil-company/sector')
      .set('Authorization', 'Bearer ');

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

});

