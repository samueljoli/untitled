'use strict';

const Hoek = require('hoek');

module.exports = (guid, versions) => { //TODO: Matching bracket logic

    versions = versions || [];

    const guidVersions = {
        uuidv1: '1',
        uuidv2: '2',
        uuidv3: '3',
        uuidv4: '4',
        uuidv5: '5'
    };

    let versionNumbers = '';


    if (versions.length) {

        const versionSet = new Set();

        for (const version of versions) {

            const versionNumber = guidVersions[version];

            Hoek.assert(!(versionSet.has(versionNumber)), `version ${versionNumber}, can not be a duplicate`);

            versionNumbers += versionNumber;
            versionSet.add(versionNumber);
        }
    }


    const regex = new RegExp(`^([\\[{\\(]?)[0-9A-F]{8}([:-]?)[0-9A-F]{4}\\2?[${versionNumbers || '0-9A-F'}][0-9A-F]{3}\\2?[${versionNumbers ? '89AB' : '0-9A-F'}][0-9A-F]{3}\\2?[0-9A-F]{12}([\\]}\\)]?)$`, 'i');

    return regex.exec(guid);
};
