import mustache from 'mustache';
import range from 'ramda/es/range';
import forEach from 'ramda/es/forEach';
import map from 'ramda/es/map';
import filter from 'ramda/es/filter';
import flatten from 'ramda/es/flatten';
import groupBy from 'ramda/es/groupBy';
import lensProp from 'ramda/es/lensProp';
import over from 'ramda/es/over';
import prop from 'ramda/es/prop';
import sortBy from 'ramda/es/sortBy';
import compose from 'ramda/es/compose';
import toPairs from 'ramda/es/toPairs';
import reduce from 'ramda/es/reduce';
import { mark, measure, printMeasures, log } from './utils';

function loadFiles() {
    const requests = range(0, 1)
        .map(n => (
            fetch(`/data/1e4/${n}.json`)
                .then(res => res.json())
        ));

    return Promise.all(requests);
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

    return data.map(d => over(addressLens, combineAddress, d));
}

const sortByUpdated = sortBy(prop('updatedAt'));

function render(data) {
    const template = `
{{#data}}
    <div class="country">
        <h3 class="country__title">{{ 0 }}</h3>    
        <div class="country__users">
            {{#1}}
                <div data-id="{{id}}" class="user">
                    <p>{{firstName}} {{lastName}}</p>
                    <p>{{address}}</p>
                    <p>{{phone}}</p>                
                </div>
            {{/1}}        
        </div>    
    </div>
{{/data}}    
`;

    const container = document.querySelector('.js-list');

    container.innerHTML = mustache.render(template, {
        data: toPairs(data)
    });

    return data;
}

Promise.resolve()
    .then(loadFiles)
    .then(flatten)
    .then(groupBy(u => u.address.country))
    .then(map(compose(sortByUpdated, combineAddressLens)))
    .then(mark('render-start'))
    .then(render)
    .then(mark('render-end'))
    .then(measure('render', 'render-start', 'render-end'))
    .then(data => {
        document
            .querySelector('.js-toggle')
            .addEventListener('click', () => {
                forEach(
                    u => u.classList.toggle('user_hidden'),
                    document.querySelectorAll('.user')
                );
            });

        document
            .querySelector('.js-filter')
            .addEventListener('keyup', (e) => {
                const value = e.currentTarget.value.toLowerCase();

                function matchUser(v) {
                    return user => {
                        if (!v) {
                            return true;
                        }

                        return (
                            user.firstName.toLowerCase().indexOf(v) === 0 ||
                            user.lastName.toLowerCase().indexOf(v) === 0
                        );
                    };
                }

                const filteredData = filter(
                    g => g.length,
                    map(
                        c => filter(matchUser(value), c),
                        data
                    )
                );

                render(filteredData);
            });
    });
