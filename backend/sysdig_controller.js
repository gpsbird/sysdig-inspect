var spawn = require('child_process').spawn;

const g_sysdigExe = "c:\\windump\\GitHub\\sysdig\\build\\Debug\\csysdig.exe";
const g_sysdigDir = "c:\\windump\\GitHub\\sysdig\\build\\Debug\\";
const EOF = 255;

class SysdigController {
    //
    // Exectues csysdig
    // Input: the array of command line arguments to use.
    // Output: the spawned child process.
    //
    launchCsysdig(args) {
        var options = {cwd: g_sysdigDir};
        this.lasterr = '';

        this.prc = spawn(g_sysdigExe, args, options);

//        this.prc.stdout.setEncoding('utf8');
//        this.prc.stderr.setEncoding('utf8');
/*
        this.prc.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        this.prc.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        this.prc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
*/        
    }

    sendError(response, message) {
        var resBody = {reason: message};

        response.status(500);
        response.send(JSON.stringify(resBody));
    }

    run(args, response) {
        this.launchCsysdig(args);

        this.prc.on('error', (err) => {
            this.sendError(response, "cannot execute " + g_sysdigExe + ", make sure the program is properly installed");
        });

//        this.prc.stdout.pipe(response);
        this.prc.stdout.on('data', (data) => {
            console.log(`stderr: ${data}`);

            if(data[data.length - 1] == EOF) {
                var sldata = data.slice(0, data.length - 1);
                response.write(sldata);
                response.end();
            } else {
                response.write(data);                
            }
        });

        this.prc.stderr.on('data', (data) => {
            this.sendError(response, data);
        });        

        this.prc.on('close', (code) => {
            response.end();
            console.log(`child process exited with code ${code}`);
        });
    }
}

module.exports = new SysdigController();
