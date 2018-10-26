import Immutable from 'immutable';

function getLogger() {
    const logger = document.getElementById('logger');

    if (logger) {
        return logger;
    }

    const container = document.createElement('pre');

    container.setAttribute('id', 'logger');

    document.body.insertBefore(container, document.body.firstChild);

    return container;
}

function log(msg) {
    const logger = getLogger();

    logger.appendChild(document.createTextNode(msg + '\n'));
}

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
            log(`${entry.name} — ${entry.duration.toFixed(2)}ms`);
        });
}

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
    return data.groupBy(d => d.get('address').get('city'));
}

Promise.resolve()
    .then(mark('load-start'))
    .then(loadFiles)
    .then(mark('load-end'))
    .then(mark('flatten-start'))
    .then(flatten)
    .then(mark('flatten-end'))
    .then(mark('processing-start'))
    .then(groupByCity)
    .then(mark('processing-end'))
    .then(data => {
        const cities = data.keys();

        log(`${cities.size} unique cities`);
    })
    .then(measure('flatten', 'flatten-start', 'flatten-end'))
    .then(measure('load', 'load-start', 'load-end'))
    .then(measure('processing', 'processing-start', 'processing-end'))
    .then(printMeasures);
