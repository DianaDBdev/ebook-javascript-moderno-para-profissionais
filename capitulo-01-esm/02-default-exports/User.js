// User.js — Default export
// Use default export quando o arquivo representa UMA coisa principal.
// Convenção forte em componentes React/Vue e classes que dão nome ao arquivo.

export default class User {
  constructor(name, email) {
    this.name  = name;
    this.email = email;
  }

  getDisplayName() {
    return this.name;
  }

  toString() {
    return `${this.name} <${this.email}>`;
  }
}
