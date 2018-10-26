import range from 'ramda/es/range';
import flatten from 'ramda/es/flatten';
import groupBy from 'ramda/es/groupBy';
import lensProp from 'ramda/es/lensProp';
import over from 'ramda/es/over';
import partial from 'ramda/es/partial';
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
    const addressMapper = partial(over, [addressLens, combineAddress]);

    return data.map(addressMapper);
}

function combineAddressSimple(data) {
    return data.map(d => {
        return {
            ...d,
            address: combineAddress(d.address)
        };
    });
}

Promise.resolve()
    .then(mark('load-start'))
    .then(loadFiles)
    .then(mark('load-end'))
    .then(mark('flatten-start'))
    .then(flatten)
    .then(mark('flatten-end'))
    .then(data => {
        return Promise.resolve(data)
            .then(mark('processing-start'))
            .then(groupBy(u => u.address.city))
            .then(mark('processing-end'))
            .then(data => {
                const cities = Object.keys(data);

                log(`${cities.length} unique cities`);
            })
            .then(() => data);
    })
    .then(mark('combine-start'))
    .then(combineAddressLens)
    .then(mark('combine-end'))
    .then(measure('flatten', 'flatten-start', 'flatten-end'))
    .then(measure('load', 'load-start', 'load-end'))
    .then(measure('processing', 'processing-start', 'processing-end'))
    .then(measure('combine address', 'combine-start', 'combine-end'))
    .then(printMeasures);
