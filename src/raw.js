import range from 'ramda/es/range';
import map from 'ramda/es/map';
import flatten from 'ramda/es/flatten';
import groupBy from 'ramda/es/groupBy';
import lensProp from 'ramda/es/lensProp';
import over from 'ramda/es/over';
import partial from 'ramda/es/partial';
import prop from 'ramda/es/prop';
import sortBy from 'ramda/es/sortBy';
import { mark, measure, printMeasures, log } from './utils';

function loadFiles() {
    const requests = range(0, 10)
        .map(n => (
            fetch(`/data/1e4/${n}.json`)
                .then(res => res.json())
        ));

    return Promise.all(requests);
}

function simpleFlatten(data) {
    return data.reduce((acc, list) => {
        return [...acc, ...list];
    }, []);
}

function combineAddress(addr) {
    return [
        addr.zipCode,
        addr.country,
        addr.city,
        addr.streetAddress
    ].join(', ');
}

function combineAddressLens(data) {
    const addressLens = lensProp('address');
    // const addressMapper = partial(over, [addressLens, combineAddress]);

    return data.map(d => over(addressLens, combineAddress, d));
}

function combineAddressSimple(data) {
    const results = Array(data.length);

    for (let i = data.length - 1; i >= 0; i--) {
        results[i] = {
            ...data[i],
            address: combineAddress(data[i].address)
        };
    }

    return results;
}

Promise.resolve()
    .then(mark('load-start'))
    .then(loadFiles)
    .then(mark('load-end'))
    .then(mark('flatten-start'))
    .then(flatten)
    .then(mark('flatten-end'))
    .then(data => {
        const sortByUpdated = sortBy(prop('updatedAt'));

        return Promise.resolve(data)
            .then(mark('processing-start'))
            .then(groupBy(u => u.address.country))
            .then(map(sortByUpdated))
            .then(mark('processing-end'))
            .then(data => {
                log(`${Object.keys(data).length} unique countries`);
            })
            .then(() => data);
    })
    .then(mark('combine-start'))
    .then(combineAddressSimple)
    .then(mark('combine-end'))
    .then(measure('flatten', 'flatten-start', 'flatten-end'))
    .then(measure('load', 'load-start', 'load-end'))
    .then(measure('processing', 'processing-start', 'processing-end'))
    .then(measure('combine address', 'combine-start', 'combine-end'))
    .then(printMeasures);
