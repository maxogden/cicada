var http = require('http');
var cicada = require('../');
var test = require('tap').test;
var spawn = require('child_process').spawn;

var repoDir = '/tmp/cicada-test/' + Math.random().toString(16).slice(2);
var ci = cicada(repoDir);
var server = http.createServer(ci.handle);

test('setup', function (t) {
    server.listen(0, t.end.bind(t));
});

test('push', function (t) {
    t.plan(6);
    
    ci.on('commit', function (commit) {
        t.equal(commit.repo, 'beep.git');
        var workDir = repoDir + '/work/';
        t.equal(commit.dir.slice(0, workDir.length), workDir);
        
        (function () {
            var ps = commit.spawn('ls');
            var data = '';
            ps.stdout.on('data', function (buf) { data += buf });
            ps.on('close', function (code) {
                t.equal(code, 0);
                t.equal(data, 'robot.txt\n');
            });
        })();
        
        (function () {
            var ps = commit.spawn('pwd');
            var data = '';
            ps.stdout.on('data', function (buf) { data += buf });
            ps.on('close', function (code) {
                t.equal(code, 0);
                t.equal(data, commit.dir + '\n');
            });
        })();
    });
    
    spawn(__dirname + '/push.sh', [
        'http://localhost:' + server.address().port + '/beep.git'
    ]);
});

test('teardown', function (t) {
    server.close();
    t.end();
});
