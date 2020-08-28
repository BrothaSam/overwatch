class Profile {
  constructor({ name, system }) {
    if (!name) {
      throw Error('Name is required!');
    }
    this._name = name;
    if (!system) {
      throw Error('System is required!');
    }
    this._system = system;
  }
}

module.exports = Profile;
