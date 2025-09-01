import React, { useEffect, useState } from "react";
import { TransactionBlock, JsonRpcProvider, Connection } from "@mysten/sui.js";
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction, useWallets } from "@mysten/dapp-kit";
import { useToast } from "../hooks/use-toast"; // adjust path if needed

// Environment variables - these should be set in .env
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "YOUR_PACKAGE_ID";
const MODULE_NAME = import.meta.env.VITE_MODULE_NAME || "todo_list";
const SUI_RPC = import.meta.env.VITE_SUI_RPC || "https://fullnode.devnet.sui.io:443";

interface Todo {
  id: number;
  description: string;
  done: boolean;
  cancelled: boolean;
}

const Index: React.FC = () => {
  const provider = new JsonRpcProvider(new Connection({ fullnode: SUI_RPC }));
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const wallets = useWallets();
  const { toast } = useToast();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [todoListObjectId, setTodoListObjectId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  useEffect(() => {
    // show wallet dialog if no wallets available
    if (!wallets || wallets.length === 0) setShowWalletDialog(true);
  }, [wallets]);

  // fetch todos from chain for a TodoListV2 object
  const fetchTodosFromChain = async (objectId: string) => {
    try {
      const obj = await provider.getObject({ id: objectId });
      const fields = obj?.data?.content?.fields || obj?.details?.data?.fields;
      const items = fields?.items || [];
      const parsed = items.map((it: any, i: number) => {
        const desc = it?.fields?.description ?? it?.description ?? "";
        const status = it?.fields?.status ?? it?.status ?? 0;
        return {
          id: i,
          description: desc,
          done: status === 1,
          cancelled: status === 2,
        } as Todo;
      });
      setTodos(parsed);
    } catch (e) {
      console.error("fetchTodosFromChain error", e);
      toast?.({ title: "Failed to fetch todos", description: String(e), variant: "destructive" });
    }
  };

  const executeTransaction = (tx: TransactionBlock, action: string, onSuccessExtra?: (result: any) => void) => {
    if (!currentAccount) {
      toast?.({ title: "Wallet not connected", description: "Connect your wallet", variant: "destructive" });
      return;
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result: any) => {
          toast?.({ title: "Transaction successful", description: action });
          try {
            const created = result?.effects?.created;
            if (created && created.length > 0) {
              const objectId = created[0]?.reference?.objectId;
              if (objectId) {
                setTodoListObjectId(objectId);
                fetchTodosFromChain(objectId).catch(() => {});
              }
            } else if (todoListObjectId) {
              // refresh existing object
              fetchTodosFromChain(todoListObjectId).catch(() => {});
            }
          } catch (e) {
            console.warn("Could not parse created object id", e);
          }
          onSuccessExtra?.(result);
        },
        onError: (error: any) => {
          toast?.({ title: "Transaction failed", description: error?.message ?? String(error), variant: "destructive" });
          console.error("Transaction error:", error);
        },
      }
    );
  };

  const createTodoList = () => {
    if (!currentAccount) return;
    setIsCreatingList(true);
    const tx = new TransactionBlock();
    const listName = "My TodoList";
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::new_v2`,
      arguments: [tx.pure(listName)],
    });
    executeTransaction(tx, "Create todo list", () => setIsCreatingList(false));
  };

  const addTodo = () => {
    if (!newTodoDescription.trim() || !todoListObjectId) return;
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_v2`,
      arguments: [tx.object(todoListObjectId), tx.pure(newTodoDescription)],
    });
    executeTransaction(tx, "Add todo", () => {
      setNewTodoDescription("");
      if (todoListObjectId) fetchTodosFromChain(todoListObjectId).catch(() => {});
    });
  };

  const markDone = (index: number) => {
    if (!todoListObjectId) return;
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::mark_done`,
      arguments: [tx.object(todoListObjectId), tx.pure(BigInt(index), "u64")],
    });
    executeTransaction(tx, "Mark done");
  };

  const cancelTodo = (index: number) => {
    if (!todoListObjectId) return;
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::cancel`,
      arguments: [tx.object(todoListObjectId), tx.pure(BigInt(index), "u64")],
    });
    executeTransaction(tx, "Cancel todo");
  };

  const removeTodo = (index: number) => {
    if (!todoListObjectId) return;
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::remove_v2`,
      arguments: [tx.object(todoListObjectId), tx.pure(BigInt(index), "u64")],
    });
    executeTransaction(tx, "Remove todo");
  };

  const deleteTodoList = () => {
    if (!todoListObjectId) return;
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::delete_v2`,
      arguments: [tx.object(todoListObjectId)],
    });
    executeTransaction(tx, "Delete todo list", () => {
      setTodoListObjectId(null);
      setTodos([]);
    });
  };

  useEffect(() => {
    if (todoListObjectId) fetchTodosFromChain(todoListObjectId).catch(() => {});
  }, [todoListObjectId]);

  return (
    <div>
      <header>
        <ConnectButton />
      </header>

      <main>
        <h1>Todo List</h1>

        {!todoListObjectId ? (
          <button onClick={createTodoList} disabled={isCreatingList}>
            {isCreatingList ? "Creating..." : "Create Todo List"}
          </button>
        ) : (
          <div>
            <div>
              <input value={newTodoDescription} onChange={(e) => setNewTodoDescription(e.target.value)} />
              <button onClick={addTodo}>Add</button>
            </div>

            <ul>
              {todos.map((t) => (
                <li key={t.id}>
                  {t.description} {t.done ? "(done)" : ""} {t.cancelled ? "(cancelled)" : ""}
                  <button onClick={() => markDone(t.id)}>Done</button>
                  <button onClick={() => cancelTodo(t.id)}>Cancel</button>
                  <button onClick={() => removeTodo(t.id)}>Remove</button>
                </li>
              ))}
            </ul>

            <button onClick={deleteTodoList}>Delete list</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;