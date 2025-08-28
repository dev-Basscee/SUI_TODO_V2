// /// Module: todo_list
// module todo_list::todo_list;

// use std::string::String;

// //Create todolist
// //add task to todolist
// //delete task from todolist
// //delete todo list

// /// list of todos. Can be managed by the owner and shared with others
// public struct TodoList has key, store {
//     id: UID,
//     name: String,
//     items: vector<String>,
// }

// ///create a new todo list
// public fun new(name: String, ctx: &mut TxContext): TodoList {
//     let list = TodoList {
//         id: object::new(ctx),
//         items: vector[],
//         name: name,
//     };

//     list
// }

// public fun add(list: &mut TodoList, item: String) {
//     list.items.push_back(item);
// }

// public fun remove(list: &mut TodoList, index: u64): String {
//     list.items.remove(index)
// }

// public fun delete(list: TodoList) {
//     let TodoList { id, items: _, name: _ } = list;
//     id.delete();
// }

// public fun length(list: &TodoList): u64 {
//     list.items.length()
// }

// public fun name(self: &TodoList): String {
//     self.name
// }
module todo_list::todo_list {

    use std::string::String;
    use std::vector;
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    /// =========================
    /// Original Struct
    /// =========================
    public struct TodoList has key, store {
        id: UID,
        name: String,
        items: vector<String>, // old storage still here for compatibility
    }

    /// =========================
    /// New Struct for Advanced Items
    /// =========================
    public struct TodoItem has store {
        description: String,
        status: u8, // 0 = pending, 1 = done, 2 = cancelled
    }

    public struct TodoListV2 has key, store {
        id: UID,
        name: String,
        items: vector<TodoItem>,
    }

    /// =========================
    /// Original Functions (unchanged)
    /// =========================
    public fun new(name: String, ctx: &mut TxContext): TodoList {
        TodoList {
            id: object::new(ctx),
            name,
            items: vector::empty(),
        }
    }

    public fun add(list: &mut TodoList, item: String) {
        vector::push_back(&mut list.items, item);
    }

    public fun remove(list: &mut TodoList, index: u64): String {
        vector::remove(&mut list.items, index)
    }

    public fun delete(list: TodoList) {
        let TodoList { id, name: _, items: _ } = list;
        object::delete(id);
    }

    public fun length(list: &TodoList): u64 {
        vector::length(&list.items)
    }

    public fun name(self: &TodoList): String {
        self.name
    }

    /// =========================
    /// New Functions for V2
    /// =========================
    public fun new_v2(name: String, ctx: &mut TxContext): TodoListV2 {
        TodoListV2 {
            id: object::new(ctx),
            name,
            items: vector::empty(),
        }
    }

    public fun add_v2(list: &mut TodoListV2, description: String) {
        let item = TodoItem {
            description,
            status: 0,
        };
        vector::push_back(&mut list.items, item);
    }

    public fun mark_done(list: &mut TodoListV2, index: u64) {
        let item_ref = &mut vector::borrow_mut(&mut list.items, index);
        item_ref.status = 1;
    }

    public fun cancel(list: &mut TodoListV2, index: u64) {
        let item_ref = &mut vector::borrow_mut(&mut list.items, index);
        item_ref.status = 2;
    }

    public fun remove_v2(list: &mut TodoListV2, index: u64): TodoItem {
        vector::remove(&mut list.items, index)
    }

    public fun delete_v2(list: TodoListV2) {
        let TodoListV2 { id, name: _, items: _ } = list;
        object::delete(id);
    }

    public fun length_v2(list: &TodoListV2): u64 {
        vector::length(&list.items)
    }

    public fun name_v2(self: &TodoListV2): String {
        self.name
    }
}
