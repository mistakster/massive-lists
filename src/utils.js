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

export function log(msg) {
    const logger = getLogger();

    logger.appendChild(document.createTextNode(msg + '\n'));
}

export function mark(name) {
    return data => {
        performance.mark(name);

        return data;
    }
}

export function measure(name, startMark, endMark) {
    return data => {
        performance.measure(name, startMark, endMark);

        return data;
    }
}

export function printMeasures() {
    performance.getEntriesByType('measure')
        .forEach(entry => {
            log(`${entry.name} — ${entry.duration.toFixed(2)}ms`);
        });
}
