import { test, expect } from '@playwright/test';

test('user can sign up, create a project, create a ticket, and see it appear', async ({ page }) => {
  const uniqueSuffix = Date.now();
  const email = `e2e-${uniqueSuffix}@example.com`;
  const projectName = `E2E Project ${uniqueSuffix}`;
  const ticketTitle = `E2E ticket ${uniqueSuffix}`;

  // 1) Sign up a brand new account
  await page.goto('/signup');
  await page.locator('input[name="name"]').fill('E2E Test User');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill('Password1');
  await page.locator('input[name="confirm"]').fill('Password1');
  await page.getByRole('button', { name: /sign up/i }).click();

  // 2) Successful signup logs the user in and redirects to the protected dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // 3) Jump to Projects from the dashboard quick action
  await page.getByRole('link', { name: 'New Ticket' }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

  // 4) Create a project
  await page.getByRole('button', { name: 'New Project' }).click();
  await page.getByPlaceholder('e.g. Website Redesign').fill(projectName);
  await page.getByRole('button', { name: 'Create Project' }).click();

  // 5) Open the new project's board
  await page.getByText(projectName).click();
  await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

  // 6) Create a ticket on the board
  await page.getByRole('button', { name: 'New Ticket' }).click();
  await page.getByPlaceholder('Enter task title...').fill(ticketTitle);
  await page.getByRole('button', { name: 'Create Task' }).click();

  // 7) The new ticket appears in the board with its title
  await expect(page.getByText(ticketTitle)).toBeVisible();
});

test('login rejects invalid credentials with an inline error', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('nobody@example.com');
  await page.locator('input[name="password"]').fill('wrongpassword');
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});
