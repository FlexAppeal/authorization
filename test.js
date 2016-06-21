const test = require('tape');
const sinon = require('sinon');
const authorization = require('./index');
const checkRole = authorization.checkRole;
const can = authorization.can;
const check = authorization.check;
const getUserRole = authorization.getUserRole;
const getActionByKey = authorization.getActionByKey;

const createExchangeRoles = ['employee', 'admin'];
const actions = {
  'create-exchange': createExchangeRoles,
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

test('should return true when user user role is one of the required roles', t => {
  t.true(checkRole('admin', 'admin'));
  t.true(checkRole('employee', ['admin', 'employee']));
  t.end();
});

test('should fail when user doesn\'t have the required role', t => {
  t.false(checkRole('employee', 'admin'));
  t.false(checkRole('employee', ['teamleader', 'admin']));
  t.end();
});

test('should get the valid user role from the user object', t => {
  t.equal(getUserRole(employee, 'role'), 'employee');
  t.equal(getUserRole(admin, user => user.role), 'admin');
  t.end();
});

test('should return the right action when getting an action by key', t => {
  authorization.setConfig({
    actions,
  });

  t.equal(getActionByKey('create-exchange'), createExchangeRoles);
  t.end();
})

test('should return true when user has the right permission for an action', t => {
  const userRoleStub = sinon.stub(authorization, 'getUserRole').returns('admin');
  const actionStub = sinon.stub(authorization, 'getActionByKey').returns(['employee', 'admin']);

  t.true(can(admin, 'create-exchange'));
  t.end();

  userRoleStub.restore();
  actionStub.restore();
});

test('should return false when user doesn\'t have the right permission for an action', t => {
  const userRoleStub = sinon.stub(authorization, 'getUserRole').returns('employee');
  const actionStub = sinon.stub(authorization, 'getActionByKey').returns({ role: 'admin' });

  t.false(can(employee, 'delete-exchange'));
  t.end();

  userRoleStub.restore();
  actionStub.restore();
});

test('should return true when user doesn\'t have the right permission for an action but the validation function returns true', t => {
  const userRoleStub = sinon.stub(authorization, 'getUserRole').returns('employee');
  const actionStub = sinon.stub(authorization, 'getActionByKey').returns({ role: 'admin', validate: () => true });

  t.true(can(employee, 'delete-exchange', exchangeA));
  t.end();

  userRoleStub.restore();
  actionStub.restore();
});

test('should throw an error when user is not authorized', t => {
  const canStub = sinon.stub(authorization, 'can').returns(false);

  t.throws(() => authorization.check(teamleader, 'create-exchange'));
  t.end();

  canStub.restore();
});
