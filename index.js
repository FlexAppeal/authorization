var actions;
var role;

/**
 * Check if the user role is one of the required roles
 * @param {string} userRole - Role of the logged user
 * @param {string|array} required - Required roles for an action
 * @function checkRole
 * @return {boolean} - If the user has the required role
 */
const checkRole = (userRole, required) => {
  const requiredArray = Array.isArray(required) ? required : [ required ];

  return requiredArray.some(role => role === userRole);
}

/**
 * Get role from user
 * @param {object} user - The logged user
 * @param {string|function} role - How to retreive the role
 * @function getUserRole
 * @return {string} - role
 */
const getUserRole = (user, role) => {
  if (!role) throw new Error('No user role defined in config');

  return typeof role === 'string' ? user[role] : role(user);
}

/**
 * Get an action by key
 * @param {string} key - The action key
 * @function getActionByKey
 * @return {object|array} - The found action
 */
const getActionByKey = (key) => {
  return actions[key];
}

/**
 * Set some config properties
 * @param {object} config - The configurable values
 * @function setConfig
 */
const setConfig = (config) => {
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
const can = (user, actionKey, itemToValidate) => {
  const userRole = module.exports.getUserRole(user, role);
  const action = module.exports.getActionByKey(actionKey);

  if (Array.isArray(action) || typeof action === 'string') {
    return module.exports.checkRole(userRole, action);
  }

  if (typeof action === 'object') {
    return module.exports.checkRole(userRole, action.role) ||
      action.validate ? action.validate(user, itemToValidate) : false;
  }

  return false;
}

/**
 * Check if user is authorized for an action
 * @param {object} user - The logged user
 * @param {string} actionKey - Key of the action to check for
 * @param {object} itemToValidate - Allows for custom checks on an external object
 * @function check
 * @return {void} - If the user is authorized for the action
 * @throws {string} - Error message
 */
const check = (user, action, itemToValidate) => {
  if (!module.exports.can(user, action, itemToValidate)) {
    throw new Error(`You don\'t have permission for ${action}`);
  }
}

module.exports = { can, check, checkRole, getUserRole, getActionByKey, setConfig };
