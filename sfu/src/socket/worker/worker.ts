import { config } from '@sfu/core/config';
import * as mediasoup from 'mediasoup';

const workers: Array<mediasoup.types.Worker> = [];
let nextWorkerIndex : number = 0;

export const createWorkers = async () => {
      try {
        const numWorkers = config.numWorkers;

        if (workers.length > 0) {
            throw new Error('[startWorkers] Workers already exist!')
        }

        for (let i = 0; i < numWorkers; i++) {
            const worker = await mediasoup.createWorker({
              logLevel: config.mediasoup.worker.logLevel,
              logTags: config.mediasoup.worker.logTags,
              rtcMinPort: config.mediasoup.worker.rtcMinPort,
              rtcMaxPort: config.mediasoup.worker.rtcMaxPort
            });

            worker.once('died', () => {
                console.error('worker::died [pide:%d] exiting in 2 seconds...', worker.pid);
                setTimeout(() => process.exit(1), 2000);
            });

            workers.push(worker);
        };
    }
    catch (error) {
        console.error('worker start error ! \n', error);
        process.exit(1);
    }
}


export function releaseWorkers() {
    for (const worker of workers) {
        worker.close();
    }
    workers.length = 0;
};



/** 
* Round robin worker selection 
* TODO: Consider using Least-Selected Algorithm 
* https://github.com/DOWN-LEE/RT_Study/blob/main/server/src/socket/worker/worker.ts
**/

export const getNextWorker = () : mediasoup.types.Worker => {
    const worker = workers[nextWorkerIndex];
    nextWorkerIndex = (nextWorkerIndex + 1) % workers.length;
    return worker;
}