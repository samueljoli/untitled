'use strict';

module.exports = (string, opts) => {

    const expression = opts.paddingRequired ?
        // Padding is required.
        /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/
        // Padding is optional.
        : /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/;

    const regex = new RegExp(expression);

    return regex.exec(string);
};
