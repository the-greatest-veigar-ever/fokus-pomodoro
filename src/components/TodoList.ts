import { TodoStorage, type TodoItem } from '../utils/todoStorage.js';

export class TodoList {
  private todoStorage: TodoStorage;
  private container: HTMLElement;
  private todoInput!: HTMLInputElement;
  private addButton!: HTMLButtonElement;
  private todoList!: HTMLElement;
  private todoCount: HTMLElement | null = null;

  constructor() {
    this.todoStorage = TodoStorage.getInstance();
    this.container = document.querySelector('.todo-section') as HTMLElement;

    if (!this.container) {
      throw new Error('Todo container not found');
    }

    this.initializeElements();
    this.bindEvents();
    this.render();

    // Clean up expired data on initialization
    TodoStorage.cleanupExpiredData();
  }

  private initializeElements(): void {
    this.todoInput = this.container.querySelector('.todo-input') as HTMLInputElement;
    this.addButton = this.container.querySelector('.add-todo-btn') as HTMLButtonElement;
    this.todoList = this.container.querySelector('.todo-list') as HTMLElement;
    this.todoCount = this.container.querySelector('.todo-count');

    if (!this.todoInput || !this.addButton || !this.todoList) {
      throw new Error('Required todo elements not found');
    }
  }

  private bindEvents(): void {
    // Add todo on button click
    this.addButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAddTodo();
    });

    // Add todo on Enter key (use keypress to avoid duplicate firing)
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleAddTodo();
      }
    });

    // Auto-resize input on mobile
    this.todoInput.addEventListener('input', () => {
      this.updateAddButtonState();
    });

    // Handle touch events for mobile
    this.setupTouchEvents();
  }

  private setupTouchEvents(): void {
    let touchStartX = 0;
    let touchStartTime = 0;
    let touchedElement: HTMLElement | null = null;

    this.todoList.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartTime = Date.now();
        touchedElement = (e.target as HTMLElement).closest('.todo-item');
      }
    }, { passive: true });

    this.todoList.addEventListener('touchend', (e) => {
      if (touchedElement && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchDuration = Date.now() - touchStartTime;
        const swipeDistance = touchStartX - touchEndX;

        // Swipe left to delete (minimum 50px swipe, maximum 500ms duration)
        if (swipeDistance > 50 && touchDuration < 500) {
          const todoId = touchedElement.dataset.todoId;
          if (todoId) {
            this.deleteTodo(todoId);
          }
        }
      }

      touchedElement = null;
    }, { passive: true });
  }

  private handleAddTodo(): void {
    const text = this.todoInput.value.trim();

    if (text === '') {
      this.showInputError('Please enter a task');
      return;
    }

    if (text.length > 200) {
      this.showInputError('Task is too long (max 200 characters)');
      return;
    }

    try {
      this.todoStorage.addTodo(text);
      this.todoInput.value = '';
      this.updateAddButtonState();
      this.render();
      this.showSuccessMessage('Task added successfully');

      // Focus back to input for quick adding
      this.todoInput.focus();
    } catch (error) {
      this.showInputError('Failed to add task');
      console.error('Error adding todo:', error);
    }
  }

  private updateAddButtonState(): void {
    const hasText = this.todoInput.value.trim().length > 0;
    this.addButton.disabled = !hasText;
    this.addButton.textContent = hasText ? 'Add' : 'Add Task';
  }

  private showInputError(message: string): void {
    this.todoInput.style.borderColor = '#EF4444';
    this.todoInput.placeholder = message;

    setTimeout(() => {
      this.todoInput.style.borderColor = '';
      this.todoInput.placeholder = 'Add a new task...';
    }, 2000);

    this.todoInput.focus();
  }

  private showSuccessMessage(_message: string): void {
    // Create a temporary success indicator
    const success = document.createElement('div');
    success.textContent = '✓';
    success.style.cssText = `
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--secondary-emerald);
      font-weight: bold;
      font-size: 18px;
      pointer-events: none;
      animation: fadeInOut 1s ease-in-out;
    `;

    this.todoInput.parentElement?.style.setProperty('position', 'relative');
    this.todoInput.parentElement?.appendChild(success);

    setTimeout(() => {
      success.remove();
    }, 1000);
  }

  private completeTodo(id: string): void {
    try {
      const todo = this.todoStorage.toggleTodo(id);
      if (todo) {
        this.render();
        this.animateCompletion(id, todo.completed);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }

  private deleteTodo(id: string): void {
    try {
      if (this.todoStorage.deleteTodo(id)) {
        this.animateRemoval(id);
        setTimeout(() => {
          this.render();
        }, 300);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  private animateCompletion(id: string, completed: boolean): void {
    const element = this.todoList.querySelector(`[data-todo-id="${id}"]`) as HTMLElement;
    if (element) {
      element.style.transform = completed ? 'scale(0.95)' : 'scale(1.05)';
      element.style.opacity = completed ? '0.7' : '1';

      setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
      }, 200);
    }
  }

  private animateRemoval(id: string): void {
    const element = this.todoList.querySelector(`[data-todo-id="${id}"]`) as HTMLElement;
    if (element) {
      element.style.animation = 'slideOut 0.3s ease-in forwards';
    }
  }

  private render(): void {
    const todos = this.todoStorage.getTodos();
    const counts = this.todoStorage.getTodoCount();

    // Update todo count if element exists
    if (this.todoCount) {
      this.todoCount.textContent = `${counts.active} active, ${counts.completed} completed`;
    }

    // Clear the list
    this.todoList.innerHTML = '';

    if (todos.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Render todos
    todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo);
      this.todoList.appendChild(todoElement);
    });

    // Update button state
    this.updateAddButtonState();
  }

  private renderEmptyState(): void {
    const emptyState = document.createElement('div');
    emptyState.className = 'todo-empty';
    emptyState.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">📝</div>
      <p>No tasks yet. Add one above to get started!</p>
      <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">
        Tasks are saved for 24 hours
      </p>
    `;
    this.todoList.appendChild(emptyState);
  }

  private createTodoElement(todo: TodoItem): HTMLElement {
    const todoElement = document.createElement('div');
    todoElement.className = 'todo-item';
    todoElement.dataset.todoId = todo.id;

    const isCompleted = todo.completed;
    const timeAgo = this.getTimeAgo(todo.createdAt);

    todoElement.innerHTML = `
      <div class="todo-text ${isCompleted ? 'completed' : ''}" title="Created ${timeAgo}">
        ${this.escapeHtml(todo.text)}
      </div>
      <div class="todo-actions">
        <button class="todo-btn complete-btn"
                data-action="toggle"
                data-id="${todo.id}"
                title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}"
                aria-label="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
          ${isCompleted ? '↶' : '✓'}
        </button>
        <button class="todo-btn delete-btn"
                data-action="delete"
                data-id="${todo.id}"
                title="Delete task"
                aria-label="Delete task">
          ✕
        </button>
      </div>
    `;

    // Add event listeners
    const completeBtn = todoElement.querySelector('[data-action="toggle"]') as HTMLButtonElement;
    const deleteBtn = todoElement.querySelector('[data-action="delete"]') as HTMLButtonElement;

    completeBtn.addEventListener('click', () => this.completeTodo(todo.id));
    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

    return todoElement;
  }

  private getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return new Date(timestamp).toLocaleDateString();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public methods for external interaction
  public addTodoFromExternal(text: string): boolean {
    try {
      this.todoStorage.addTodo(text);
      this.render();
      return true;
    } catch (error) {
      console.error('Error adding todo externally:', error);
      return false;
    }
  }

  public getTodoStats(): { total: number; active: number; completed: number } {
    return this.todoStorage.getTodoCount();
  }

  public clearCompleted(): number {
    const cleared = this.todoStorage.clearCompleted();
    this.render();
    return cleared;
  }

  public getCacheInfo(): string {
    return this.todoStorage.getTimeUntilExpiry();
  }

  // Method to refresh the display (useful for external updates)
  public refresh(): void {
    this.render();
  }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
      max-height: 60px;
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
      max-height: 0;
      padding: 0;
      margin: 0;
    }
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateY(-50%) scale(0.8); }
    50% { opacity: 1; transform: translateY(-50%) scale(1); }
  }

  .todo-item.removing {
    animation: slideOut 0.3s ease-in forwards;
  }

  .todo-input {
    transition: border-color 0.2s ease;
  }

  .todo-btn:active {
    transform: scale(0.95);
  }

  @media (hover: none) and (pointer: coarse) {
    .todo-item {
      touch-action: pan-x;
    }

    .todo-item:hover {
      transform: none;
    }
  }
`;

document.head.appendChild(style);