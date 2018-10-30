const { mocker } = require('mocker-data-generator');

const user = {
    id: {
        faker: 'random.uuid'
    },
    firstName: {
        faker: 'name.firstName'
    },
    lastName: {
        faker: 'name.lastName'
    },
    address: {
        country: {
            faker: 'address.country'
        },
        city: {
            faker: 'address.city'
        },
        streetAddress: {
            faker: 'address.streetAddress'
        },
        zipCode: {
            faker: 'address.zipCode'
        }
    },
    phone: {
        faker: 'phone.phoneNumber'
    },
    createdAt: {
        faker: 'date.past'
    },
    updatedAt: {
        faker: 'date.recent'
    }
};

mocker()
    .schema('items', user, Number(count))
    .build()
    .then(data => {
        process.exit(0);
    })
    .catch(err => {
        console.log(err);

        process.exit(1);
    });
