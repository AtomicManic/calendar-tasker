class NotFound extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.status = 404;
    }
}

class EntityNotFound extends NotFound {
    constructor(entity) {
        super(`⚠️ ${entity} not found...`);
        this.name = this.constructor.name;
        this.entity = entity;
    }
}

class PropertyNotFound extends NotFound {
    constructor(property) {
        super(`Property: ${property} not found...`);
        this.name = this.constructor.name;
        this.property = property;
    }
}

module.exports = { EntityNotFound, PropertyNotFound };