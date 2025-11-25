import { describe, it, expect, beforeEach } from 'vitest';
import { TodoStorage } from '../../utils/todoStorage';

// Mock TodoStorage since TodoList depends on it
// We'll test the storage logic through the singleton for now or mock it
// Ideally we should refactor TodoList to accept storage as dependency, but for now we'll test TodoStorage directly or integration
// Let's test TodoStorage logic first as it's the core data logic

describe('TodoStorage', () => {
    let storage: TodoStorage;

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        storage = TodoStorage.getInstance();
        storage.clearAll();
    });

    it('should add todo', () => {
        const todo = storage.addTodo('Test Task');
        expect(todo.text).toBe('Test Task');
        expect(storage.getTodos()).toHaveLength(1);
    });

    it('should delete todo', () => {
        const todo = storage.addTodo('Test Task');
        storage.deleteTodo(todo.id);
        expect(storage.getTodos()).toHaveLength(0);
    });

    it('should toggle todo completion', () => {
        const todo = storage.addTodo('Test Task');
        const updated = storage.toggleTodo(todo.id);
        expect(updated?.completed).toBe(true);
    });
});
