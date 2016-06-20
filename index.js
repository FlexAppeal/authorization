
var actions;
var role;

/**
 * Check if the user role is one of the required roles
 * @param {string} userRole - Role of the logged user
 * @param {string|array} required - Required roles for an action
 * @function checkRole
 * @return {boolean} - If the user has the required role
 */
function checkRole(userRole, required) {
  const requiredArray = Array.isArray(required) ? required : [ required ];

  return requiredArray.some(role => role === userRole);
}

/**
 * Set some config properties
 * @param {object} config - The configurable values
 * @function setConfig
 */
module.exports.setConfig = function(config) {
  if (config.actions) actions = config.actions;
  if (config.role) role = config.role;
}

/**
 * Check if user is authorized for an action
 * @param {object} user - The logged user
 * @param {string} actionKey - Key of the action to check for
 * @param {object} itemToValidate - Allows for custom checks on an external object
 * @function can
 * @return {boolean} - If the user is authorized for the action
 */
function can(user, actionKey, itemToValidate) {
  const userRole = typeof role === 'string' ? user[role] : role(user);
  const action = actions[actionKey];

  if (Array.isArray(action) || typeof action === 'string') return checkRole(userRole, action);
  if (typeof action === 'object') return checkRole(userRole, action.role) || action.validate(user, itemToValidate);

  return false;
}
module.exports.can = can;

/**
 * Check if user is authorized for an action
 * @param {object} user - The logged user
 * @param {string} actionKey - Key of the action to check for
 * @param {object} itemToValidate - Allows for custom checks on an external object
 * @function check
 * @return {void} - If the user is authorized for the action
 * @throws {string} - Error message
 */
function check(user, action, itemToValidate) {
  if (!can(user, action, itemToValidate)) {
    throw `You don\'t have permission for ${action}`;
  }
}
module.exports.check = check;
