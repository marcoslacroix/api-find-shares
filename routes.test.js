const bcrypt = require('bcrypt');
const { encryptPassword } = require('./function_util');

test('Teste de criptografia de senha', async () => {
  const password = 'password123';
  const hashedPassword = await encryptPassword(password);

  expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
});