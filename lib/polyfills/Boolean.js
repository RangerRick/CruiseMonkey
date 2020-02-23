'use strict';

const isBooleanString = (string) => ['true', 'false'].some(item => item === string);

if (typeof Boolean.of !== 'function') {
  Boolean.of = (value) => {
    return isBooleanString(value) ? JSON.parse(value) : value;
  };
}
