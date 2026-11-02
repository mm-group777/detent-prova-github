import { expect, test as base } from '@playwright/test';

type Fixtures = {
  taskData: { projectName: string };
};

export const test = base.extend<Fixtures>({
  taskData: async ({}, use, testInfo) => {
    await use({ projectName: `project-${testInfo.workerIndex}-${Date.now()}` });
  },
});

export { expect };
