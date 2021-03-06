import * as fs from 'fs-extra';
import * as childProcess from 'child_process';




(async () => {
    try {
        // Remove current build
        await remove('./dist/');

        await exec('webpack --config ./webpack/webpack.backend.prod.js', './');
        await exec('webpack --config ./webpack/webpack.frontend.prod.js', './');
        await copy('./src/public/sounds', './dist/public/sounds');
        await copy('./src/public/NuzhdikiSound', './dist/public/NuzhdikiSound');
    } catch (err) {
        console.error(err);
    }
})();


function remove(loc: string): Promise<void> {
    return new Promise((res, rej) => {
        return fs.remove(loc, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}


function copy(src: string, dest: string): Promise<void> {
    return new Promise((res, rej) => {
        return fs.copy(src, dest, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}


function exec(cmd: string, loc: string): Promise<void> {
    return new Promise((res, rej) => {
        return childProcess.exec(cmd, {cwd: loc}, (err, stdout, stderr) => {
            if (!!stdout) {
                console.info(stdout);
            }
            if (!!stderr) {
                console.warn(stderr);
            }
            return (!!err ? rej(err) : res());
        });
    });
}
