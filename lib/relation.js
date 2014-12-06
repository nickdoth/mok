module.exports = Relation

function Relation (getter, setter) {
  if(!(this instanceof Relation)) { return new Relation(getter, setter) }

  this.getter = getter
  this.setter = setter
}

Relation.prototype.to = function (to) {
  this.to = to
  return this
}