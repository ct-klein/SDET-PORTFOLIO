import { test, expect } from '@playwright/test';
import { TodoPage } from '../utils/TodoPage';

/**
 * E2E Test Suite: TodoMVC Application
 *
 * Demonstrates:
 *  - Page Object Model pattern for maintainable tests
 *  - beforeEach hooks for clean test isolation
 *  - Data-driven testing (parameterized inputs)
 *  - Positive AND negative test cases
 *  - Accessibility-aware locators (getByRole, getByPlaceholder)
 *  - Assertions against UI state, not just element presence
 */

test.describe('Todo App – Core Functionality', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  // ─── CREATION ────────────────────────────────────────────────────────────────

  test('should add a single todo item', async () => {
    await todoPage.addTodo('Buy groceries');
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText('Buy groceries');
  });

  test('should add multiple todo items and display them all', async () => {
    const items = ['Write tests', 'Review PR', 'Deploy to staging'];
    await todoPage.addTodos(items);
    await expect(todoPage.todoItems).toHaveCount(3);
    await todoPage.assertTodoCount(3);
  });

  test('should not add an empty todo item', async ({ page }) => {
    await todoPage.newTodoInput.fill('   '); // whitespace only
    await todoPage.newTodoInput.press('Enter');
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  // ─── COMPLETION ──────────────────────────────────────────────────────────────

  test('should mark a todo as complete', async ({ page }) => {
    await todoPage.addTodo('Automate regression suite');
    await todoPage.completeTodo('Automate regression suite');

    const item = todoPage.todoItems.first();
    await expect(item).toHaveClass(/completed/);
    await todoPage.assertTodoCount(0); // counter should drop to 0
  });

  test('should uncheck a completed todo', async () => {
    await todoPage.addTodo('Write API tests');
    await todoPage.completeTodo('Write API tests');
    // uncheck
    await todoPage.todoItems.first().getByRole('checkbox').uncheck();
    await todoPage.assertTodoCount(1);
  });

  // ─── EDITING ─────────────────────────────────────────────────────────────────

  test('should edit an existing todo item', async () => {
    await todoPage.addTodo('Write unit tests');
    await todoPage.editTodo('Write unit tests', 'Write integration tests');
    await expect(todoPage.todoItems.first()).toContainText('Write integration tests');
  });

  // ─── DELETION ────────────────────────────────────────────────────────────────

  test('should delete a todo item', async () => {
    await todoPage.addTodos(['Keep this', 'Delete this']);
    await todoPage.deleteTodo('Delete this');
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText('Keep this');
  });

  // ─── FILTERING ───────────────────────────────────────────────────────────────

  test.describe('Filtering', () => {
    test.beforeEach(async () => {
      await todoPage.addTodos(['Active task', 'Completed task']);
      await todoPage.completeTodo('Completed task');
    });

    test('should show only active items when Active filter selected', async () => {
      await todoPage.filterBy('Active');
      const texts = await todoPage.getVisibleTodoTexts();
      expect(texts).toContain('Active task');
      expect(texts).not.toContain('Completed task');
    });

    test('should show only completed items when Completed filter selected', async () => {
      await todoPage.filterBy('Completed');
      const texts = await todoPage.getVisibleTodoTexts();
      expect(texts).toContain('Completed task');
      expect(texts).not.toContain('Active task');
    });

    test('should show all items when All filter selected', async () => {
      await todoPage.filterBy('Completed');
      await todoPage.filterBy('All');
      await expect(todoPage.todoItems).toHaveCount(2);
    });
  });

  // ─── BULK ACTIONS ────────────────────────────────────────────────────────────

  test('should clear all completed items', async ({ page }) => {
    await todoPage.addTodos(['Task A', 'Task B', 'Task C']);
    await todoPage.completeTodo('Task A');
    await todoPage.completeTodo('Task B');

    await todoPage.clearCompletedButton.click();
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toContainText('Task C');
  });
});

// ─── DATA-DRIVEN TESTS ─────────────────────────────────────────────────────────
// Parameterized tests show SDETs can think systematically about edge cases.

const edgeCaseInputs = [
  { label: 'long text',       input: 'A'.repeat(200) },
  { label: 'special chars',   input: '<script>alert("xss")</script>' },
  { label: 'unicode',         input: '📋 Test task with emoji 🚀' },
  { label: 'numbers only',    input: '12345' },
];

for (const { label, input } of edgeCaseInputs) {
  test(`should handle edge case input: ${label}`, async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.addTodo(input);
    await expect(todoPage.todoItems).toHaveCount(1);
    // Critically: verify the text is displayed as-is, not interpreted
    await expect(todoPage.todoItems.first()).toContainText(
      input.substring(0, 50) // check at least the first 50 chars
    );
  });
}
