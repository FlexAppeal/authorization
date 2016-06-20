## Registering the plugin:

Options arguments
```
actions: Object
role: Function|String -> String
```

```
import actions from './actions';

const roleFn = (req) => {
  return db.getRole(req.auth.credentials) === 'admin') {
    return roles.admin;
  }
  
  return roles.employee;
}

server.register({
  register: require('flex-acl'),
  options: { actions, role: roleFn },
});
```

## Defining the actions:

Action can contain the following properties:
```
type ActionType {
  role: String,
  validate: Function -> Boolean
}

action: Array<String>|ActionType
```

Example:
```
const actions = {
  create-exchange: ['employee', 'admin']
  delete-exchange: {
    role: 'admin',
    validate: (user, exchange) => {
      return exchange.userId === user.id;
    },
  },
};
```

<!--Routes:-->
<!--```-->
<!--server.route({ method: 'POST', path: '/exchanges/{exchangeId}', config: {-->
<!--  plugins: { 'hapi-acl': { action: 'create-exchange'} },-->
<!--  handler: function (request, reply) { reply("Deleted user as admin.");}-->
<!--}});-->
<!--```-->

<!--Advanced validate routing:-->
<!--```-->
<!--server.route({ method: 'DELETE', path: '/exchanges/{exchangeId}', config: {-->
<!--  plugins: { 'hapi-acl': { action: 'delete-exchange' } },-->
<!--  handler: function (request, reply) { reply("Deleted user as admin.");}-->
<!--}});-->
<!--```-->

## Helpers:

You can use the `can` helper to validate if the user is allowed to execute the action. It will return a boolean.  
`can(user, action: String, itemToValidate: Object) -> Boolean`

```
const handler = (req, reply) => {
  const exchange = db.getExchange(req.params.id);

  if (!can(req.auth.credentials, 'delete-exchange', exchange)) {
    return reply('User cannot delete exchange.');
  }
  
  return reply('Exchange deleted.');
}
```

This is the same as the `can` helper, but will throw an error when the result will be false.  
`check(user, action: String, itemToValidate: Object) -> Error|void`

```
const handler = (req, reply) => {
  const exchange = db.getExchange(req.params.id);
  
  try {
    check(req.auth.credentials, 'delete-exchange', exchange);
  
    return reply('Exchange deleted.');
  } catch (err) {
    return reply('User cannot delete exchange.');
  }
}
```
