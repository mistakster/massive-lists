import range from 'ramda/es/range';
import flatten from 'ramda/es/flatten';

function mark(name) {
    return data => {
        performance.mark(name);

        return data;
    }
}

function measure(name, startMark, endMark) {
    return data => {
        performance.measure(name, startMark, endMark);

        return data;
    }
}

function printMeasures() {
    performance.getEntriesByType('measure')
        .forEach(entry => {
            console.log(`${entry.name} — ${entry.duration.toFixed(2)}ms`);
        });
}

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

Promise.resolve()
    .then(mark('load-start'))
    .then(loadFiles)
    .then(mark('load-end'))
    .then(mark('flatten-start'))
    .then(simpleFlatten)
    .then(mark('flatten-end'))
    .then(mark('processing-start'))
    .then(data => {
        console.log(data.length);
        return data.map(d => d.id)
    })
    .then(mark('processing-end'))
    .then(measure('flatten', 'flatten-start', 'flatten-end'))
    .then(measure('load', 'load-start', 'load-end'))
    .then(measure('processing', 'processing-start', 'processing-end'))
    .then(printMeasures);
