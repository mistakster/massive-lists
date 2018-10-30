import Immutable from 'immutable';
import { mark, measure, printMeasures, log } from './utils';

function loadFiles() {
    const requests = Immutable.Range(0, 10)
        .map(n => (
            fetch(`/data/1e4/${n}.json`)
                .then(res => res.json())
                .then(Immutable.fromJS)
        ));

    return Promise.all(requests);
}

function flatten(data) {
    return Immutable.List(data).flatten(true);
}

function groupByCity(data) {
    return data.groupBy(d => d.get('address').get('country'));
}

function sortByUpdated(data) {
    return data.map(list => list.sortBy(user => user.get('updatedAt')));
}

function combineAddress(data) {
    return data.map(d => d.update(
        'address',
        addr => ([
            addr.get('zipCode'),
            addr.get('country'),
            addr.get('city'),
            addr.get('streetAddress')
        ].join(', '))
    ));
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
            .then(groupByCity)
            .then(sortByUpdated)
            .then(mark('processing-end'))
            .then(data => {
                log(`${data.size} unique countries`);
            })
            .then(() => data);
    })
    .then(mark('combine-start'))
    .then(combineAddress)
    .then(mark('combine-end'))
    .then(measure('flatten', 'flatten-start', 'flatten-end'))
    .then(measure('load', 'load-start', 'load-end'))
    .then(measure('processing', 'processing-start', 'processing-end'))
    .then(measure('combine address', 'combine-start', 'combine-end'))
    .then(printMeasures);
