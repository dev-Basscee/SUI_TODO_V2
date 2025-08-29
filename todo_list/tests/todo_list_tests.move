#[test_only]
module todo_list::todo_list_tests {
    use std::string::String;
    use sui::test_scenario;
    use sui::transfer;
    use todo_list::todo_list::{Self, TodoList, TodoListV2};

    #[test]
    fun test_create_todolist() {
        let user = @0xCAFE;
        let scenario_val = test_scenario::begin(user);
        let mut scenario = scenario_val;

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let list = todo_list::new(string::utf8(b"Test"), ctx);
            transfer::public_share_object(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let list = test_scenario::take_shared<TodoList>(&scenario);
            assert!(todo_list::length(&list) == 0, 0);
            assert!(todo_list::name(&list) == string::utf8(b"Test"), 1);
            test_scenario::return_shared(list);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun add_item_to_todo() {
        let user = @0xCAFE;
        let item = string::utf8(b"Item1");
        let scenario_val = test_scenario::begin(user);
        let mut scenario = scenario_val;

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let list = todo_list::new(string::utf8(b"Test"), ctx);
            transfer::public_share_object(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut list = test_scenario::take_shared<TodoList>(&scenario);
            todo_list::add(&mut list, item);
            assert!(todo_list::length(&list) == 1, 0);
            test_scenario::return_shared(list);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun remove_item_from_todo() {
        let user = @0xCAFE;
        let item1 = string::utf8(b"Item1");
        let item2 = string::utf8(b"Item2");
        let item3 = string::utf8(b"Item3");

        let scenario_val = test_scenario::begin(user);
        let mut scenario = scenario_val;

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let list = todo_list::new(string::utf8(b"Test"), ctx);
            transfer::public_share_object(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut list = test_scenario::take_shared<TodoList>(&scenario);
            todo_list::add(&mut list, item1);
            todo_list::add(&mut list, item2);
            todo_list::add(&mut list, item3);
            assert!(todo_list::length(&list) == 3, 0);
            test_scenario::return_shared(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut list = test_scenario::take_shared<TodoList>(&scenario);
            let removed_item = todo_list::remove(&mut list, 0);
            assert!(removed_item == string::utf8(b"Item1"), 1);
            assert!(todo_list::length(&list) == 2, 0);
            test_scenario::return_shared(list);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_todolist_v2() {
        let user = @0xCAFE;
        let scenario_val = test_scenario::begin(user);
        let mut scenario = scenario_val;

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let list = todo_list::new_v2(string::utf8(b"Test V2"), ctx);
            transfer::public_share_object(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut list = test_scenario::take_shared<TodoListV2>(&scenario);
            todo_list::add_v2(&mut list, string::utf8(b"Task 1"));
            todo_list::add_v2(&mut list, string::utf8(b"Task 2"));
            assert!(todo_list::length_v2(&list) == 2, 0);
            test_scenario::return_shared(list);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut list = test_scenario::take_shared<TodoListV2>(&scenario);
            // Mark first task as done
            todo_list::mark_done(&mut list, 0);
            // Cancel second task
            todo_list::cancel(&mut list, 1);
            
            // Check statuses
            assert!(todo_list::get_item_status(&list, 0) == 1, 1); // done
            assert!(todo_list::get_item_status(&list, 1) == 2, 2); // cancelled
            
            test_scenario::return_shared(list);
        };

        test_scenario::end(scenario);
    }
}
