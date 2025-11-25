import { describe, it, expect, beforeEach } from 'vitest';
import { TodoStorage } from '../../utils/todoStorage';

describe('TodoStorage - Advanced Features', () => {
    let storage: TodoStorage;

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        storage = TodoStorage.getInstance();
        storage.clearAll();
    });

    it('should update todo text', () => {
        const todo = storage.addTodo('Original Text');
        const updated = storage.updateTodo(todo.id, 'Updated Text');

        expect(updated?.text).toBe('Updated Text');
        expect(storage.getTodos()[0].text).toBe('Updated Text');
    });

    it('should return null when updating non-existent todo', () => {
        const updated = storage.updateTodo('fake-id', 'New Text');
        expect(updated).toBeNull();
    });
});
