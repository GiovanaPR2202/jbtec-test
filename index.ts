import 'dotenv/config';
import debug from 'debug';

const logger = debug('core');

const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);
const load = delays.map(
(delay) => (): Promise<number> =>
new Promise((resolve) => {
setTimeout(() => resolve(Math.floor(delay / 100)), delay);
})
);

type Task = () => Promise<number>;

const throttle = async (workers: number, tasks: Task[]) => {
    const results: number[] = [];
    const runningTasks: Promise<void>[] = [];
    let currentIndex = 0;

    const runTask = async () => {
        const taskIndex = currentIndex++;
        if (taskIndex >= tasks.length) return;

        const task = tasks[taskIndex];
        const result = await task();
        results.push(result);

        
        if (currentIndex < tasks.length) {
            await runTask();
        }
    };

    
    for (let i = 0; i < Math.min(workers, tasks.length); i++) {
        runningTasks.push(runTask());
    }

    
    await Promise.all(runningTasks);
    
    return results;
};

const bootstrap = async () => {
logger('Starting...');
const start = Date.now();
const answers = await throttle(5, load);
logger('Done in %dms', Date.now() - start);
logger('Answers: %O', answers);
};

bootstrap().catch((err) => {
logger('General fail: %O', err);
});