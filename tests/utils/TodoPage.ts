import { Page, Locator, expect } from '@playwright/test';

/**
 * TodoPage – Page Object Model for the Playwright TodoMVC demo app.
 *
 * Page Object Models are a core SDET pattern: they abstract UI interactions
 * into reusable methods so tests stay readable and maintainable. If the UI
 * changes, you update the POM in one place rather than every test.
 */
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly todoCount: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.todoCount = page.locator('.todo-count');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(items: string[]) {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  async completeTodo(text: string) {
    await this.todoItems
      .filter({ hasText: text })
      .getByRole('checkbox')
      .check();
  }

  async deleteTodo(text: string) {
    const item = this.todoItems.filter({ hasText: text });
    await item.hover();
    await item.getByRole('button', { name: 'Delete' }).click();
  }

  async editTodo(originalText: string, newText: string) {
    const item = this.todoItems.filter({ hasText: originalText });
    await item.dblclick();
    const editInput = item.getByRole('textbox');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  async filterBy(filter: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name: filter }).click();
  }

  async getVisibleTodoTexts(): Promise<string[]> {
    return this.todoItems.allTextContents();
  }

  async assertTodoCount(expected: number) {
    const countText = await this.todoCount.textContent();
    const actual = parseInt(countText?.match(/\d+/)?.[0] ?? '0');
    expect(actual).toBe(expected);
  }
}
