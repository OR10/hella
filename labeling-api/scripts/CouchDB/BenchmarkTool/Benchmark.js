const PouchDB = require('pouchdb-node');

const couchDbDatabase = 'http://admin:bar@192.168.222.20:5984/';
const numberOfDatabasesToTest = 300;
const numberOfDocumentsToWritePerDatabase = 400;

const startDate = Math.floor(Date.now() / 1000);
let runtimeWrittenDocuments = 0;
let databases = [];

class Benchmark {
    run() {
        this.setUp();

        const promises = [];
        databases.forEach(db => {
            promises.push(this.doBenchmark(db));
        });

        Promise.all(promises)
            .then(() => this.tearDown());
    }

    _logString(string) {
        console.error(string);
    }

    doBenchmark(db) {
        db.db.post({
            incomplete: false,
            projectId: "7e90a35e5a9cf37cc3676e570e220b36",
            taskId: "7e90a35e5a9cf37cc3676e570e23c675",
            createdAt: "2017-11-13 10:06:13.000000",
            lastModifiedAt: "2017-11-13 10:06:15.000000",
            frameIndex: 0,
            identifierName: "time-range-sign",
            labeledThingId: "5d85ca0a92784891bd9259b83a31277e",
            type: "AppBundle.Model.LabeledThingInFrame",
            classes: [
                "20"
            ],
            shapes: [
                {
                    type: "cuboid3d",
                    id: "a412add9273d414b8f1ffe94f374486e",
                    vehicleCoordinates: [
                        [
                            6.640499421196539,
                            1.9059620678295315,
                            1.6991350278647057
                        ],
                        [
                            5.004274273830605,
                            -0.13115702334178536,
                            1.6991350278647057
                        ],
                        [
                            5.004274273830605,
                            -0.13115702334178536,
                            0
                        ],
                        [
                            6.640499421196539,
                            1.9059620678295315,
                            0
                        ],
                        [
                            7.420147660812988,
                            1.2797443561166064,
                            1.6991350278647057
                        ],
                        [
                            5.783922513447054,
                            -0.7573747350547103,
                            1.6991350278647057
                        ],
                        [
                            5.783922513447054,
                            -0.7573747350547103,
                            0
                        ],
                        [
                            7.420147660812988,
                            1.2797443561166064,
                            0
                        ]
                    ]
                }
            ]
        });
        db.writtenDocuments++;
        runtimeWrittenDocuments++;

        return new Promise((resolve) => setTimeout(resolve, this._getRandomIntInclusive(1000, 3000)))
            .then(() => db.db.replicate.to(couchDbDatabase + db.db.name)
                .then(() => {
                    this._logString((numberOfDocumentsToWritePerDatabase * numberOfDatabasesToTest) - runtimeWrittenDocuments);
                    if (db.writtenDocuments === numberOfDocumentsToWritePerDatabase) {
                        return Promise.resolve();
                    } else {
                        return this.doBenchmark(db);
                    }
                })
            );
    }

    setUp() {
        this._logString('setUp');
        let i = 0;
        while (i < numberOfDatabasesToTest) {
            const db = new PouchDB('benchmark' + i);
            databases.push({
                db: db,
                writtenDocuments: 0,
            });

            i++;
        }
        this._logString('setUp completed');
    }

    tearDown() {
        this._logString('tearDown');
        databases.forEach(db => {
            const remoteDb = new PouchDB(couchDbDatabase + db.db.name);
            remoteDb.destroy();
            db.db.destroy();
        });
        this._logString('tearDown completed');
        this._logString(runtimeWrittenDocuments + ' documents written in ' + (Math.floor(Date.now() / 1000) - startDate) + 's');
    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

const benchmark = new Benchmark;
benchmark.run();