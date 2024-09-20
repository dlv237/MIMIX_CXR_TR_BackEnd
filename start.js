const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function deploy() {
    const { stdout: installStdout, output1 } = await exec('yarn install');
    console.log("installing dependencies...");
    console.log(output1);

    const { stdout: migrateStdout, output2 } = await exec('yarn db:migrate');
    console.log("migrating database...");
    console.log(output2);

    const { stdout: seedStdout, output3 } = await exec('yarn db:seed');
    console.log("seeding database...");
    console.log(output3);
}

deploy();