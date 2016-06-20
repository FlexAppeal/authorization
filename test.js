const test = require('tape');
const authorization = require('./index');
const can = authorization.can;
const check = authorization.check;

const actions = {
  'create-exchange': ['employee', 'admin'],
  'delete-exchange': {
    role: 'admin',
    validate: (user, exchange) => {
      return exchange.user.id === user.id;
    },
  },
};

const employee = { id: 1, username: 'liam@flex-appeal.nl', role: 'employee' };
const admin = { id: 2, username: 'guido@flex-appeal.nl', role: 'admin' };
const teamleader = { id: 3, username: 'ruben@flex-appeal.nl', role: 'teamleader' };
const exchangeA = { id: 1, title: 'Test shift', user: { id: 1 } };
const exchangeB = { id: 2, title: 'Test shift', user: { id: 2 } };

authorization.setConfig({
  actions,
  role: 'role',
});

test('authorize when user role is in action role array and user role is defined by key', t => {
  t.equal(can(admin, 'create-exchange'), true);
  t.equal(can(teamleader, 'create-exchange'), false);
  t.end();
});

authorization.setConfig({
  role: user => user.role,
});

test('authorize when user role is in action role array and user role is received by a function', t => {
  t.equal(can(admin, 'create-exchange'), true);
  t.equal(can(teamleader, 'create-exchange'), false);
  t.end();
});

test('check if user can perform action when the validate function succeeds and the user doesn\'t have the right role', t => {
  t.equal(can(employee, 'delete-exchange', exchangeA), true);
  t.end();
});

test('should fail when the validate function fails and the user doesn\'t have the right role', t => {
  t.equal(can(employee, 'delete-exchange', exchangeB), false);
  t.end();
});

test('check if user can perform action when the validate function success and the user has the right role', t => {
  t.equal(can(admin, 'delete-exchange', exchangeB), true);
  t.end();
});

test('check if user can perform action when the validate function fails and the user has the right role', t => {
  t.equal(can(admin, 'delete-exchange', exchangeA), true);
  t.end();
});

test('should fail when user is not authorized', t => {
  t.equal(can(teamleader, 'create-exchange'), false);
  t.equal(can(teamleader, 'delete-exchange', exchangeB), false);
  t.end();
});

test('should throw an error when user is not authorized', t => {
  t.plan(1);
  try {
    check(teamleader, 'create-exchange');
  } catch (err) {
    t.equal(err, 'You don\'t have permission for create-exchange');
  }
});
