import React, { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check, X, Trash2, AlertTriangle } from 'lucide-react';

// Environment variables - these should be set in .env
const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || 'YOUR_PACKAGE_ID';
const MODULE_NAME = import.meta.env.VITE_MODULE_NAME || 'todo_list';

interface Todo {
  id: number;
  description: string;
  done: boolean;
  cancelled: boolean;
}

const Index = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [todoListObjectId, setTodoListObjectId] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);

  // Mock data for demonstration (in real app, fetch from Sui)
  useEffect(() => {
    if (currentAccount) {
      setTodos([
        { id: 0, description: 'Learn Sui blockchain development', done: false, cancelled: false },
        { id: 1, description: 'Build amazing dApps', done: true, cancelled: false },
        { id: 2, description: 'Deploy to mainnet', done: false, cancelled: true },
      ]);
      setTodoListObjectId('0x123...'); // Mock object ID
    }
  }, [currentAccount]);

  const executeTransaction = (tx: Transaction, action: string) => {
    if (!currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      });
      return;
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          toast({
            title: "Transaction successful",
            description: `${action} completed successfully`,
          });
          console.log('Transaction result:', result);
        },
        onError: (error) => {
          toast({
            title: "Transaction failed",
            description: error.message || "Something went wrong",
            variant: "destructive",
          });
          console.error('Transaction error:', error);
        },
      }
    );
  };

  const createTodoList = () => {
    if (!currentAccount) return;
    
    setIsCreatingList(true);
    const tx = new Transaction();
    
    // Create new todo list
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::new`,
      arguments: [],
    });

    executeTransaction(tx, "Todo list creation");
    setIsCreatingList(false);
  };

  const addTodo = () => {
    if (!newTodoDescription.trim() || !todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.string(newTodoDescription),
      ],
    });

    executeTransaction(tx, "Add todo");
    setNewTodoDescription('');
  };

  const markDone = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::mark_done`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Mark todo as done");
  };

  const cancelTodo = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::cancel`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Cancel todo");
  };

  const removeTodo = (index: number) => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::remove`,
      arguments: [
        tx.object(todoListObjectId),
        tx.pure.u64(index),
      ],
    });

    executeTransaction(tx, "Remove todo");
  };

  const deleteTodoList = () => {
    if (!todoListObjectId) return;

    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::delete`,
      arguments: [
        tx.object(todoListObjectId),
      ],
    });

    executeTransaction(tx, "Delete todo list");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-desert bg-clip-text text-transparent">
                Sui Todo Harmony
              </h1>
              <p className="text-muted-foreground mt-1">
                Blockchain-powered todo list on Sui network
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentAccount && (
                <div className="text-sm text-muted-foreground">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!currentAccount ? (
          <Card className="max-w-md mx-auto shadow-desert">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Sui Todo Harmony</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Connect your wallet to start managing your blockchain todos
              </p>
              <div className="p-4 bg-accent/20 rounded-lg">
                <p className="text-sm text-accent-foreground">
                  All actions require wallet approval for security
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !todoListObjectId ? (
          <Card className="max-w-md mx-auto shadow-desert">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Create Your Todo List</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Create a new todo list on the Sui blockchain
              </p>
              <Button
                onClick={createTodoList}
                disabled={isCreatingList || isPending}
                className="w-full bg-gradient-desert hover:opacity-90 transition-opacity"
              >
                {isCreatingList || isPending ? 'Creating...' : 'Create Todo List'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Add New Todo */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Todo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter todo description..."
                    value={newTodoDescription}
                    onChange={(e) => setNewTodoDescription(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="flex-1"
                  />
                  <Button
                    onClick={addTodo}
                    disabled={!newTodoDescription.trim() || isPending}
                    variant="secondary"
                  >
                    {isPending ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Todo List */}
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Todos ({todos.length})</CardTitle>
                <Button
                  onClick={deleteTodoList}
                  disabled={isPending}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Delete List
                </Button>
              </CardHeader>
              <CardContent>
                {todos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No todos yet. Add your first todo above!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todos.map((todo, index) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border hover:shadow-soft transition-shadow"
                      >
                        <div className="flex-1">
                          <p className={`${todo.done ? 'line-through text-muted-foreground' : ''} ${todo.cancelled ? 'line-through text-destructive' : ''}`}>
                            {todo.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {todo.done && (
                              <Badge variant="secondary" className="bg-primary/20 text-primary">
                                <Check className="h-3 w-3 mr-1" />
                                Done
                              </Badge>
                            )}
                            {todo.cancelled && (
                              <Badge variant="destructive" className="bg-destructive/20">
                                <X className="h-3 w-3 mr-1" />
                                Cancelled
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!todo.done && !todo.cancelled && (
                            <Button
                              onClick={() => markDone(index)}
                              disabled={isPending}
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {!todo.done && !todo.cancelled && (
                            <Button
                              onClick={() => cancelTodo(index)}
                              disabled={isPending}
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => removeTodo(index)}
                            disabled={isPending}
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-soft border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Blockchain Security</p>
                    <p>All actions require wallet approval and are recorded on the Sui blockchain. Transactions may take a few seconds to confirm.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;