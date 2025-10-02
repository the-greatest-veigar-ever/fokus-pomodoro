export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoStorageData {
  todos: TodoItem[];
  expiresAt: number;
}

const STORAGE_KEY = 'fokus_todos';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class TodoStorage {
  private static instance: TodoStorage;
  private todos: TodoItem[] = [];

  private constructor() {
    this.loadTodos();
  }

  public static getInstance(): TodoStorage {
    if (!TodoStorage.instance) {
      TodoStorage.instance = new TodoStorage();
    }
    return TodoStorage.instance;
  }

  private loadTodos(): void {
    try {
      // Try sessionStorage first (automatically clears when tab closes)
      let saved = sessionStorage.getItem(STORAGE_KEY);

      if (!saved) {
        // Fallback to localStorage with expiration check
        saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const data: TodoStorageData = JSON.parse(saved);

          // Check if data has expired
          if (Date.now() > data.expiresAt) {
            this.clearExpiredData();
            return;
          }

          this.todos = data.todos || [];

          // Migrate to sessionStorage for better UX
          this.saveTodos();
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        const data: TodoStorageData = JSON.parse(saved);
        this.todos = data.todos || [];
      }
    } catch (error) {
      console.warn('Failed to load todos:', error);
      this.todos = [];
    }
  }

  private saveTodos(): void {
    try {
      const data: TodoStorageData = {
        todos: this.todos,
        expiresAt: Date.now() + CACHE_DURATION
      };

      // Save to sessionStorage (primary)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Also save to localStorage as backup for 24-hour persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save todos:', error);
    }
  }

  private clearExpiredData(): void {
    this.todos = [];
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  public addTodo(text: string): TodoItem {
    const todo: TodoItem = {
      id: this.generateId(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };

    this.todos.unshift(todo); // Add to beginning
    this.saveTodos();
    return todo;
  }

  public toggleTodo(id: string): TodoItem | null {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      return todo;
    }
    return null;
  }

  public deleteTodo(id: string): boolean {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      this.saveTodos();
      return true;
    }
    return false;
  }

  public updateTodo(id: string, text: string): TodoItem | null {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text.trim();
      this.saveTodos();
      return todo;
    }
    return null;
  }

  public getTodos(): TodoItem[] {
    return [...this.todos];
  }

  public getActiveTodos(): TodoItem[] {
    return this.todos.filter(todo => !todo.completed);
  }

  public getCompletedTodos(): TodoItem[] {
    return this.todos.filter(todo => todo.completed);
  }

  public getTodoCount(): { total: number; active: number; completed: number } {
    const total = this.todos.length;
    const completed = this.todos.filter(todo => todo.completed).length;
    const active = total - completed;

    return { total, active, completed };
  }

  public clearCompleted(): number {
    const completedCount = this.todos.filter(todo => todo.completed).length;
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveTodos();
    return completedCount;
  }

  public clearAll(): void {
    this.todos = [];
    this.saveTodos();
  }

  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for cache management
  public getCacheInfo(): {
    expiresAt: number;
    timeRemaining: number;
    isExpired: boolean;
    totalItems: number;
  } {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: TodoStorageData = JSON.parse(saved);
        const timeRemaining = Math.max(0, data.expiresAt - Date.now());
        const isExpired = timeRemaining === 0;

        return {
          expiresAt: data.expiresAt,
          timeRemaining,
          isExpired,
          totalItems: this.todos.length
        };
      }
    } catch (error) {
      console.warn('Failed to get cache info:', error);
    }

    return {
      expiresAt: Date.now() + CACHE_DURATION,
      timeRemaining: CACHE_DURATION,
      isExpired: false,
      totalItems: this.todos.length
    };
  }

  public getTimeUntilExpiry(): string {
    const { timeRemaining } = this.getCacheInfo();

    if (timeRemaining <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  // Clean up expired data on app startup
  public static cleanupExpiredData(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: TodoStorageData = JSON.parse(saved);
        if (Date.now() > data.expiresAt) {
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup expired data:', error);
    }
  }
}