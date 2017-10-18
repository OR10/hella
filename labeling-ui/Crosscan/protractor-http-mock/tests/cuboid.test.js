describe('named params match', function () {
    var http;

    beforeAll(function () {
        http = window.__getHttp();
    });

    it('matches named params path', function (done) {
        http.get('/some/arbitrarily-named/param/with/12345').then(function (response) {
            expect(response.data).toBe('named params match');
            done();
        });
    });

    it('injects named params from path into response', function (done) {
        http.get('/some/arbitrarily-named/param/with/12345').then(function (response) {
            expect(response.named).toBe('arbitrarily-named');
            expect(response.value).toBe('12345');
            done();
        });
    });

    it('matches named params params', function (done) {
        http.get('/named/params/params', {
            params: {
                skip: '0',
                limit: '23',
            }
        }).then(function (response) {
            expect(response.data).toBe('named params params match');
            done();
        });
    });

    it('injects named named params from params into response', function (done) {
        http.get('/named/params/params', {
            params: {
                skip: '0',
                limit: '23',
            }
        }).then(function (response) {
            expect(response.skip).toBe('0');
            expect(response.limit).toBe('23');
            done();
        });
    });

    it('matches named params params in alternative order', function (done) {
        http.get('/named/params/params', {
            params: {
                limit: '42',
                skip: '23',
            }
        }).then(function (response) {
            expect(response.skip).toBe('23');
            expect(response.limit).toBe('42');
            done();
        });
    });

    it('matches named params data', function (done) {
        http.put('/named/params/data', {
            'id': 'abcdefg',
            'body': 'awesome body',
        }).then(function (response) {
            expect(response.data).toBe('named params data match');
            done();
        });
    });

    it('injects named params from data into response', function (done) {
        http.put('/named/params/data', {
            'id': 'abcdefg',
            'body': 'awesome body',
        }).then(function (response) {
            expect(response.id).toBe('abcdefg');
            expect(response.body).toBe('awesome body');
            done();
        });
    });

    it('matches named params data in alternative order', function (done) {
        http.put('/named/params/data', {
            'body': 'awesome body',
            'id': 'abcdefg',
        }).then(function (response) {
            expect(response.id).toBe('abcdefg');
            expect(response.body).toBe('awesome body');
            done();
        });
    });

    it('does not match with extra param', function(done) {
        http.get('/named/params/params', {
            params: {
                skip: '0',
                limit: '23',
                somethingElse: 'someOtherParam',
            }
        }).then(function (response) {
            fail('Request should not have matched any mock: ' + JSON.stringify(response));
        });

        // Should be enough to ensure the internal timeout is handled.
        setTimeout(function () {
            expect(true).toBe(true);
            done();
        }, 250);
    });

    it('does not match with extra data', function(done) {
        http.put('/named/params/data', {
            'body': 'awesome body',
            'id': 'abcdefg',
            'foo': 'bar',
        }).then(function (response) {
            fail('Request should not have matched any mock: ' + JSON.stringify(response));
        });

        // Should be enough to ensure the internal timeout is handled.
        setTimeout(function () {
            expect(true).toBe(true);
            done();
        }, 250);
    });

    it('injects named params from path into response inline string', function (done) {
        http.get('/named/inline/string/will-tell/42').then(function (response) {
            expect(response.data).toBe('I will-tell you 42 times');
            done();
        });
    });

    it('does not match with namedParams disabled', function(done) {
        http.put('/non/named/params', {
            'id': 'abcdefg',
        }).then(function (response) {
            fail('Request should not have matched any mock: ' + JSON.stringify(response));
        });

        // Should be enough to ensure the internal timeout is handled.
        setTimeout(function () {
            expect(true).toBe(true);
            done();
        }, 250);
    });

    it('does match "normally" with namedParams disabled', function(done) {
        http.put('/non/named/params', {
            id: '{{:id}}',
        }).then(function (response) {
            expect(response.data).toBe('The id is: {{id}}');
            done();
        });
    });
});
