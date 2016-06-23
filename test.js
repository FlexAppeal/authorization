const test = require('tape');
const sinon = require('sinon');
const authorization = require('./index');
const { checkRole, can, check, getUserRole, getActionByKey, setConfig } = require('./index');

const employee = { id: 1, username: 'liam@flex-appeal.nl', role: 'employee' };
const admin = { id: 2, username: 'guido@flex-appeal.nl', role: 'admin' };

test('should return true when user has one of the required roles', t => {
  t.true(checkRole('employee', ['admin', 'employee']));
  t.end();
});

test('should return true when user has one of the required role', t => {
  t.true(checkRole('admin', 'admin'));
  t.end();
});

test('should fail when user doesn\'t have the required role and value is array', t => {
  t.false(checkRole('employee', ['teamleader', 'admin']));
  t.end();
});

test('should fail when user doesn\'t have the required role and value is string', t => {
  t.false(checkRole('employee', 'admin'));
  t.end();
});

test('should get the valid user role from the user object', t => {
  t.equal(getUserRole(employee, 'role'), 'employee');
  t.equal(getUserRole(admin, user => user.role), 'admin');
  t.end();
});

test('should return the right action when getting an action by key', t => {
  const createExchangeRoles = ['employee', 'admin'];

  setConfig({
    actions: {
      'create-exchange': createExchangeRoles,
    },
  });

  t.equal(getActionByKey('create-exchange'), createExchangeRoles);
  t.end();
});

test('should return false when action doesn\'t exist', t => {
  setConfig({
    actions: {},
    role: 'role',
  });

  t.false(can(admin, 'non-existent-action'));
  t.end();
});

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

test('should return true when user doesn\'t have the right permission for an action but the "or" function returns true', t => {
  const userRoleStub = sinon.stub(authorization, 'getUserRole').returns('employee');
  const actionStub = sinon.stub(authorization, 'getActionByKey').returns({ role: 'admin', or: () => true });
  const exchange = { id: 1, title: 'Test shift', user: { id: 1 } };

  t.true(can(employee, 'delete-exchange', exchange));
  t.end();

  userRoleStub.restore();
  actionStub.restore();
});

test('should return true when user doesn\'t have the right permission for an action but the "and" function returns true', t => {
  const userRoleStub = sinon.stub(authorization, 'getUserRole').returns('employee');
  const actionStub = sinon.stub(authorization, 'getActionByKey').returns({ role: 'admin', and: () => true });
  const exchange = { id: 1, title: 'Test shift', user: { id: 1 } };

  t.false(can(employee, 'delete-exchange', exchange));
  t.end();

  userRoleStub.restore();
  actionStub.restore();
});

test('should throw an error when user is not authorized', t => {
  const stub = sinon.stub(authorization, 'can').returns(false);
  const teamleader = { id: 3, username: 'ruben@flex-appeal.nl', role: 'teamleader' };

  t.throws(() => authorization.check(teamleader, 'create-exchange'));
  t.end();

  stub.restore();
});
